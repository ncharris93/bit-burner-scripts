import { NS } from '@ns';

export async function main(ns: NS) {
  return serverUpgradeManager(ns);
}

export async function serverUpgradeManager(ns: NS) {
  const getCurrentMoney = () => ns.getServerMoneyAvailable('home');
  const getPurchasedServers = () => ns.scan().filter((name) => name.includes('pserv'));
  const purchasedServers = getPurchasedServers();
  const pserv = purchasedServers[purchasedServers.length - 1];

  const getUpgradeCatalog = () =>
    Array.from({ length: 21 }).map((_, i) => {
      const ram = 2 ** i;
      const serverCost = ns.getPurchasedServerCost(ram);
      const currentMoney = getCurrentMoney();
      const canAffordServer = currentMoney >= serverCost;
      const numCanAfford = Math.floor(currentMoney / serverCost);
      const upgradeCost = !pserv ? serverCost : ns.getPurchasedServerUpgradeCost(pserv, ram);
      return { i, serverCost, canAffordServer, numCanAfford, upgradeCost, upVsNewDiff: serverCost - upgradeCost, ram };
    });
  const upgradeCatalog = getUpgradeCatalog();

  console.log({ upgradeCatalog });

  //   const maxUpgradableRam = upgradeCatalog.findLast((server) => server.numCanAfford > serverLimit)?.ram;
  const getMaxUpgradableRam = () => getUpgradeCatalog().findLast((server) => server.numCanAfford > 0)?.ram || 0;
  const maxUpgradableRam = getMaxUpgradableRam();
  console.log({ upgradeCatalog, maxUpgradableRam });

  if (!maxUpgradableRam) {
    console.log('??');
    return;
  }

  if (maxUpgradableRam < 8) {
    console.log('No point in running a <8 GB Server, Eh?');
    return;
  }

  const getSortedServers = () => {
    const res = getPurchasedServers()
      .sort((a, b) => {
        const aRam = ns.getServerMaxRam(a);
        const bRam = ns.getServerMaxRam(b);
        const isDescending = bRam - aRam;
        return isDescending;
      })
      .reverse();
    ns.tprint(`INFO Sorted servers: `, res);
    return res;
  };
  const getLowestPserv = () => getSortedServers()[0];

  //   const temp = () => getLowestPserv();
  //   console.log({ order: temp() });

  //   const success = ns.renamePurchasedServer('pserv-256-[object Object]', 'pserv-256-3');
  //   console.log({ success });
  //   return;

  /**
   * TODO Keep this?
   */
  //   const getNumberFromPservName = (name: string) => parseInt(name.split('-')[1]);
  //   const renameServers = () => {
  //     const servers = getSortedServers();
  //     console.log({ servers });
  //     servers.forEach((server) => {
  //       const serverRamNumber = getNumberFromPservName(server);
  //       const actualRam = ns.getServerMaxRam(server);
  //       if (serverRamNumber === actualRam) {
  //         return;
  //       }
  //       const numServersAtNewLevel = getPurchasedServers()
  //         .map((name) => ({ ram: ns.getServerMaxRam(name) }))
  //         .filter(({ ram }) => ram === actualRam).length;

  //       // const newName = `pserv-${actualRam}-1`;
  //       const newName = `pserv-${actualRam}-${numServersAtNewLevel}`;
  //       console.log({ server, newName });
  //       // ns.renamePurchasedServer(server, newName);
  //     });
  //   };
  //   return renameServers();
  /**
   * TODO Keep this?
   */

  const lowestPowerPServ = purchasedServers.sort().reverse();
  console.log({ lowestPowerPServ });
  //   ns.tprint('INFO', { lowestPowerPServ });

  const canPurchaseServer = () => {
    const weakest = getLowestPserv();
    const weakestRam = ns.getServerMaxRam(weakest);

    const bestRamCanAfford = getMaxUpgradableRam();

    //  if (!bestRamCanAfford) {
    console.log({ bestRamCanAfford, weakestRam });
    if (!bestRamCanAfford || weakestRam >= bestRamCanAfford) {
      ns.tprint(`WARN Shouldn't upgrade from ${weakestRam} to ${bestRamCanAfford}`);
      return false;
    }

    const currentMoney = getCurrentMoney();
    const costToUpgrade = ns.getPurchasedServerUpgradeCost(weakest, bestRamCanAfford);
    const canPurchase = currentMoney >= costToUpgrade;
    // ns.getServerMoneyAvailable('home') >= ns.getPurchasedServerUpgradeCost(weakest, bestRamCanAfford);
    const type = canPurchase ? 'SUCCESS' : 'ERROR';
    ns.tprint(
      `${type} highest upgrade possible: current ${ns.formatNumber(currentMoney)} | cost: ${ns.formatNumber(
        costToUpgrade,
      )} | bestCanAfford: ${bestRamCanAfford}`,
    );
    return canPurchase;

    //  const canPurchase = bestRamCanAfford >= weakestRam;
    //  const type = canPurchase ? 'SUCCESS' : 'ERROR';
    //  ns.tprint(`${type} highest upgrade possible: `, bestRamCanAfford);
    //  return canPurchase;

    //  const weakest = getPurchasedServers().sort().reverse()[0];
    //  const currentLowestRam = getNumberFromPservName(weakest);
    //  const maxRam = getMaxUpgradableRam();
    //  const doesUpgradeRAM = currentLowestRam < maxRam;
    //  const canAfford = ns.getServerMoneyAvailable('home') >= ns.getPurchasedServerUpgradeCost(weakest, maxRam);
    //  return doesUpgradeRAM && canAfford;
  };

  const maxUpgradableRamPossibleEver = upgradeCatalog[upgradeCatalog.length - 1].ram;
  const areAllServersAtMax = () =>
    getPurchasedServers().filter((host) => {
      const currentRam = ns.getServerMaxRam(host);
      return currentRam === maxUpgradableRamPossibleEver;
    }).length === ns.getPurchasedServerLimit();

  while (getPurchasedServers().length > ns.getPurchasedServerLimit() || !areAllServersAtMax()) {
    while (canPurchaseServer()) {
      const lowestPowerPServ = getLowestPserv();
      await ns.sleep(1000);
      const maxRamForPurchasingServer = getMaxUpgradableRam();
      ns.tprint(`INFO: Upgrading ${lowestPowerPServ} to ${maxRamForPurchasingServer}`);
      // ns.tprint('INFO: upgrade this host to this ram', { lowestPowerPServ, maxRamForPurchasingServer });
      const successUpgrade = ns.upgradePurchasedServer(lowestPowerPServ, maxRamForPurchasingServer);
      ns.tprint(
        `${successUpgrade ? 'SUCCESS' : 'WARN'}: Server upgraded?: ${successUpgrade ? 'created' : 'Failed - sleeping'}`,
      );
      if (!successUpgrade) {
        await ns.sleep(10_000);
        continue;
      }

      // ns.upgradePurchasedServer(lowestPowerPServ, maxUpgradableRam);
      const numServersAtNewLevel = getPurchasedServers()
        .map((name) => ({ ram: ns.getServerMaxRam(name) }))
        .filter(({ ram }) => ram === maxUpgradableRam).length;
      // const numServersAtNewLevel = mapHostToServer(ns, getPurchasedServers()).filter(
      //   (s) => s.maxMem === maxUpgradableRam,
      // )?.length;
      const newName = `pserv-${maxUpgradableRam}-${numServersAtNewLevel}`;
      // ns.tprint('INFO: New Server: ', newName);
      const successRename = ns.renamePurchasedServer(lowestPowerPServ, newName);
      ns.tprint(
        `${successRename ? 'SUCCESS' : 'WARN'}: New Server: ${
          successRename ? `created: ${newName}` : `Failed: ${newName}`
        }`,
      );
      await ns.sleep(10_000);
    }
    ns.print('Sleeping for 60 seconds');
    await ns.sleep(60_000);
  }

  ns.tprint('server-upgrade-manager fin');
  return;
}

//   const notYetBoughtServers = !pserv;
//   if (notYetBoughtServers) {
//     //   while(ns.getServerMoneyAvailable('home')> ns.getPurchasedServerCost(ram)) {

//     // }
//     return Array.from({ length: serverLimit }).forEach((_, i) => {
//       const name = `pserv-${maxUpgradableRam}-${i}`;
//       ns.purchaseServer(name, maxUpgradableRam);
//       ns.killall(name);
//       // ns.scp('early-hack-template.js', name, 'home');
//       // ns.exec('early-hack-template.js', name);
//     });
//   }

//   const pservMaxRam = ns.getServerMaxRam(pserv);
//   const currentServersAreNotAtMaxRAM = maxUpgradableRam !== pservMaxRam;

//   if (currentServersAreNotAtMaxRAM && maxUpgradableRam > pservMaxRam) {
//     purchasedServers.forEach((name, i) => {
//       const newName = `pserv-${maxUpgradableRam}-${i}`;
//       console.log(`Upgrading: ${name} to ${newName}`);

//       ns.upgradePurchasedServer(name, maxUpgradableRam);
//       ns.renamePurchasedServer(name, newName);
//       ns.killall(newName);

//       // if (maxFullUpgradeRam > 16) {
//       //   ns.exec('init-server-orchestrator.js', newName);
//       // } else {
//       //   ns.scp('early-hack-template.js', newName, 'home');
//       //   ns.exec('early-hack-template.js', newName);
//       // }
//     });
//   }
// }
