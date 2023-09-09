import { NS } from '@ns';
import { getNodeArray } from './get-node-array';

export type NCH_Server = ReturnType<typeof mapHostToServer>[0];
export const mapHostToServer = (ns: NS, hostnames = getNodeArray(ns)) => {
  const hackingLevel = ns.getHackingLevel();
  ns.disableLog('ALL');
  return hostnames.map((host) => {
    //  const server = ns.getServer();

    const res = {
      name: host,

      maxMem: ns.getServerMaxRam(host),
      usedMem: ns.getServerUsedRam(host),
      maxMoney: ns.getServerMaxMoney(host),
      currMoney: ns.getServerMoneyAvailable(host),
      moneyDiff: ns.getServerMaxMoney(host) - ns.getServerMoneyAvailable(host),
      sec: ns.getServerSecurityLevel(host),
      minSec: ns.getServerMinSecurityLevel(host),
      secDiff: ns.getServerSecurityLevel(host) - ns.getServerMinSecurityLevel(host),
      hackLevel: ns.getServerRequiredHackingLevel(host),
      hackChance: ns.hackAnalyzeChance(host),
      numPortsRequired: ns.getServerNumPortsRequired(host),
      timeToHack: ns.getHackTime(host),
      timeToGrow: ns.getGrowTime(host),
      timeToWeaken: ns.getWeakenTime(host),
      // ...server,

      canHack: ns.getServerRequiredHackingLevel(host) <= hackingLevel && ns.hasRootAccess(host),
    };

    //  ns.enableLog('ALL');
    return res;
  });
};
