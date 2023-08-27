export const timeStr = () => {
  const d = new Date();
  return `${d.getHours() % 12}:${d.getMinutes()}:${d.getSeconds()}`;
};
