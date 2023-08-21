import { NS } from '@ns';

export async function serverUpgradeManager(ns: NS) {
  //   await initServerOrchestrator(ns);
  const currentMoney = ns.getServerMoneyAvailable('home');
  const purchasedServers = ns.scan().filter((name) => name.includes('pserv'));
  const pserv = purchasedServers[purchasedServers.length - 1];
  //   const pserv = purchasedServers[0];

  const upgradeCatalog = Array.from({ length: 21 }).map((_, i) => {
    const ram = 2 ** i;
    const serverCost = ns.getPurchasedServerCost(ram);
    const canAffordServer = currentMoney >= serverCost;
    const numCanAfford = Math.floor(currentMoney / serverCost);
    const upgradeCost = !pserv ? serverCost : ns.getPurchasedServerUpgradeCost(pserv, ram);
    return { i, serverCost, canAffordServer, numCanAfford, upgradeCost, upVsNewDiff: serverCost - upgradeCost, ram };
  });

  const maxFullUpgradeRam = upgradeCatalog.findLast(
    (server) => server.numCanAfford > ns.getPurchasedServerLimit(),
  )?.ram;
  console.log({ upgradeCatalog, maxFullUpgradeRam });

  const currentServersAreNotAtMaxRAM = maxFullUpgradeRam !== ns.getServerMaxRam(pserv);
  if (currentServersAreNotAtMaxRAM && maxFullUpgradeRam) {
    purchasedServers.forEach((name, i) => {
      const newName = `pserv-${maxFullUpgradeRam}-${i}`;
      console.log(`Upgrading: ${name} to ${newName}`);

      ns.upgradePurchasedServer(name, maxFullUpgradeRam);
      ns.renamePurchasedServer(name, newName);
      ns.killall(newName);
      ns.exec('init-server-orchestrator.js', newName);
    });
  }
}
