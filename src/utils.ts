import { NS } from '@ns';
import { readFormulasData } from './formulas/formulas-read';

export const isNewGame = (ns: NS) => ns.getHackingLevel() < 100;

export async function main(ns: NS) {
  const host = ns.args[0] as string;
  return getIdealGrowThreadCountForOneIteration(ns, host);
}

/**
 *
 * We want each G/W/H to take a MAX of 1/3rd server RAM
 * @param ns
 * @param suggestion
 * @returns
 */
const getMaxThreadCountForIdeal = (ns: NS, suggestion: number) => {
  if (suggestion === Infinity) {
    return 10;
  }
  return suggestion;
  const scriptRamCost = ns.getScriptRam('HWG.js');
  const host = ns.getHostname();
  const maxServerRam = ns.getServerMaxRam(host);
  //   const currentRam = ns.getServerUsedRam(host);
  //   const ramAvailable = maxServerRam - currentRam;
  const NUM_PROCESSES = 3.1; // H/W/G -- 0.1 for buffer
  //   const maxThreadsForProcess = Math.floor(maxServerRam / 3.1); // generally the grow script is hungry
  //   const maxThreadsForProcess = Math.floor(maxServerRam / 3.1);
  //   const maxThreadsForProcess = Math.floor(maxServerRam / NUM_PROCESSES);
  //  const maxThreadsForProcess = Math.floor(ramAvailable / scriptRamCost / NUM_PROCESSES);
  const maxThreadsForProcess = Math.floor(maxServerRam / scriptRamCost / NUM_PROCESSES);
  const res = Math.min(suggestion, maxThreadsForProcess);
  //   console.log({ scriptRamCost, host, maxServerRam, NUM_PROCESSES, maxThreadsForProcess, suggestion, res });
  console.log({ suggestion, maxThreadsForProcess, res, scriptRamCost, host, maxServerRam });
  return res;
};

export type IdealThreadData = { threadCount: number; time: number; timeBuffer: number };
export const getIdealWeakenThreadCountForOneIteration = (ns: NS, host: string): IdealThreadData => {
  // export const getIdealWeakenThreadCountForOneIteration = async (ns: NS, host: string) => {
  const weakenTime = Math.ceil(ns.getWeakenTime(host));
  const minSecurity = ns.getServerMinSecurityLevel(host);
  const currentSecurity = ns.getServerSecurityLevel(host);
  const securityDifference = currentSecurity - minSecurity;
  if (!securityDifference) {
    return {
      threadCount: 1,
      time: weakenTime,
      timeBuffer: 0,
    };
  }

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
  // const currentWeakness = server
  return {
    threadCount: getMaxThreadCountForIdeal(ns, threadCount),
    time: weakenTime,
    timeBuffer: 0,
  };
};

export const getIdealGrowThreadCountForOneIteration = (ns: NS, host: string): IdealThreadData => {
  const maxMoney = ns.getServerMaxMoney(host);
  const growTime = Math.ceil(ns.getGrowTime(host));
  const currentMoney = ns.getServerMoneyAvailable(host) || 1;
  console.log({
    maxMoney: ns.formatNumber(maxMoney),
    currentMoney: ns.formatNumber(currentMoney),
    delta: ns.formatNumber(maxMoney - currentMoney),
  });
  // hacky way to still trigger a grow if the server is full
  if (currentMoney === maxMoney) {
    return {
      threadCount: 1,
      time: growTime,
      timeBuffer: 0,
    };
  }

  const threadResolution = 50;
  let threadCountGuess = 10;
  //   const moneyDifference = maxMoney - currentMoney;

  if (true) {
    const formulasData = readFormulasData(ns)[host];
    console.log({ formulasData });
    return {
      threadCount: formulasData.grow,
      time: growTime,
      timeBuffer: 0,
    };
  }

  if (false) {
    //   if (ns.fileExists('formulas.exe', 'home')) {
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
    /**
     * We assume that the growth factor starts from the minimum amount of available dollars
     */
    const counter = 0;
    let loops = 0;
    //  let loop =
    //  const availableMoneyCalc = threadCountGuess;
    //  while (!counter) {
    const growthMultiplier = ns.getServerGrowth(host);
    let prevGuess;
    while (true) {
      // console.log('NO FORMULAS');
      //  const availableMoneyCalc = currentMoney || threadCountGuess
      // const wantedGrowthFactor = Math.ceil(threadCountGuess * growthMultiplier);
      // const wantedGrowthFactor = Math.ceil((maxMoney / threadCountGuess) * growthMultiplier);
      const redditGrowth =
        Math.min(1 + 0.03 / ns.getServerSecurityLevel(host), 1.0035) ^ (threadCountGuess * (growthMultiplier / 100));
      // const wantedGrowthFactor = Math.ceil(Math.min((maxMoney / threadCountGuess) * growthMultiplier, 100_000));
      // const wantedGrowthFactor = Math.ceil(Math.min((maxMoney / threadCountGuess) * growthMultiplier, 10_000));
      // const wantedGrowthFactor = Math.ceil(Math.min((maxMoney / availableMoneyCalc) * growthMultiplier, 10_000));
      // const wantedGrowthFactor = Math.ceil(Math.min(maxMoney / (availableMoneyCalc * growthMultiplier), 10_000));
      // const thing = ns.growthAnalyzeSecurity(host, multiplier)
      // const wantedGrowthFactor = Math.ceil(Math.min(maxMoney / (availableMoneyCalc * growthMultiplier), 10_000));

      const moneyForThreadCountsInCalc = threadCountGuess;
      const serverMoneyAfterGrowthFactor = moneyForThreadCountsInCalc * redditGrowth;
      // console.log({ redditGrowth, moneyForThreadCountsInCalc, serverMoneyAfterGrowthFactor });
      // const serverMoneyAfterGrowthFactor = moneyForThreadCountsInCalc * wantedGrowthFactor;
      // const serverMoneyAfterGrowthFactor = currentMoney * wantedGrowthFactor;
      if (prevGuess === serverMoneyAfterGrowthFactor) {
        console.log('BREAK HERE???');
        break;
      }
      prevGuess = serverMoneyAfterGrowthFactor;

      // console.log({
      //   serverMoneyAfterGrowthFactor,
      //   maxMoney,
      //   threadCountGuess,
      //   growthMultiplier,
      //  wantedGrowthFactor,
      //   redditGrowth,
      // });
      const doneCalculatingNumThreads = serverMoneyAfterGrowthFactor >= maxMoney;
      // console.log({
      //   shouldIncreaseThreads: doneCalculatingNumThreads,
      //   serverMoneyAfterGrowthFactor,
      //   maxMoney,
      //   wantedGrowthFactor,
      //   threadCountGuess,
      // });

      if (loops > 50_000) {
        console.log('BREAK WHILE');
        break;
      }
      ++loops;

      if (doneCalculatingNumThreads) {
        //   const threadCount = Math.ceil(ns.growthAnalyze(host, wantedGrowthFactor));
        //   threadCountGuess = threadCount;
        break;
        //   ++counter;
      }

      // if (doneCalculatingNumThreads) {
      //   const threadCount = Math.ceil(ns.growthAnalyze(host, wantedGrowthFactor));
      //   threadCountGuess = threadCount;
      //   break;
      //   //   ++counter;
      // }

      // const threadCount = Math.ceil(ns.growthAnalyze(host, wantedGrowthFactor));
      // console.log(`[${host}]`, {
      //   growthMultiplier,
      //   maxMoney,
      //   currentMoney,
      //   moneyDifference,
      //   wantedGrowthFactor,
      //   suggestedThreadCount: threadCount,
      //   //   incThreadCountBy: threadCount
      // });
      threadCountGuess += threadResolution;
      // threadCountGuess += threadResolution;
      // threadCountGuess += threadResolution;
      // threadCountGuess += 10;
    }

    //  threadCountGuess = threadCountGuess;
  }

  return {
    threadCount: getMaxThreadCountForIdeal(ns, threadCountGuess),
    //  threadCount: threadCountGuess * 1.1,
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
  // if(ns.fileExists())
  const singleThreadMultiplier = ns.hackAnalyze(host);
  //   let a = ns.getHackingMultipliers()
  //   console.log({ singleThreadMultiplier });
  const threadCount = Math.ceil(1 / singleThreadMultiplier);
  const hackTime = Math.ceil(ns.getHackTime(host));
  console.log({ singleThreadMultiplier, threadCount, getHackTime: hackTime });

  return {
    threadCount: getMaxThreadCountForIdeal(ns, threadCount),
    time: hackTime,
    timeBuffer: 0,
  };
};
