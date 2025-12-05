import { Schema, model, Document } from 'mongoose';

export interface IVibe extends Document {
  restaurantId: Schema.Types.ObjectId;
  key: string; // identifier e.g., 'energy'
  label: string; // display label e.g., 'انرژی'
  emoji?: string; // optional emoji
  active: boolean;
}

const vibeSchema = new Schema<IVibe>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  key: { type: String, required: true },
  label: { type: String, required: true },
  emoji: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

vibeSchema.index({ restaurantId: 1, key: 1 }, { unique: true });

export const Vibe = model<IVibe>('Vibe', vibeSchema);
