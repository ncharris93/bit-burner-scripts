import { NS } from '@ns';
import { getNodeArray } from './get-node-array';

export type NCH_Server = ReturnType<typeof mapHostToServer>[0];
export const mapHostToServer = (ns: NS, hostnames = getNodeArray(ns)) => {
  const hackingLevel = ns.getHackingLevel();
  return hostnames.map((host) => {
    //  const server = ns.getServer();

    const res = {
      name: host,

      maxMem: ns.getServerMaxRam(host),
      maxMoney: ns.getServerMaxMoney(host),
      sec: ns.getServerSecurityLevel(host),
      hackLevel: ns.getServerRequiredHackingLevel(host),
      numPortsRequired: ns.getServerNumPortsRequired(host),
      timeToHack: ns.getHackTime(host),
      timeToGrow: ns.getGrowTime(host),
      timeToWeaken: ns.getWeakenTime(host),
      // ...server,

      canHack: ns.getServerRequiredHackingLevel(host) <= hackingLevel,
    };

    return res;
  });
};
