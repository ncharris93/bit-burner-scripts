import { NS } from '@ns';

import { getCurrentTarget } from './get-current-target';
import { getNodeArray } from './get-node-array';
import { NCH_Server, mapHostToServer } from './map-host-to-server';

export const getPriorityTargetList = async (ns: NS, numTargets = 10): Promise<NCH_Server[]> => {
  const all = getNodeArray(ns);
  const res: string[] = [];

  while (res.length < numTargets) {
    const target = getCurrentTarget(
      ns,
      all.filter((name) => !res.includes(name)),
    );
    res.push(target.name);
    await ns.sleep(100);
  }

  return mapHostToServer(ns, res);
};
