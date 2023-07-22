import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { floor } from 'lodash';
import moment from 'moment';
import mongoose from 'mongoose';
import { User } from 'src/models';
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

let refreshTokens: string[] = [];

const signup = async (req: Request, res: Response) => {
  try {
    const { email, username, password, displayName, dob }: UserType = req.body;
    const findUser = await User.find({ email });

    if (findUser.length > 0) {
      return res.status(500).json({ message: 'error.auth.user_already_existed' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const _id = new mongoose.Types.ObjectId();
      const user = new User({
        _id,
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
        const expiredDate = moment().add(7, 'days').format();
        const token = tokenGen({ _id: _id.toString(), role: savedUser.role }, 7);
        const refreshToken = tokenGen({ _id: _id.toString() }, 30);
        refreshTokens.push(refreshToken);
        return res.status(201).json({ accessToken: token, expiredDate, refreshToken });
      }
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const logout = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    }
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
      const compare = await bcrypt.compare(password, user.password);
      if (compare) {
        const expiredDate = moment().add(7, 'days').format();
        const token = tokenGen({ _id: user._id.toString(), role: user.role }, 7);
        const refreshToken = tokenGen({ _id: user._id.toString() }, 30);
        refreshTokens.push(refreshToken);
        return res.status(200).json({ accessToken: token, expiredDate, refreshToken });
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
    if (refreshToken && refreshTokens.findIndex((token) => token === refreshToken) > -1) {
      const { _id } = parseJwt(refreshToken);
      const user = await User.findById(_id);
      if (user) {
        const expiredDate = floor(moment().add(7, 'days').valueOf() / 1000);
        const token = tokenGen({ _id: user._id.toString(), role: user.role }, 7);
        refreshTokens.push(refreshToken);
        return res.status(200).json({ accessToken: token, expiredDate });
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
        if (updatedUser) {
          const expiredDate = moment().add(7, 'days').format();
          const token = tokenGen({ _id: user._id.toString(), role: user.role }, 7);
          const refreshToken = tokenGen({ _id: user._id.toString() }, 30);
          refreshTokens.push(refreshToken);
          return res.status(200).json({
            accessToken: token,
            expiredDate,
            refreshToken
          });
        } else res.status(500).json({ message: 'error.user.failed_to_change_password' });
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
    const token = resetPasswordTokenGen(email, code);
    await sendResetPasswordEmail(email, token);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password }: ResetPasswordRequest = req.body;

    if (!token) return res.status(401).json({ message: 'error.auth.access_denied' });

    jwt.verify(token, process.env.JWT_KEY || '');

    const { email } = parseJwt(token);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email },
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
