import { NS } from '@ns';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const sleepTime = parseInt(`${ns.args[1]}`) || 0;
  await ns.sleep(sleepTime);

  const earnedMoney = await ns.hack(target);
  //   console.log(new Date().getTime(), 'DONE HACK', earnedMoney);
  console.log(`[${ns.getHostname()}]: ${new Date().getTime()} HACK COMPLETE, $${earnedMoney}`);
  //   await ns.sleep(10_000_000);
}
