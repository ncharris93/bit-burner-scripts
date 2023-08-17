/**
 * @params {string} target server hostname
 */

import { NS } from '@ns';

const SCRIPT = 'early-hack-template.js';

/** @param {NS} ns */
export async function main(ns: NS) {
  //const target = ns.getServer(ns.args[0])
  const hostname = 'home';
  const target = ns.args[0];

  const usedRam = ns.getServerUsedRam(hostname);
  const targetMaxRam = ns.getServerMaxRam(hostname);
  const scriptMem = ns.getScriptRam(SCRIPT);

  const maxThreads = Math.floor((targetMaxRam - usedRam) / scriptMem);

  console.log({ targetMaxRam, scriptMem, maxThreads });

  ns.exec(SCRIPT, hostname, maxThreads, target);
}
