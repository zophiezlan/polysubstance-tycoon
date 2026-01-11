const SUFFIXES = [
  { value: 1e0, suffix: '' },
  { value: 1e3, suffix: 'K' },      // Thousand
  { value: 1e6, suffix: 'M' },      // Million
  { value: 1e9, suffix: 'B' },      // Billion
  { value: 1e12, suffix: 'T' },     // Trillion
  { value: 1e15, suffix: 'Qa' },    // Quadrillion
  { value: 1e18, suffix: 'Qi' },    // Quintillion
  { value: 1e21, suffix: 'Sx' },    // Sextillion
  { value: 1e24, suffix: 'Sp' },    // Septillion
  { value: 1e27, suffix: 'Oc' },    // Octillion
  { value: 1e30, suffix: 'No' },    // Nonillion
  { value: 1e33, suffix: 'Dc' },    // Decillion
  { value: 1e36, suffix: 'Ud' },    // Undecillion
  { value: 1e39, suffix: 'Dd' },    // Duodecillion
  { value: 1e42, suffix: 'Td' },    // Tredecillion
  { value: 1e45, suffix: 'Qad' },   // Quattuordecillion
  { value: 1e48, suffix: 'Qid' },   // Quindecillion
  { value: 1e51, suffix: 'Sxd' },   // Sexdecillion
  { value: 1e54, suffix: 'Spd' },   // Septendecillion
  { value: 1e57, suffix: 'Ocd' },   // Octodecillion
  { value: 1e60, suffix: 'Nod' },   // Novemdecillion
  { value: 1e63, suffix: 'Vg' },    // Vigintillion
];

export function formatNumber(num: number, decimals: number = 3): string {
  if (num < 0) {
    return '-' + formatNumber(-num, decimals);
  }

  if (num < 1000) {
    return Math.floor(num).toLocaleString();
  }

  // Find appropriate suffix
  for (let i = SUFFIXES.length - 1; i >= 0; i--) {
    const { value, suffix } = SUFFIXES[i];
    if (num >= value) {
      const formatted = (num / value).toFixed(decimals);
      // Remove trailing zeros and decimal point if not needed
      const cleaned = formatted.replace(/\.?0+$/, '');
      return cleaned + suffix;
    }
  }

  return num.toFixed(0);
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
