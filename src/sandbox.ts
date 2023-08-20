import { NS } from '@ns';
import {
  getIdealGrowThreadCountForOneIteration,
  getIdealHackThreadCountForOneIteration,
  getIdealWeakenThreadCountForOneIteration,
} from './utils';
import { serverOrchestrator } from './server-orchestrator';

/** @param {NS} ns */
export async function main(ns: NS) {
  const targetNames = [
    'n00dles',
    'foodnstuff',
    'sigma-cosmetics',
    'joesguns',
    'hong-fang-tea',
    'harakiri-sushi',
    //  'iron-gym',
  ];

  const soRAM = ns.getScriptRam('server-orchestrator.js');
  console.log(`it takes ${soRAM} to run the server-orchestrator`);

  /**
   * if we can calc the number of expected ram each target will consume, then we can better dole out tasks to multiple servers
   */

  targetNames.forEach((target) => {
    //  serverOrchestrator(ns, target).catch((e) => console.warn(`[${target}]: `, e));
    ns.exec('server-orchestrator.js', 'home', { threads: 1 }, target, 'home');
    //  ns.exec('server-orchestrator.js', 'home', target, 'home');
  });
}
