// new code with text index for better search performance
import mongoose, { Model, Schema, Document } from "mongoose";

export interface IMaintenance extends Document{
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

const MaintenanceSchema = new Schema<IMaintenance>({
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

MaintenanceSchema.index({ cardName: "text" });


export const Maintenance: Model<IMaintenance> =
  mongoose.models.Maintenance || mongoose.model<IMaintenance>("Maintenancecards", MaintenanceSchema);
