import { Schema, model } from 'mongoose';

const competencySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    active: { type: Boolean, default: true },
}, { timestamps: true });

export const Competency = model('Competency', competencySchema);
