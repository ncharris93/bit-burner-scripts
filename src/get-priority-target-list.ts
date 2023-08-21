import { NS } from '@ns';

import { getCurrentTarget } from './get-current-target';
import { getNodeArray } from './get-node-array';
import { NCH_Server, mapHostToServer } from './map-host-to-server';

export const getPriorityTargetList = async (
  ns: NS,
  numTargets = 1000,
  hostnames = getNodeArray(ns),
): Promise<NCH_Server[]> => {
  const res: string[] = [];
  //   const counter = 0;
  let lastList = hostnames;

  //   console.log({ all: hostnames, len: hostnames.length, numTargets, trigger: res.length < numTargets });
  while (res.length < hostnames.length) {
    //  ++counter;
    //  if (counter > numTargets) {
    //    break;
    //  }

    lastList = lastList.filter((name) => !res.includes(name));
    //  console.log({ lastList });

    const target = getCurrentTarget(ns, lastList);
    //  console.log({ target });
    if (!target) {
      break;
    }
    console.log({ nextTarget: target.name, money: target.maxMoney, hack: target.hackLevel });
    //  console.log({ target });
    res.push(target.name);
    //  console.log({ currentRes: JSON.stringify(res) });
    //  await ns.sleep(100);
  }

  console.log({ res });

  const mappedRes = mapHostToServer(ns, res)
    .filter((target) => target.maxMoney > 0 || target.maxMem === 0)
    .slice(0, numTargets); //.filter((server) => server.canHack);

  console.log({ mappedRes });
  return mappedRes;
  //   return mappedRes.sort((a, b) => (a.maxMoney > b.maxMoney ? -1 : 1)).slice(0, numTargets);
};
