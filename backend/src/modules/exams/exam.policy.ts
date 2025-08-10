export function applyStepPolicy(step: 1|2|3, score: number) {
  if (step === 1) {
    if (score < 25) return { awarded: null as any, next: false, lockStep1: true };
    if (score < 50) return { awarded: 'A1' as const, next: false };
    if (score < 75) return { awarded: 'A2' as const, next: false };
    return { awarded: 'A2' as const, next: true };
  }
  if (step === 2) {
    if (score < 25) return { awarded: 'A2' as const, next: false };
    if (score < 50) return { awarded: 'B1' as const, next: false };
    if (score < 75) return { awarded: 'B2' as const, next: false };
    return { awarded: 'B2' as const, next: true };
  }
  // step 3
  if (score < 25) return { awarded: 'B2' as const, next: false };
  if (score < 50) return { awarded: 'C1' as const, next: false };
  return { awarded: 'C2' as const, next: false };
}
