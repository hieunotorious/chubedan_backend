import { Schema, model, Document } from "mongoose";
import { ProductCart, ProductCartType } from "../cart";
/*********************TYPE & INTERFACE*****************************/

export enum Gender {
  Male = "MALE",
  Female = "FEMALE",
  other = "OTHER",
}
export enum Role {
  user = "USER",
  admin = "ADMIN",
}

export type UserType = {
  username: string;
  password: string;
  email: string;
  displayName: string;
  address: string;
  phonenumber: string;
  dob: string;
  gender: Gender;
  role: Role;
  cart: ProductCartType[];
};

export type UserTypeModel = {} & UserType & Document;

/*******************************SCHEMA*****************************/

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  displayName: { type: String, required: true },
  address: { type: String, required: true },
  phonenumber: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "OTHER" },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  cart: [ProductCart],
});

export default model<UserTypeModel>("User", userSchema);
