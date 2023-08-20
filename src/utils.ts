import { NS } from '@ns';

export const isNewGame = (ns: NS) => ns.getHackingLevel() < 100;

export const getIdealWeakenThreadCountForOneIteration = (ns: NS, host: string) => {
  // export const getIdealWeakenThreadCountForOneIteration = async (ns: NS, host: string) => {
  const minSecurity = ns.getServerMinSecurityLevel(host);
  const currentSecurity = ns.getServerSecurityLevel(host);
  const securityDifference = currentSecurity - minSecurity;

  let threadCount = 0;
  const threadResolution = 10;
  let loop = true;

  //   console.log(`[${host}]`, { minSecurity, currentSecurity, securityDifference });
  while (loop) {
    const wAn = ns.weakenAnalyze(threadCount);
    //  console.log(`[${host}]`, { wAn });
    const willFullyWeaken = securityDifference - wAn <= 0;
    if (willFullyWeaken) {
      loop = false;
    }
    threadCount += threadResolution;
    //  await ns.sleep(10);
  }

  // const server = ns.getServer(host)
  const weakenTime = Math.ceil(ns.getWeakenTime(host));
  // const currentWeakness = server
  return {
    threadCount,
    time: weakenTime,
  };
};

export const getIdealGrowThreadCountForOneIteration = (ns: NS, host: string) => {
  // export const getIdealGrowThreadCountForOneIteration = async (ns: NS, host: string) => {
  const maxMoney = ns.getServerMaxMoney(host);
  const currentMoney = ns.getServerMoneyAvailable(host) || 1;

  let threadCountGuess = 0;
  //   const threadResolution = 10;
  //   const number = 0;
  const moneyDifference = maxMoney - currentMoney;
  let loop = true;

  while (loop) {
    const wantedGrowthFactor = maxMoney / (currentMoney || threadCountGuess);

    //  if (true) {
    //    loop = false;
    //  }

    //  const thing = ns.formulas.hacking.growPercent(server, threads, player)
    //  const thing = ns.formulas.hacking.

    console.log(`[${host}]`, { maxMoney, currentMoney, moneyDifference, wantedGrowthFactor });
    const threadCount = Math.ceil(ns.growthAnalyze(host, wantedGrowthFactor));
    console.log(`[${host}]`, { threadCount });

    threadCountGuess = threadCount;
    //  threadCountGuess += threadResolution;
    if (true) {
      loop = false;
    }
    //  await ns.sleep(10);
  }

  const growTime = Math.ceil(ns.getGrowTime(host));

  //   const moneyDifference = maxMoney - currentMoney;
  //
  //   const wantedGrowthFactor = maxMoney / currentMoney;
  //
  //   console.log(`[${host}]`, { maxMoney, currentMoney, moneyDifference, wantedGrowthFactor });
  //   const threadCount = Math.ceil(ns.growthAnalyze(host, wantedGrowthFactor));
  //   console.log(`[${host}]`, { threadCount });
  //   const growTime = Math.ceil(ns.getGrowTime(host));

  return {
    threadCount: threadCountGuess,
    time: growTime,
  };
};

// export const getIdealGrowThreadCountForOneIteration = async (ns: NS, host: string) => {
//   const maxMoney = ns.getServerMaxMoney(host);
//   const currentMoney = ns.getServerMoneyAvailable(host) || 1;
//   const moneyDifference = maxMoney - currentMoney;

//   const wantedGrowthFactor = maxMoney / currentMoney;

//   console.log(`[${host}]`, { maxMoney, currentMoney, moneyDifference, wantedGrowthFactor });
//   const threadCount = Math.ceil(ns.growthAnalyze(host, wantedGrowthFactor));
//   console.log(`[${host}]`, { threadCount });
//   const growTime = Math.ceil(ns.getGrowTime(host));

//   return {
//     threadCount,
//     growTime,
//   };
// };

export const getIdealHackThreadCountForOneIteration = (ns: NS, host: string) => {
  // export const getIdealHackThreadCountForOneIteration = async (ns: NS, host: string) => {
  //   let threadCount = 0;
  //   const threadResolution = 10;

  const singleThreadMultiplier = ns.hackAnalyze(host);

  //   while (singleThreadMultiplier * threadCount < 1) {
  //     threadCount += threadResolution;
  //     //  await ns.sleep(10);
  //
  const threadCount = Math.ceil(1 / singleThreadMultiplier);

  const getHackTime = Math.ceil(ns.getWeakenTime(host));

  return {
    threadCount,
    time: getHackTime,
  };
};
