import mongoose, { Model } from "mongoose";
import { UserType } from "../types/User";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const User: Model<UserType> =
  mongoose.models.User || mongoose.model<UserType>("User", UserSchema);
