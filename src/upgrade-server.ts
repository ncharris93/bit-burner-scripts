import { NS } from '@ns';
import { crawl } from './crawler';
/**
 * @param {number} ramCurrent
 * @param {number} ramUpgrade
 */

const prefix = 'pserv';
/** @param {NS} ns */
export async function main(ns: NS) {
  // How much RAM each purchased server will have. In this case, it'll
  // be 8GB.
  const ramCurrent = parseInt(`${ns.args[0]}`);
  const ramWanted = parseInt(`${ns.args[1]}`);

  // Iterator we'll use for our loop
  let i = 0;
  const currentBoughtServers = ns.scan('home').filter((name) => {
    const maxCurRam = ns.getServerMaxRam(name);
    if (maxCurRam === ramCurrent) {
      return name.includes(prefix);
    }
    if (maxCurRam === ramWanted) {
      i++;
    }
    return false;
  });

  const ableToPurchaseServer = ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ramWanted);

  console.log({ currentBoughtServers, ableToPurchaseServer });

  if (ableToPurchaseServer) {
    const serverToDelete = currentBoughtServers.pop();
    if (serverToDelete) {
      console.log('making room for new server by rm: ', serverToDelete);
      ns.killall(serverToDelete);
      const success = ns.deleteServer(serverToDelete);
      console.log('Successfully remove: ', success);
    }
  }

  const purchasedLimit = ns.getPurchasedServerLimit();
  console.log({ purchasedLimit });
  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers
  while (i < ns.getPurchasedServerLimit()) {
    // Check if we have enough money to purchase a server
    if (ableToPurchaseServer) {
      // If we have enough money, then:
      //  1. Purchase the server
      //  2. Copy our hacking script onto the newly-purchased server
      //  3. Run our hacking script on the newly-purchased server with 3 threads
      //  4. Increment our iterator to indicate that we've bought a new server
      const serverToDelete = currentBoughtServers.pop();
      if (!serverToDelete) {
        break;
      }
      ns.killall(serverToDelete);
      console.log('deleting server: ', serverToDelete);
      ns.deleteServer(serverToDelete);
      console.log('Creating new server: ', `${prefix}-${ramWanted}-${i}`);
      ns.purchaseServer(`${prefix}-${ramWanted}-${i}`, ramWanted);
      //const hostname = ns.purchaseServer(`pserv-${ramWanted}-`+ i, ramWanted);
      //ns.scp("early-hack-template.js", hostname);
      //ns.exec("early-hack-template.js", hostname, 3);
    }
    ++i;
    //Make the script wait for a second before looping again.
    //Removing this line will cause an infinite loop and crash the game.
    await ns.sleep(100);
  }

  void crawl(ns);

  console.log('Upgrade fin!');
}
