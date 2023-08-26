import { NS } from '@ns';

const ArgsOpts = ['hack', 'weaken', 'grow'] as const;
type Args = (typeof ArgsOpts)[number];

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

  const endTime = Date.now();
  const extra = type === 'hack' ? endTime - timer : '';
  false &&
    //   type === 'hack' &&
    console.log(
      `[${host}.${target}.${iterationID}] threads:${threadCount} ${endTime} ms:${
        endTime - startTime
      } [${type}]: fin. res: ${res}, ${extra}`,
    );
  if (type === 'hack') {
    if (res === 0) {
      ns.tprint(`WARN: [${host} -> ${target}][${iterationID}] Hack Waisted Cycles :( $${res}`);
    }
    if (!res) {
      ns.tprint(`ERROR: [${host} -> ${target}][${iterationID}] Hack Failure`);
    }
    ns.tprint(`SUCCESS: [${host} -> ${target}][${iterationID}] Hack Success: ${res}`);
    //  ns.tprint(`SUCCESS: [${host} -> ${target}][${iterationID}] Hack Success: ${ns.formatNumber(parseInt(res))}`);
    console.log('typeof res? ', typeof res);

    //   if(!res) {
    //    ns.tprint(`ERROR: [${host} -> ${target}] Hack Failure $${res}`)
    // }
    //  console.log(
    //    `[${iterationID}] [${host}][${target}]:${endTime - startTime} HACK ${
    //      res ? 'SUCCESS' : 'FAILURE'
    //    }, ${res}, TIME since last: ${endTime - timer}`,
    //  );
    timer = Date.now();
  }
}
