import { NS } from '@ns';

const ArgsOpts = ['hack', 'weaken', 'grow'] as const;
type Args = (typeof ArgsOpts)[number];

/**
 *  @param [type, target, sleep, timer]
 * timer is a debug feature which lets me show how much time elapsed
 */
export async function main(ns: NS) {
  const type = ns.args[0] as Args;
  if (!ArgsOpts.includes(type)) {
    throw new Error(`Invalid Fn Type`);
  }

  console.log(`[${type}]: Init`);
  const target = ns.args[1] as string;
  const sleepTime = parseInt(`${ns.args[2]}`) || 0;
  const startTime = parseInt(`${ns.args[3]}`) || Date.now();
  console.log(`[${type}]: sleeping: ${sleepTime}`);
  await ns.sleep(sleepTime);

  console.log(`${Date.now()} [${type}]: start`);

  console.log(`HWG ${target} ARGS: `, ns.args);

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
  console.log(`${endTime} ms:${endTime - startTime} [${type}]: fin. res: ${res}`);
  if (type === 'hack') {
    console.log(`[${ns.getHostname()}]: ${new Date().getTime()} HACK COMPLETE, $${res}`);
  }
}
