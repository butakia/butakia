export function parseDurationToSeconds(duration: string | null | undefined): number | null {
  if (!duration) return null;
  const hoursMatch = duration.match(/(\d+)\s*h/i);
  const minutesMatch = duration.match(/(\d+)\s*m/i);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  if (!hours && !minutes) return null;
  return hours * 3600 + minutes * 60;
}
