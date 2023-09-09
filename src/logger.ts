/**
 * @returns Date string printed hh:mm:ss
 */
export const getTimeString = () => {
  const d = new Date();
  const hours = d.getHours() % 12;
  const h = hours < 10 ? '0' + hours : hours;
  const min = d.getMinutes();
  const m = min < 10 ? '0' + min : min;
  const sec = d.getSeconds();
  const s = sec < 10 ? '0' + sec : sec;
  return `${h}:${m}:${s}`;
};

export const colors = {
  red: `\u001b[31m`, //red
  orange: `\u001b[38;5;202m`, //orange
  yellow: `\u001b[33m`, //yellow
  white: `\u001b[37m`, //white
  lightGreen: `\u001b[38;5;121m`, // light green
  green: `\u001b[32m`, //green
  green2: `\u001b[38;5;82m`, //green
  cyan: `\u001b[36m`, //cyan
  reset: '\u001b[0m',
} as const;

export const Log = {
  info: (msg: string) => `${colors.cyan}${msg}${colors.reset}`,
  debug: (msg: string) => `${colors.green2}${msg}${colors.reset}`,
  warn: (msg: string) => `${colors.orange}${msg}${colors.reset}`,
  error: (msg: string) => `${colors.red}${msg}${colors.reset}`,
};

export const pad = (str: string | number, amt = 5) => `${str}`.padStart(amt, ' ');
