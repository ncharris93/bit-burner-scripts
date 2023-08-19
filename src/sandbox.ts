import { NS } from '@ns';
import { printNodeNetwork } from './print-network';
import { getPriorityTargetList } from './get-priority-target-list';

/** @param {NS} ns */
export async function main(ns: NS) {
  //   printNodeNetwork(ns);
  const list = await getPriorityTargetList(ns);
  ns.print(list);
}
