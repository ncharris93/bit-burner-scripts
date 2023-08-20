import { NS } from '@ns';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const sleepTime = parseInt(`${ns.args[1]}`) || 0;
  await ns.sleep(sleepTime);
  await ns.grow(target);
  //   const currentMoney = ns.getServerMoneyAvailable(target);
  //   const maxMoney = ns.getServerMaxMoney(target);
  //   console.log(`[${ns.getHostname()}]: Grow on ${target} resulted in new value of ${currentMoney} - max: ${maxMoney}`);
  console.log(new Date().getTime(), 'DONE GROW');

  //   await ns.sleep(10_000_000);
}
