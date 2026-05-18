export function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("zh-CN", { hour12: false });
}

export function formatAge(ageMs) {
  if (ageMs === null || ageMs === undefined) return "-";
  if (ageMs < 1000) return "刚刚";
  if (ageMs < 60000) return `${Math.round(ageMs / 1000)} 秒前`;
  return `${Math.round(ageMs / 60000)} 分钟前`;
}

export function formatMs(value) {
  if (value === null || value === undefined) return "-";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "-";
  if (numberValue >= 1000) return `${(numberValue / 1000).toFixed(1)}s`;
  return `${Math.round(numberValue)}ms`;
}

export function formatLogTime(log) {
  return log.time || formatTime(log.timestamp || log.receivedAt);
}
