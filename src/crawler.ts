import { NS } from '@ns';
import { getNodeArray } from './get-node-array';
// import { getCurrentTarget } from './get-current-target';
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
  //   const idealTarget = getCurrentTarget(ns, hostnames);
  //   console.log({ idealTarget });

  /**
   * 2 update all scripts on all servers to target new hacking target
   */

  const SCRIPT = 'early-hack-template.js';

  //   const numServersPerTarget = Math.ceil((hostnames.length - 1) / NUM_TARGETS);
  const numServersPerTarget = 4;
  const NUM_TARGETS = Math.ceil((hostnames.length - 1) / numServersPerTarget);
  let targetIndex = 0;

  //   console.log({ numServersPerTarget, targetIndex, serverList, NUM_TARGETS });
  const targets = await getPriorityTargetList(ns, NUM_TARGETS, hostnames);
  //   console.log({ targets, serverList });
  //   const currentTarget = targets[targetIndex];
  //   const getTarget = () => targets[targetIndex];
  let counter = 0;

  for (const hostname of serverList) {
    //  console.log({ hostname, targetIndex, targets, first: targets[0], name: targets[0].name });
    const targetName = targets[targetIndex]?.name;
    if (!targetName) {
      return console.log('NO TARGET NAME? ', { targets, targetIndex });
    }
    //  const targetName = getTarget().name;
    //  console.log('1', targetName);

    //  const targetName = server.name;
    const scriptMemUsed = ns.getScriptRam(SCRIPT);
    //  console.log('2', scriptMemUsed);
    const maxThreads = Math.floor(hostname.maxMem / scriptMemUsed) || 1;
    //  console.log({ targetName, hostname, maxThreads });

    ns.scp(SCRIPT, targetName);
    //  log(`copied ${SCRIPT} to ${targetName}`);

    if (!ns.hasRootAccess(targetName)) {
      continue;
    }

    //  ns.killall(hostname.name);
    //  ns.killall(targetName);
    //  log(`killed all processes on ${hostname.name}`);
    //  ns.exec(SCRIPT, hostname.name, maxThreads, targetName);
    ns.exec(SCRIPT, hostname.name, maxThreads, targetName);
    //  console.log({ SCRIPT, server: hostname.name, maxThreads, targetName });
    //  log(`${SCRIPT} run on ${hostname.name} with ${maxThreads} threads, targeting ${targetName}`);

    ++counter;
    //  console.log({ counter, numServersPerTarget, does: counter > numServersPerTarget });
    if (counter >= numServersPerTarget) {
      counter = 0;
      ++targetIndex;
      // reset index if we go beyond bounds
      if (targetIndex >= targets.length) {
        targetIndex = 0;
      }
      // console.log('NEW target!', targets[targetIndex]);
    }
  }
}
