export function scorePercent(attempts: { isCorrect: boolean }[], total: number) {
  const correct = attempts.filter(a => a.isCorrect).length;
  return (correct / total) * 100;
}
