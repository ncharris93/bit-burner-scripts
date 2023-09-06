import { NS } from '@ns';
import { FORMULA_FILE_NAME } from './formulas.constants';
import { Data } from './formulas.types';
import { getNodeArray } from '@/get-node-array';

const HACK_RESOLUTION = 50;

export async function main(ns: NS) {
  const hosts = getNodeArray(ns);
  const data: Data = {};
  hosts.forEach((host) => {
    data[host] = { grow: Number.MAX_SAFE_INTEGER };
    //  data[host] = { grow: Number.MAX_SAFE_INTEGER, hack: Number.MAX_SAFE_INTEGER, weaken: Number.MAX_SAFE_INTEGER };
    const mockServer = ns.formulas.mockServer();
    const moneyMax = ns.getServerMaxMoney(host);
    mockServer.minDifficulty = ns.getServerMinSecurityLevel(host);
    mockServer.maxRam = ns.getServerMaxRam(host);
    mockServer.moneyMax = moneyMax;
    mockServer.serverGrowth = ns.getServerGrowth(host);
    mockServer.moneyAvailable = 0;

    const mockPlayer = ns.formulas.mockPlayer();
    data[host].grow = ns.formulas.hacking.growThreads(mockServer, mockPlayer, moneyMax);
  });

  ns.write(FORMULA_FILE_NAME, JSON.stringify(data), 'w');
}
