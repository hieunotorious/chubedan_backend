import { NextFunction, Request, Response } from 'express';
import { User } from '../../models';
import { getIdFromReq } from '../../utils/token';

const getSelfUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _id = getIdFromReq(req);
    const user = await User.findById(_id);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const updateSelfUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _id = getIdFromReq(req);
    const { displayName, username, dob, phoneNumber, gender, address } = req.body;
    const findUser = await User.find({ username });
    if (findUser.length > 0 && findUser[0]._id.toString() !== _id) {
      return res.status(500).json({ message: 'Username already existed' });
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

export default {
  getSelfUser,
  updateSelfUser
};
