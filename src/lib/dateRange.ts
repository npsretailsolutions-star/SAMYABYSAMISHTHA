// Admin date filters are entered in Indian time; the server runs in UTC, so pin the offset.
export function parseDateRange(from?: string, to?: string) {
  const range: { gte?: Date; lte?: Date } = {};
  if (from) range.gte = new Date(`${from}T00:00:00+05:30`);
  if (to) range.lte = new Date(`${to}T23:59:59.999+05:30`);
  return range;
}
