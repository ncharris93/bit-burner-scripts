import { NS } from '@ns';
import { getCurrentTarget } from './get-current-target';

/** @param {NS} ns */
export async function main(ns: NS) {
  const ram = ns.args[0] as number;

  let i = 0;
  // bump i for each server already purchased at the given RAM amount
  ns.scan().forEach((hostname) => {
    if (hostname.includes('pserv')) {
      if (ns.getServerMaxRam(hostname) === ram) {
        i++;
      }
    }
  });

  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers
  while (i < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
      const hostname = ns.purchaseServer(`pserv-${ram}-${i}`, +ram);
      if (!hostname) {
        console.log('NO SERVER??', hostname);
        return;
      }

      const SCRIPT = 'early-hack-template.js';
      ns.scp(SCRIPT, hostname);

      const scriptMemUsed = ns.getScriptRam(SCRIPT);
      const maxThreads = Math.floor(ns.getServerMaxRam(hostname) / scriptMemUsed) || 1;

      // ns.exec('early-hack-template.js', hostname, maxThreads, getCurrentTarget(ns).name);
      ns.exec('init-server-orchestrator.js', hostname);
      ++i;
    }
    //Make the script wait for a second before looping again.
    //Removing this line will cause an infinite loop and crash the game.
    await ns.sleep(1000);
  }
}
