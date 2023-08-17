import { NS } from '@ns';
import { getNodeArray } from './get-node-array';

const DEBUG = 1;

const log = (...args: any[]) => {
  DEBUG && console.log(...args);
};

export async function crawl(ns: NS) {
  const list = getNodeArray(ns);
  console.log('list: ', list);
  const serverList = list.map((server) => {
    return {
      maxMem: ns.getServerMaxRam(server),
      maxMoney: ns.getServerMaxMoney(server),
      sec: ns.getServerSecurityLevel(server),
      hackLevel: ns.getServerRequiredHackingLevel(server),
      numPortsRequired: ns.getServerNumPortsRequired(server),
      name: server,
    };
  });

  /**
   *
   * 1 get ideal hacking target
   *
   */
  const myHackLevel = ns.getHackingLevel();

  const idealTarget = serverList.reduce((res, cur, i) => {
    const isHalfHackAbility = cur.hackLevel * 2 < myHackLevel;
    if (!isHalfHackAbility) {
      return res;
    }

    const hasMoreMoneyThanRes = cur.maxMoney > res?.maxMoney;
    if (hasMoreMoneyThanRes) {
      return cur;
    }
    return res;
  }, serverList[0]);

  console.log({ idealTarget });

  /**
   *
   * 2 update all scripts on all servers to target new hacking target
   *
   */

  const SCRIPT = 'early-hack-template.js';

  for (const server of serverList) {
    const hostname = server.name;
    const scriptMemUsed = ns.getScriptRam(SCRIPT);
    const maxThreads = Math.floor(server.maxMem / scriptMemUsed) || 1;

    ns.scp(SCRIPT, hostname);
    log(`copied ${SCRIPT} to ${hostname}`);
    ns.killall(hostname);
    log(`killed all processes on ${hostname}`);
    ns.exec(SCRIPT, hostname, maxThreads, idealTarget.name);
    log(`${SCRIPT} run on ${hostname} with ${maxThreads} threads, targeting ${idealTarget.name}`);
  }
}
