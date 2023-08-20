import { NS } from '@ns';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const earnedMoney = await ns.hack(target);
  //   console.log(new Date().getTime(), 'DONE HACK', earnedMoney);
  console.log(`[${ns.getHostname()}]: ${new Date().getTime()} HACK COMPLETE, $${earnedMoney}`);
  //   await ns.sleep(10_000_000);
}
