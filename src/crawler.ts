import { NS } from '@ns';
import { getNodeArray } from './get-node-array';
import { mapHostToServer } from './map-host-to-server';
import { getPriorityTargetList } from './get-priority-target-list';

const DEBUG = 1;

const log = (...args: any[]) => {
  DEBUG && console.log(...args);
};

export async function crawl(ns: NS, hostnames = getNodeArray(ns)) {
  console.log('crawling: ', hostnames);

  // sorted by ram, greatest to least
  const serverList = mapHostToServer(ns, hostnames).sort((a, b) => (a.maxMem > b.maxMem ? -1 : 1));

  /**
   * 1 get ideal hacking target
   */
  const SCRIPT = 'early-hack-template.js';

  const numServersPerTarget = 4;
  const NUM_TARGETS = Math.ceil((hostnames.length - 1) / numServersPerTarget);
  let targetIndex = 0;

  const targets = await getPriorityTargetList(ns, NUM_TARGETS, hostnames);
  let counter = 0;

  /**
   * 2 update all scripts on all servers to target new hacking target
   */
  //   console.log({ serverList, targets });
  for (const hostname of serverList) {
    const targetName = targets[targetIndex]?.name;
    if (!targetName) {
      return console.log('NO TARGET NAME? ', { targets, targetIndex });
    }

    const scriptMemUsed = ns.getScriptRam(SCRIPT);
    const maxThreads = Math.floor(hostname.maxMem / scriptMemUsed) || 1;

    ns.scp(SCRIPT, targetName, 'home');

    if (!ns.hasRootAccess(targetName)) {
      continue;
    }

    ns.exec(SCRIPT, hostname.name, maxThreads, targetName);
    log(`${SCRIPT} run on ${hostname.name} with ${maxThreads} threads, targeting ${targetName}`);

    ++counter;
    if (counter >= numServersPerTarget) {
      counter = 0;
      ++targetIndex;
      // reset index if we go beyond bounds
      if (targetIndex >= targets.length) {
        targetIndex = 0;
      }
      console.log('NEW target!', targets[targetIndex]);
    }
  }
}
