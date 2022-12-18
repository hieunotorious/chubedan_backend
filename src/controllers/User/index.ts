import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import moment from "moment";
import { floor } from "lodash";
import User, { Role, UserType } from "../../models/user";
import { tokenGen, getIdFromReq, parseJwt } from "../../utils/token";

let refreshTokens: string[] = [];

const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password } = req.body as UserType;
    const findUser = await User.find({ email });

    if (findUser.length > 0) {
      return res.status(500).json({ message: "User already existed" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const _id = new mongoose.Types.ObjectId();
      const user = new User({
        _id,
        displayName: username,
        email,
        username,
        password: hashedPassword,
        address: "None",
        phonenumber: "0123456789",
        role: Role.user,
        dob: moment().format(),
        cart: [],
      });
      const savedUser = await user.save();
      if (savedUser) {
        const expiredDate = floor(moment().add(7, "days").valueOf() / 1000);
        const token = tokenGen(
          { _id: _id.toString(), role: savedUser.role },
          7
        );
        const refreshToken = tokenGen({ _id: _id.toString() }, 30);
        refreshTokens.push(refreshToken);
        return res
          .status(201)
          .json({ accessToken: token, expiredDate, refreshToken });
      }
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const logout = (req: Request, res: Response, next: NextFunction) => {
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

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password } = req.body;
    const findUser = username
      ? await User.find({ username })
      : await User.find({ email });
    if (findUser.length > 0) {
      const user = findUser[0];
      const compare = await bcrypt.compare(password, user.password);
      if (compare) {
        const expiredDate = floor(moment().add(7, "days").valueOf() / 1000);
        const token = tokenGen(
          { _id: user._id.toString(), role: user.role },
          7
        );
        const refreshToken = tokenGen({ _id: user._id.toString() }, 30);
        refreshTokens.push(refreshToken);
        return res
          .status(200)
          .json({ accessToken: token, expiredDate, refreshToken });
      } else {
        return res.status(500).json({ message: "Incorrect Password" });
      }
    } else {
      return res.status(500).json({ message: "Invalid Email or Username" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getSelfUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _id = getIdFromReq(req);
    const user = await User.findById(_id);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const updateSelfUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = getIdFromReq(req);
    const { displayName, username, dob, phoneNumber, gender, address } =
      req.body;
    const findUser = await User.find({ username });
    if (findUser.length > 0 && findUser[0]._id.toString() !== _id) {
      return res.status(500).json({ message: "Username already existed" });
    } else {
      const updatedUser = await User.findOneAndUpdate(
        { _id },
        { $set: { displayName, username, dob, phoneNumber, address, gender } },
        { new: true }
      );
      return res.status(200).json(updatedUser);
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (
      refreshToken &&
      refreshTokens.findIndex((token) => token === refreshToken) > -1
    ) {
      const { _id } = parseJwt(refreshToken);
      const user = await User.findById(_id);
      if (user) {
        const expiredDate = floor(moment().add(7, "days").valueOf() / 1000);
        const token = tokenGen(
          { _id: user._id.toString(), role: user.role },
          7
        );
        refreshTokens.push(refreshToken);
        return res.status(200).json({ accessToken: token, expiredDate });
      } else {
        return res.status(404).json({ message: "User Not Found" });
      }
    } else {
      return res.status(500).json({ message: "Invalid Refresh Token" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export default {
  logout,
  login,
  signup,
  getSelfUser,
  updateSelfUser,
  refreshToken,
};
