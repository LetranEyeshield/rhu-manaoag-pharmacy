// new code with text index for better search performance
import mongoose, { Model, Schema } from "mongoose";
import { MedscardType } from "../types/Medscard";

const MedscardSchema = new Schema<MedscardType>({
  cardName: { type: String, required: true, trim: true },
  cardDate: { type: Date },
  initialStock: { type: String },
  qtyIn: { type: String },
  lotNoIn: { type: String },
  expiryIn: { type: String },
  qtyOut: { type: String },
  lotNoOut: { type: String },
  expiryOut: { type: String },
  balance: { type: String },
});

MedscardSchema.index({ cardName: "text" });


export const Medscard: Model<MedscardType> =
  mongoose.models.Medscards || mongoose.model<MedscardType>("Medscards", MedscardSchema);
