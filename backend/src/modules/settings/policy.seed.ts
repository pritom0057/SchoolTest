import { Policy } from './policy.model.js'

export async function seedDefaultPolicyIfEmpty() {
    const count = await Policy.countDocuments()
    if (count > 0) return
    await Policy.create({
        step1: {
            // <25% = fail & lock, 25–49.99 = A1, 50–74.99 = A2, >=75 = A2 + proceed
            thresholds: [
                { min: 25, award: 'A1' },
                { min: 50, award: 'A2' },
            ],
            lockStep1Below: 25,
            unlockNextAt: 75,
        },
        step2: {
            // <25% remain at A2 (no award change), 25–49.99 = B1, 50–74.99 = B2, >=75 = B2 + proceed
            thresholds: [
                { min: 25, award: 'B1' },
                { min: 50, award: 'B2' },
            ],
            lockStep1Below: 0,
            unlockNextAt: 75,
        },
        step3: {
            // <25% remain at B2 (no award change), 25–49.99 = C1, >=50 = C2
            thresholds: [
                { min: 25, award: 'C1' },
                { min: 50, award: 'C2' },
            ],
            lockStep1Below: 0,
            unlockNextAt: 0,
        },
    })
    console.log('✅ Seeded default assessment policy')
}
