import { NS } from '@ns';

export const isNewGame = (ns: NS) => ns.getHackingLevel() < 100;

export type IdealThreadData = { threadCount: number; time: number; timeBuffer: number };
export const getIdealWeakenThreadCountForOneIteration = (ns: NS, host: string): IdealThreadData => {
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
    timeBuffer: 0,
  };
};

export const getIdealGrowThreadCountForOneIteration = (ns: NS, host: string): IdealThreadData => {
  const maxMoney = ns.getServerMaxMoney(host);
  let currentMoney = ns.getServerMoneyAvailable(host) || 1;
  // hacky way to still trigger a grow if the server is full
  if (currentMoney === maxMoney) {
    currentMoney = 0;
  }

  let threadCountGuess = 100;
  const moneyDifference = maxMoney - currentMoney;

  if (ns.fileExists('formulas.exe', 'home')) {
    console.log('HAVE FORMULAS');
    throw new Error('check this logic first');
    //   const loop = true;
    //  const moneyMultiplierNeeded = maxMoney / currentMoney;
    //  let percentGrowth = Number.MAX_SAFE_INTEGER;

    //  while (percentGrowth * 100 < moneyMultiplierNeeded) {
    //    percentGrowth = ns.formulas.hacking.growPercent(ns.getServer(host), threadCountGuess, ns.getPlayer());

    //    const wantedGrowthFactor = maxMoney / (currentMoney || threadCountGuess);
    //    console.log(`[${host}]`, { maxMoney, currentMoney, moneyDifference, wantedGrowthFactor });
    //    const threadCount = Math.ceil(ns.growthAnalyze(host, wantedGrowthFactor));
    //    console.log(`[${host}]`, { threadCount });

    //    threadCountGuess = threadCount;
    //    if (true) {
    //      loop = false;
    //    }
    //  }
  } else {
    console.log('NO FORMULAS');
    const growthMultiplier = ns.getServerGrowth(host);
    const wantedGrowthFactor = Math.ceil(
      Math.min(maxMoney / ((currentMoney || threadCountGuess) * growthMultiplier), 10_000),
    );

    console.log(`[${host}]`, { growthMultiplier, maxMoney, currentMoney, moneyDifference, wantedGrowthFactor });
    const threadCount = Math.ceil(ns.growthAnalyze(host, wantedGrowthFactor));
    console.log(`[${host}]`, { threadCount });

    threadCountGuess = threadCount;
  }

  const growTime = Math.ceil(ns.getGrowTime(host));

  return {
    threadCount: threadCountGuess,
    time: growTime,
    timeBuffer: 0,
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

export const getIdealHackThreadCountForOneIteration = (ns: NS, host: string): IdealThreadData => {
  const singleThreadMultiplier = ns.hackAnalyze(host);
  const threadCount = Math.ceil(1 / singleThreadMultiplier);
  const getHackTime = Math.ceil(ns.getWeakenTime(host));

  return {
    threadCount,
    time: getHackTime,
    timeBuffer: 0,
  };
};
