import mongoose, { Model, Schema, Document } from "mongoose";


export interface IUser extends Document {
  username: string;
  password: string;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
