import { NS } from '@ns';
import { FORMULA_FILE_NAME } from './formulas.constants';
import { Data } from './formulas.types';
import { getNodeArray } from '@/get-node-array';

const PERCENT = 0.5;

export async function main(ns: NS) {
  const hosts = getNodeArray(ns).filter((host) => !host.includes('pserv-') && !host.includes('home'));
  const data: Data = {};
  hosts.forEach((host) => {
    //  data[host] = { grow: Number.MAX_SAFE_INTEGER };
    data[host] = {
      growThreads: Number.MAX_SAFE_INTEGER,
      hackPercent: Number.MAX_SAFE_INTEGER,
      // weaken1: Number.MAX_SAFE_INTEGER,
      // weaken2: Number.MAX_SAFE_INTEGER,
    };

    const player = ns.formulas.mockPerson();
    player.skills.hacking = ns.getServerRequiredHackingLevel(host) * 2;

    const server = ns.getServer(host);
    //  const server = ns.formulas.mockServer();
    const moneyMax = ns.getServerMaxMoney(host);

    server.minDifficulty = ns.getServerMinSecurityLevel(host);
    server.moneyMax = moneyMax;
    server.serverGrowth = ns.getServerGrowth(host);
    server.moneyAvailable = ns.getServerMaxMoney(host) * PERCENT;
    data[host].growThreads = ns.formulas.hacking.growThreads(server, player, moneyMax);

    server.hackDifficulty = ns.getServerMinSecurityLevel(host);
    data[host].hackPercent = ns.formulas.hacking.hackPercent(server, player) * 100;
    //  data[host].hackPercent = 1; //ns.formulas.hacking.hackPercent(server, player);
  });

  ns.write(FORMULA_FILE_NAME, JSON.stringify(data), 'w');
}
