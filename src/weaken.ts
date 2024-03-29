import { NS } from '@ns';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const sleepTime = parseInt(`${ns.args[1]}`) || 0;
  await ns.sleep(sleepTime);
  await ns.weaken(target);
  console.log(new Date().getTime(), 'DONE WEAKEN');

  //   const secLevel = ns.getServerSecurityLevel(target);
  //   const min = ns.getServerMinSecurityLevel(target);
  //   console.log(`[${ns.getHostname()}]: weaken on ${target} resulted in new value of ${secLevel} - min: ${min}`);
}
