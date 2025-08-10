import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
  competency: { type: String, required: true },
  level: { type: String, enum: ['A1','A2','B1','B2','C1','C2'], required: true },
  text: { type: String, required: true },
  options: [{ key: String, text: String, _id: false }],
  correctKey: { type: String, required: true },
  tags: [String],
  active: { type: Boolean, default: true }
}, { timestamps: true });

questionSchema.index({ competency: 1, level: 1, active: 1 });

export const Question = model('Question', questionSchema);
