import { NS } from '@ns';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  await ns.grow(target);
  const currentMoney = ns.getServerMoneyAvailable(target);
  const maxMoney = ns.getServerMaxMoney(target);
  console.log(`[${ns.getHostname()}]: Grow on ${target} resulted in new value of ${currentMoney} - max: ${maxMoney}`);

  //   await ns.sleep(10_000_000);
}
