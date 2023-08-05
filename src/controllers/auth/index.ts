import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import mongoose from 'mongoose';
import { Token, User } from 'src/models';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from 'src/models/auth';
import { Role, UserType } from 'src/models/user';
import { sendResetPasswordEmail } from 'src/utils/email';
import {
  generateCode,
  getIdFromReq,
  parseJwt,
  resetPasswordTokenGen,
  tokenGen
} from 'src/utils/token';

const signup = async (req: Request, res: Response) => {
  try {
    const { email, username, password, displayName, dob }: UserType = req.body;
    const findUser = await User.find({ email });

    if (findUser.length > 0) {
      return res.status(500).json({ message: 'error.auth.user_already_existed' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user_id = new mongoose.Types.ObjectId();
      const user = new User({
        _id: user_id,
        displayName,
        email,
        username,
        password: hashedPassword,
        role: Role.user,
        dob: moment(dob).format('DD/MM/YYYY'),
        cart: []
      });
      const savedUser = await user.save();
      if (savedUser) {
        const accessTokenExpired = moment().add(7, 'days').format();
        const refreshTokenExpired = moment().add(365, 'days').format();
        const accessToken = tokenGen({ _id: user_id.toString(), role: savedUser.role }, 7);
        const refreshToken = tokenGen({ _id: user_id.toString() }, 365);
        const token_id = new mongoose.Types.ObjectId();
        const token = new Token({
          _id: token_id,
          user_id: user_id.toString(),
          accessToken: {
            token: accessToken,
            expiresAt: accessTokenExpired
          },
          refreshToken: {
            token: refreshToken,
            expiresAt: refreshTokenExpired
          }
        });
        await token.save();
        return res.status(201).json({ accessToken, expiredDate: accessTokenExpired, refreshToken });
      }
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const user_id = getIdFromReq(req);
    await Token.findOneAndUpdate(
      { user_id },
      {
        $set: {
          refreshToken: null,
          accessToken: null
        }
      }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const findUser = username ? await User.find({ username }) : await User.find({ email });
    if (findUser.length > 0) {
      const user = findUser[0];
      const user_id = user._id.toString();
      const compare = await bcrypt.compare(password, user.password);
      if (compare) {
        const accessTokenExpired = moment().add(7, 'days').format();
        const refreshTokenExpired = moment().add(365, 'days').format();
        const accessToken = tokenGen({ _id: user_id, role: user.role }, 7);
        const refreshToken = tokenGen({ _id: user_id }, 365);
        await Token.findOneAndUpdate(
          { user_id: user._id },
          {
            $set: {
              accessToken: {
                token: accessToken,
                expiresAt: accessTokenExpired
              },
              refreshToken: {
                token: refreshToken,
                expiresAt: refreshTokenExpired
              }
            }
          }
        );
        return res.status(200).json({ accessToken, expiredDate: accessTokenExpired, refreshToken });
      } else {
        return res.status(500).json({ message: 'error.auth.incorrect_password' });
      }
    } else {
      return res.status(500).json({ message: 'error.auth.invalid' });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const token = await Token.findOne({ 'refreshToken.token': refreshToken });
    if (token) {
      const { _id } = parseJwt(refreshToken);
      if (token.user_id !== _id)
        return res.status(500).json({ message: 'error.auth.invalid_token' });
      const user = await User.findById(_id);
      if (user) {
        const accessTokenExpired = moment().add(7, 'days').format();
        const accessToken = tokenGen({ _id: user._id.toString(), role: user.role }, 7);
        token.accessToken.token = accessToken;
        token.accessToken.expiresAt = accessTokenExpired;
        await token.save();
        return res.status(200).json({ accessToken, expiredDate: accessTokenExpired });
      } else {
        return res.status(404).json({ message: 'error.user.not_found' });
      }
    } else {
      return res.status(500).json({ message: 'error.auth.invalid_token' });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const { password, newPassword }: ChangePasswordRequest = req.body;
    const user = await User.findById(_id);
    if (user) {
      const compare = await bcrypt.compare(password, user.password);
      if (compare) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findOneAndUpdate(
          { _id },
          { $set: { password: hashedPassword } },
          { new: true }
        );
        if (!updatedUser)
          return res.status(500).json({ message: 'error.user.failed_to_change_password' });
        return res.status(200).json({ success: true });
      } else {
        return res.status(500).json({ message: 'error.auth.incorrect_password' });
      }
    }
    return res.status(500).json({ message: 'error.user.not_found' });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email }: ForgotPasswordRequest = req.body;
    const user = await User.find({ email });
    if (user.length < 1) return res.status(500).json({ message: 'error.user.not_found' });
    const code = generateCode();
    const resetPasswordToken = resetPasswordTokenGen(code);
    const resetPasswordExpired = moment().add(15, 'minutes').format();
    await Token.findOneAndUpdate(
      { _id: user[0]._id.toString() },
      {
        $set: {
          resetPasswordToken: {
            token: resetPasswordToken,
            expiresAt: resetPasswordExpired
          }
        }
      }
    );
    await sendResetPasswordEmail(email, resetPasswordToken);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password }: ResetPasswordRequest = req.body;

    if (!token) return res.status(401).json({ message: 'error.auth.access_denied' });
    const findToken = await Token.findOne({ 'resetPasswordToken.token': token });
    if (!findToken) return res.status(401).json({ message: 'error.auth.access_denied' });
    jwt.verify(token, process.env.JWT_KEY || '');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { _id: findToken.user_id },
      {
        $set: {
          password: hashedPassword
        }
      },
      { new: true }
    );
    if (!user) return res.status(500).json({ message: 'error.auth.failed_to_reset_password' });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(401).json({ message: 'error.auth.invalid_token' });
  }
};

export default {
  logout,
  login,
  signup,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword
};
