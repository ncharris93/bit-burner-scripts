// import crawl from './crawler.js'
// import getNodeArray from './get-node-array.js'

import { NS } from '@ns';
import { crawl } from './crawler';
import { getNodeArray } from './get-node-array';
import { initServerOrchestrator } from './init-server-orchestrator';
import { isNewGame } from './utils';
import { serverOrchestrator } from './server-orchestrator';

/** @param {NS} ns */
export async function main(ns: NS) {
  const nodes = getNodeArray(ns);
  console.log({ len: nodes.length, nodes });

  for (const hn of nodes) {
    const target = ns.getServer(hn);

    if (!ns.hasRootAccess(hn)) {
      console.log(`No root access to: ${hn}`);

      if (ns.fileExists('BruteSSH.exe', 'home')) {
        ns.brutessh(hn);
      }
      if (ns.fileExists('FTPCrack.exe', 'home')) {
        ns.ftpcrack(hn);
      }
      if (ns.fileExists('relaySMTP.exe', 'home')) {
        ns.relaysmtp(hn);
      }
      if (ns.fileExists('HTTPWorm.exe', 'home')) {
        ns.httpworm(hn);
      }
      if (ns.fileExists('SQLInject.exe', 'home')) {
        ns.sqlinject(hn);
      }
    }

    ns.killall(hn);

    const numPortsNeeded = ns.getServerNumPortsRequired(hn);
    const portsUnlocked = target.openPortCount || 0;
    const canNuke = numPortsNeeded <= portsUnlocked && !target.hostname.includes('pserv-');
    if (canNuke && !ns.hasRootAccess(hn)) {
      console.log(`Nuking: ${hn}`);
      ns.nuke(hn);
    }
  }

  // run for home specifically
  ns.exec('eht-max.js', 'home');

  await ns.sleep(2000); // hack for race condition killing scripts

  // run for all other servers
  console.log('Fin! Hosts unlocked!');
  //   ns.exec('purchase-server.js', 'home', 1, '4096');
  //   ns.exec('watch-for-better-target.js', 'home');

  //   if (isNewGame(ns)) {
  //     await serverOrchestrator(ns, 'n00dles', 'home');
  //   } else {
  //     await initServerOrchestrator(ns);
  //   }
  console.log({ nodes });
  //  await crawl(
  // ns,
  // nodes.filter((n) => n !== 'home'),
  //  );
}
