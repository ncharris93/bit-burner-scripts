import { NS } from '@ns';

const ArgsOpts = ['hack', 'weaken', 'grow'] as const;
type Args = (typeof ArgsOpts)[number];

/**
 *  @param [type, target, sleep, timer, hostForLogging]
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

  const endTime = Date.now();
  const extra = type === 'hack' ? endTime - timer : '';
  //   false &&
  //   type === 'hack' &&
  console.log(
    `[${host}.${target}.${iterationID}] ${endTime} ms:${endTime - startTime} [${type}]: fin. res: ${res}, ${extra}`,
  );
  if (type === 'hack') {
    //   console.log(
    //       `[${iterationID}] [${ns.getHostname()}][${target}]:${
    //         endTime - startTime
    //       } HACK COMPLETE, $${res}, TIME since last: ${endTime - timer}`,
    //     );
    timer = Date.now();
  }
}
