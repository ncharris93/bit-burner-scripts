import { NS } from '@ns';
import { printPathToTarget } from './print-path-to-target';

/** @param {NS} ns */
export async function main(ns: NS) {
  //   printNodeNetwork(ns);
  //   const list = printPathToTarget(ns);
  const list = ns.getPurchasedServerMaxRam();
  ns.print({ maxServerRam: list });
}
