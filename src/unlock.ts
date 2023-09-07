// import crawl from './crawler.js'
// import getNodeArray from './get-node-array.js'

import { NS } from '@ns';
import { getNodeArray } from './get-node-array';

/** @param {NS} ns */
export async function main(ns: NS) {
  const nodes = getNodeArray(ns);
  console.log({ len: nodes.length, nodes });
  let didUnlock = false;

  for (const host of nodes) {
    const target = ns.getServer(host);

    if (!ns.hasRootAccess(host)) {
      console.log(`No root access to: ${host}`);

      if (ns.fileExists('BruteSSH.exe', 'home')) {
        ns.brutessh(host);
      }
      if (ns.fileExists('FTPCrack.exe', 'home')) {
        ns.ftpcrack(host);
      }
      if (ns.fileExists('relaySMTP.exe', 'home')) {
        ns.relaysmtp(host);
      }
      if (ns.fileExists('HTTPWorm.exe', 'home')) {
        ns.httpworm(host);
      }
      if (ns.fileExists('SQLInject.exe', 'home')) {
        ns.sqlinject(host);
      }
    }

    const numPortsNeeded = ns.getServerNumPortsRequired(host);
    const portsUnlocked = ns.getServer(host).openPortCount || 0;
    const canNuke = numPortsNeeded <= portsUnlocked && !target.hostname.includes('pserv-');
    if (canNuke && !ns.hasRootAccess(host)) {
      ns.tprint(`SUCCESS: Nuking: ${host}`);
      ns.killall(host);
      ns.nuke(host);
      didUnlock = true;
    }
  }

  // run for home specifically
  //   ns.exec('eht-max.js', 'home');

  //   await ns.sleep(2000); // hack for race condition killing scripts

  // run for all other servers
  ns.tprint(`${didUnlock ? 'SUCCESS' : 'INFO'} Fin! ${didUnlock ? 'Hosts unlocked!' : 'No new unlocks'}`);
  //   ns.exec('purchase-server.js', 'home', 1, '4096');
  //   ns.exec('watch-for-better-target.js', 'home');

  //   if (isNewGame(ns)) {
  //     await serverOrchestrator(ns, 'n00dles', 'home');
  //   } else {
  //     await initServerOrchestrator(ns);
  //   }
  //   console.log({ nodes });
  //  await crawl(
  // ns,
  // nodes.filter((n) => n !== 'home'),
  //  );
}
