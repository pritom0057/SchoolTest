import { Schema, model } from 'mongoose';

const stepRuleSchema = new Schema({
    thresholds: [{ min: Number, award: { type: String, default: null } }],
    lockStep1Below: { type: Number, default: 0 },
    unlockNextAt: { type: Number, default: 75 },
}, { _id: false });

const policySchema = new Schema({
    step1: stepRuleSchema,
    step2: stepRuleSchema,
    step3: stepRuleSchema,
}, { timestamps: true });

export const Policy = model('Policy', policySchema);
