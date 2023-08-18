import { NS } from '@ns';
import { printNodeNetwork } from './print-network';

/** @param {NS} ns */
export async function main(ns: NS) {
  printNodeNetwork(ns);
}
