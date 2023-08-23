import { NS } from '@ns';

import { getNodeArray } from './get-node-array';
import { NCH_Server, mapHostToServer } from './map-host-to-server';
import { isNewGame } from './utils';

export const getCurrentTarget = (ns: NS, hostnames: string[] = getNodeArray(ns)): NCH_Server | undefined => {
  const myHackLevel = ns.getHackingLevel();

  const serverList = mapHostToServer(ns, hostnames);
  const targetList = serverList.filter((server) => ns.hasRootAccess(server.name) && server.name !== 'home');

  //   console.log({ targetList });
  const idealTarget = targetList.reduce((res, cur) => {
    const lessThanHalfHack = cur.hackLevel * 2 <= myHackLevel;
    const lessThanHack = cur.hackLevel <= myHackLevel;
    const shouldCheckHalf = !isNewGame(ns);
    const shouldTryHacking = shouldCheckHalf ? lessThanHalfHack : lessThanHack;

    //  console.log({ cur, lessThanHalfHack, lessThanHack, shouldCheckHalf, shouldTryHacking });
    if (!shouldTryHacking) {
      return res;
    }

    const hasMoreMoneyThanRes = cur.maxMoney > (res?.maxMoney || 0);
    if (hasMoreMoneyThanRes) {
      return cur;
    }
    return res;
  }, {} as NCH_Server);

  const objectIsEmpty = Object.keys(idealTarget).length === 0;
  const res = objectIsEmpty ? undefined : idealTarget;

  return res;
};
