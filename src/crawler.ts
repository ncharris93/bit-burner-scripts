import { NS } from '@ns';
import { getNodeArray } from './get-node-array';
import { getCurrentTarget } from './get-current-target';
import { mapHostToServer } from './map-host-to-server';

const DEBUG = 1;

const log = (...args: any[]) => {
  DEBUG && console.log(...args);
};

export async function crawl(ns: NS) {
  const list = getNodeArray(ns);
  console.log('crawling: ', list);
  const serverList = mapHostToServer(ns, list);

  /**
   * 1 get ideal hacking target
   */
  const idealTarget = getCurrentTarget(ns, list);
  console.log({ idealTarget });

  /**
   * 2 update all scripts on all servers to target new hacking target
   */

  const SCRIPT = 'early-hack-template.js';

  for (const server of serverList) {
    const hostname = server.name;
    const scriptMemUsed = ns.getScriptRam(SCRIPT);
    const maxThreads = Math.floor(server.maxMem / scriptMemUsed) || 1;

    ns.scp(SCRIPT, hostname);
    log(`copied ${SCRIPT} to ${hostname}`);

    if (!ns.hasRootAccess(hostname)) {
      continue;
    }

    ns.killall(hostname);
    log(`killed all processes on ${hostname}`);
    ns.exec(SCRIPT, hostname, maxThreads, idealTarget.name);
    log(`${SCRIPT} run on ${hostname} with ${maxThreads} threads, targeting ${idealTarget.name}`);
  }
}
