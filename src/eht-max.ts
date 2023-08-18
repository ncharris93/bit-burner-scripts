/**
 * @params {string} target server hostname
 */

import { NS } from '@ns';
import { getCurrentTarget } from './get-current-target';

const SCRIPT = 'early-hack-template.js';

/** @param {NS} ns */
export async function main(ns: NS) {
  //const target = ns.getServer(ns.args[0])
  const hostname = 'home';
  const target = getCurrentTarget(ns).name;
  ns.killall(hostname);

  const usedRam = ns.getServerUsedRam(hostname);
  const targetMaxRam = ns.getServerMaxRam(hostname);
  //   const ramToKeepFree = Math.min(10, targetMaxRam * 0.1);
  const ramToKeepFree = 10;
  const scriptMem = ns.getScriptRam(SCRIPT);

  const maxThreads = Math.floor((targetMaxRam - (usedRam + ramToKeepFree)) / scriptMem) || 1;

  console.log({ targetMaxRam, scriptMem, maxThreads });

  ns.exec(SCRIPT, hostname, maxThreads, target);
  console.log(`${hostname} memory left: ${ns.getServerUsedRam(hostname)}`);
}
