import { NS } from '@ns';

import { getNodeArray } from './get-node-array';
import { mapHostToServer } from './map-host-to-server';

export const getCurrentTarget = (ns: NS, hostnames: string[] = getNodeArray(ns)) => {
  const myHackLevel = ns.getHackingLevel();
  const serverList = mapHostToServer(ns, hostnames);

  const targetList = serverList.filter((server) => ns.hasRootAccess(server.name) && server.name !== 'home');
  const idealTarget = targetList.reduce((res, cur) => {
    const isLessThanHalfMyHackLevel = cur.hackLevel * 2 < myHackLevel;
    if (!isLessThanHalfMyHackLevel) {
      return res;
    }

    const hasMoreMoneyThanRes = cur.maxMoney > res?.maxMoney;
    if (hasMoreMoneyThanRes) {
      return cur;
    }
    return res;
  }, targetList[0]);

  return idealTarget;
};
