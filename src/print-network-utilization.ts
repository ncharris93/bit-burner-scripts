import { NS } from '@ns';
import { getNodeArray } from './get-node-array';
import { mapHostToServer } from './map-host-to-server';
export async function main(ns: NS) {
  return printNetworkUtilization(ns);
}

export async function printNetworkUtilization(ns: NS) {
  const nodeList = getNodeArray(ns);
  const serverData = mapHostToServer(ns, nodeList);

  const { networkRAM, usedNetworkRam, pservRam, usedPservRam } = serverData.reduce(
    (res, cur) => {
      if (cur.name === 'home') {
        return res;
      }
      if (cur.name.includes('pserv')) {
        res.pservRam += cur.maxMem;
        res.usedPservRam += cur.usedMem;
      }
      if (cur.canHack) {
        res.networkRAM += cur.maxMem;
        res.usedNetworkRam += cur.usedMem;
      }
      return res;
    },
    { networkRAM: 0, usedNetworkRam: 0, pservRam: 0, usedPservRam: 0 },
  );

  const networkUtilization = usedNetworkRam / networkRAM;
  const pservUtilization = usedPservRam / pservRam;

  console.log({ networkRAM, usedNetworkRam, networkUtilization, pservRam, usedPservRam, pservUtilization });
  ns.print({ networkRAM, usedNetworkRam, networkUtilization, pservRam, usedPservRam, pservUtilization });
}
