import { Schema, model, Types } from 'mongoose';

const certSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  highestLevel: { type: String, enum: ['A1','A2','B1','B2','C1','C2'], required: true },
  sourceExamId: { type: Types.ObjectId, ref: 'Exam', required: true },
  serial: { type: String, unique: true, required: true },
  pdfPath: String,
}, { timestamps: true });

export const Certificate = model('Certificate', certSchema);
