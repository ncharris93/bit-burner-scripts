import { NS } from '@ns';

export async function main(ns: NS) {
  return serverUpgradeManager(ns);
}

export async function serverUpgradeManager(ns: NS) {
  //   await initServerOrchestrator(ns);
  const currentMoney = ns.getServerMoneyAvailable('home');
  const purchasedServers = ns.scan().filter((name) => name.includes('pserv'));
  const pserv = purchasedServers[purchasedServers.length - 1];

  const upgradeCatalog = Array.from({ length: 21 }).map((_, i) => {
    const ram = 2 ** i;
    const serverCost = ns.getPurchasedServerCost(ram);
    const canAffordServer = currentMoney >= serverCost;
    const numCanAfford = Math.floor(currentMoney / serverCost);
    const upgradeCost = !pserv ? serverCost : ns.getPurchasedServerUpgradeCost(pserv, ram);
    return { i, serverCost, canAffordServer, numCanAfford, upgradeCost, upVsNewDiff: serverCost - upgradeCost, ram };
  });

  console.log({ upgradeCatalog });

  const serverLimit = ns.getPurchasedServerLimit();
  const maxFullUpgradeRam = upgradeCatalog.findLast((server) => server.numCanAfford > serverLimit)?.ram;
  console.log({ upgradeCatalog, maxFullUpgradeRam });

  if (!maxFullUpgradeRam) {
    console.log("Can't purchase full rack of servers");
    return;
  }

  const notYetBoughtServers = !pserv;
  if (notYetBoughtServers) {
    Array.from({ length: serverLimit }).forEach((_, i) => {
      const name = `pserv-${maxFullUpgradeRam}-${i}`;
      ns.purchaseServer(name, maxFullUpgradeRam);
      ns.killall(name);
      ns.scp('early-hack-template.js', name);
      ns.exec('early-hack-template.js', name);
    });
    return;
  }

  const currentServersAreNotAtMaxRAM = maxFullUpgradeRam !== ns.getServerMaxRam(pserv);
  if (currentServersAreNotAtMaxRAM) {
    purchasedServers.forEach((name, i) => {
      const newName = `pserv-${maxFullUpgradeRam}-${i}`;
      console.log(`Upgrading: ${name} to ${newName}`);

      ns.upgradePurchasedServer(name, maxFullUpgradeRam);
      ns.renamePurchasedServer(name, newName);
      ns.killall(newName);

      if (maxFullUpgradeRam > 16) {
        ns.exec('init-server-orchestrator.js', newName);
      } else {
        ns.scp('early-hack-template.js', newName, 'home');
        ns.exec('early-hack-template.sj', newName);
      }
    });
  }
}
