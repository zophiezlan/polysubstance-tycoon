export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 10_000) {
    return (num / 1_000).toFixed(1) + 'k';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'k';
  }
  return Math.floor(num).toString();
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDecimal(num: number, places: number = 1): string {
  return num.toFixed(places);
}

export function getBarFill(current: number, max: number): number {
  return Math.max(0, Math.min(100, (current / max) * 100));
}

export function getConfidenceEmoji(confidence: number): string {
  if (confidence >= 95) return '🙂';
  if (confidence >= 85) return '😊';
  if (confidence >= 75) return '😌';
  if (confidence >= 50) return '🙂';
  if (confidence >= 30) return '😐';
  return '😟';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 95) return "You've never felt better!";
  if (confidence >= 85) return 'Feeling good!';
  if (confidence >= 75) return 'Pretty confident';
  if (confidence >= 50) return 'Doing okay';
  if (confidence >= 30) return 'A bit uncertain';
  return 'Stressed';
}
