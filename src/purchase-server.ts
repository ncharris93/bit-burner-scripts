import { NS } from '@ns';
import { getCurrentTarget } from './get-current-target';

/** @param {NS} ns */
export async function main(ns: NS) {
  // How much RAM each purchased server will have. In this case, it'll
  // be 8GB.
  const ram = ns.args[0] as number;

  // Iterator we'll use for our loop
  let i = 0;

  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers
  while (i < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
      // If we have enough money, then:
      //  1. Purchase the server
      //  2. Copy our hacking script onto the newly-purchased server
      //  3. Run our hacking script on the newly-purchased server with 3 threads
      //  4. Increment our iterator to indicate that we've bought a new server
      const hostname = ns.purchaseServer(`pserv-${ram}-${i}`, +ram);
      if (!hostname) {
        console.log('NO SERVER??', hostname);
        return;
      }

      const SCRIPT = 'early-hack-template.js';
      ns.scp(SCRIPT, hostname);

      const scriptMemUsed = ns.getScriptRam(SCRIPT);
      const maxThreads = Math.floor(ns.getServerMaxRam(hostname) / scriptMemUsed) || 1;

      ns.exec('early-hack-template.js', hostname, maxThreads, getCurrentTarget(ns).name);
      ++i;
    }
    //Make the script wait for a second before looping again.
    //Removing this line will cause an infinite loop and crash the game.
    await ns.sleep(1000);
  }
}
