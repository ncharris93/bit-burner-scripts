import { NS } from '@ns';

export async function main(ns: NS) {
  await ns.weaken(ns.args[0] as string);
  //   await ns.sleep(10_000_000);
}
