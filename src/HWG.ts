import { NS } from '@ns';

const ArgsOpts = ['hack', 'weaken', 'grow'] as const;
type Args = (typeof ArgsOpts)[number];

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

const getTimeString = () => {
  const d = new Date();
  const hours = d.getHours() % 12;
  const h = hours < 10 ? '0' + hours : hours;
  const min = d.getMinutes();
  const m = min < 10 ? '0' + min : min;
  const sec = d.getSeconds();
  const s = sec < 10 ? '0' + sec : sec;
  return `${h}:${m}:${s}`;
};

export const Log = {
  info: (msg: string) => `${colors.cyan}${msg}${colors.reset}`,
  debug: (msg: string) => `${colors.green2}${msg}${colors.reset}`,
  warn: (msg: string) => `${colors.orange}${msg}${colors.reset}`,
  error: (msg: string) => `${colors.red}${msg}${colors.reset}`,
};

/**
 *  @param [type, target, sleep, timer, hostForLogging, threads]
 * timer is a debug feature which lets me show how much time elapsed
 */
let timer = Date.now();
export async function main(ns: NS) {
  const iterationID = ns.args[4] || '0';
  const type = ns.args[0] as Args;
  if (!ArgsOpts.includes(type)) {
    throw new Error(`Invalid Fn Type`);
  }

  //  console.log(`[${type}]: Init`);
  const target = ns.args[1] as string;
  const sleepTime = parseInt(`${ns.args[2]}`) || 0;
  const startTime = parseInt(`${ns.args[3]}`) || Date.now();
  const host = `${ns.args[5]}`;
  const threadCount = `${ns.args[6]}`;
  //   console.log(`[${iterationID}] [${type}]: sleeping: ${sleepTime}`);
  await ns.sleep(sleepTime);

  //  console.log(`${Date.now()} [${type}]: start`);

  //   console.log(`HWG ${target} ARGS: `, ns.args);

  let res;
  if (type === 'grow') {
    res = await ns.grow(target);
  } else if (type === 'hack') {
    res = await ns.hack(target);
  } else if (type === 'weaken') {
    res = await ns.weaken(target);
  }
  //   const res = await ns[type](target);

  //   const endTime = Date.now();
  //   const extra = type === 'hack' ? endTime - timer : '';
  //   false &&
  //     //   type === 'hack' &&
  //     console.log(
  //       `[${host}.${target}.${iterationID}] threads:${threadCount} ${endTime} ms:${
  //         endTime - startTime
  //       } [${type}]: fin. res: ${res}, ${extra}`,
  //     );
  const meta = `[${getTimeString()}][${pad(host)} => ${pad(target)}][${iterationID}]`;
  if (type === 'hack') {
    if (res === 0) {
      return ns.print(Log.warn(`${meta} Hack Waisted Cycles :( $${res}`));
      // return ns.print(`WARN: ${meta} Hack Waisted Cycles :( $${res}`);
    }
    if (!res) {
      return ns.print(`ERROR: ${meta} Hack Failure`);
    }
    ns.print(Log.info(`${meta} Hack Success: $${ns.formatNumber(res)}`));
    //  ns.print(`SUCCESS: [${host} -> ${target}][${iterationID}] Hack Success: ${ns.formatNumber(parseInt(res))}`);
    //  console.log('typeof res? ', typeof res);

    //   if(!res) {
    //    ns.print(`ERROR: [${host} -> ${target}] Hack Failure $${res}`)
    // }
    //  console.log(
    //    `[${iterationID}] [${host}][${target}]:${endTime - startTime} HACK ${
    //      res ? 'SUCCESS' : 'FAILURE'
    //    }, ${res}, TIME since last: ${endTime - timer}`,
    //  );
    timer = Date.now();
  } else {
    return ns.print(Log.info(`${meta} HWG: ${type} $${res}`));
  }
}

const pad = (str: string, size = 15) => str.padStart(size, ' ');
