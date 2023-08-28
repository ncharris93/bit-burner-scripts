/**
 * @returns Date string printed hh:mm:ss
 */
export const getTimeString = () => {
  const d = new Date();
  return `${d.getHours() % 12}:${d.getMinutes()}:${d.getSeconds()}`;
};
