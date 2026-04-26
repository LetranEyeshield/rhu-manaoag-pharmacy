// new code with text index for better search performance
import mongoose, { Model, Schema, Document } from "mongoose";

export interface IVitaminscard extends Document{
  cardName: string;
  cardDate: Date;
  initialStock?: string;
  qtyIn?: string;
  lotNoIn?: string;
  expiryIn?: string;
  qtyOut?: string;
  lotNoOut?: string;
  expiryOut?: string;
  balance?: string;
}

const VitaminscardSchema = new Schema<IVitaminscard>({
  cardName: { type: String, required: true, trim: true },
  cardDate: { type: Date, required: true },
  initialStock: { type: String },
  qtyIn: { type: String },
  lotNoIn: { type: String },
  expiryIn: { type: String },
  qtyOut: { type: String },
  lotNoOut: { type: String },
  expiryOut: { type: String },
  balance: { type: String },
});

VitaminscardSchema.index({ cardName: "text" });


export const Vitaminscard: Model<IVitaminscard> =
  mongoose.models.Vitaminscard || mongoose.model<IVitaminscard>("Vitaminscard", VitaminscardSchema);
