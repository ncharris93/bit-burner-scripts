/**
 * @params {string} target server hostname
 */

import { NS } from '@ns';
import { getCurrentTarget } from './get-current-target';
import { getPriorityTargetList } from './get-priority-target-list';
import { isNewGame } from './utils';

const SCRIPT = 'early-hack-template.js';

/** @param {NS} ns */
export async function main(ns: NS) {
  //const target = ns.getServer(ns.args[0])
  const hostname = 'home';
  const target = getCurrentTarget(ns)?.name;
  if (!target) {
    return console.log('NO TARGET???');
  }
  //   const server = ns.getServer(hostname);
  console.log('KILLING ALL ON HOME');

  //   ns.killall(hostname);

  const usedRam = ns.getServerUsedRam(hostname);
  const targetMaxRam = ns.getServerMaxRam(hostname);
  //   const ramToKeepFree = Math.min(10, targetMaxRam * 0.1);
  const ramToKeepFree = 10;
  const scriptMem = ns.getScriptRam(SCRIPT);

  const threadsToUse = Math.max(Math.floor((targetMaxRam - (usedRam + ramToKeepFree)) / scriptMem), 1);

  console.log({ targetMaxRam, scriptMem, threadsToUse });


  if (isNewGame(ns)) {
    const list = await getPriorityTargetList(ns, 2);
    ns.exec(SCRIPT, hostname, threadsToUse / 2, list[0].name);
    ns.exec(SCRIPT, hostname, threadsToUse / 2, list[1].name);
    ns.exec('watch-for-better-target.js', hostname);
    ns.exec('purchase-server.js', hostname);
    return console.log(`${hostname} memory left: ${ns.getServerUsedRam(hostname)}`);
  }

  ns.exec(SCRIPT, hostname, threadsToUse, target);
  ns.exec('watch-for-better-target.js', hostname);
  console.log(`${hostname} memory left: ${ns.getServerUsedRam(hostname)}`);
}
