import { Schema, Document, model } from 'mongoose';

/*********************TYPE & INTERFACE*****************************/

export type AuthTokenType = {
  token: string;
  expiresAt: string;
};

export type TokenType = {
  accessToken: AuthTokenType;
  refreshToken: AuthTokenType;
  resetPasswordToken: AuthTokenType;
  user_id: string;
};

/*******************************SCHEMA*****************************/

export type TokenTypeModel = TokenType & Document;

const AuthToken = {
  token: { type: String, required: true },
  expiresAt: { type: String, required: true }
};

export const TokenSchema = new Schema(
  {
    accessToken: { type: AuthToken, required: false },
    refreshToken: { type: AuthToken, required: false },
    resetPasswordToken: { type: AuthToken, required: false },
    user_id: { type: String, required: true }
  },
  { timestamps: true }
);

export default model<TokenTypeModel>('Token', TokenSchema);
