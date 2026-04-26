export const safeDate = (value: any) => {
  if (!value) return null;

  const date = new Date(value);

  if (isNaN(date.getTime())) return null;

  return date.toISOString().split("T")[0];
};