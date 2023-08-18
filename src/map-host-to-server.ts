import { NS } from '@ns';
import { getNodeArray } from './get-node-array';

export type NCH_Server = ReturnType<typeof mapHostToServer>[0];
export const mapHostToServer = (ns: NS, hostnames = getNodeArray(ns)) => {
  return hostnames.map((server) => {
    return {
      maxMem: ns.getServerMaxRam(server),
      maxMoney: ns.getServerMaxMoney(server),
      sec: ns.getServerSecurityLevel(server),
      hackLevel: ns.getServerRequiredHackingLevel(server),
      numPortsRequired: ns.getServerNumPortsRequired(server),
      name: server,
    };
  });
};
