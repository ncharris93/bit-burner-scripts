import { NS } from '@ns';
import { readFormulasData } from './formulas/formulas-read';

export const isNewGame = (ns: NS) => ns.getHackingLevel() < 100;

export async function main(ns: NS) {
  const host = ns.args[0] as string;
  return getIdealGrowThreadCountForOneIteration(ns, host);
}

const getMaxThreadCountForIdeal = (ns: NS, suggestion: number) => {
  if (suggestion === Infinity) {
    return 10;
  }
  return suggestion;
};

export type IdealThreadData = { threadCount: number; time: number; timeBuffer: number };
export const getIdealWeakenThreadCountForOneIteration = (ns: NS, host: string): IdealThreadData => {
  const weakenTime = Math.ceil(ns.getWeakenTime(host));
  const securityDifference = 100 - ns.getServerMinSecurityLevel(host);

  let threadCount = 0;
  const threadResolution = 10;
  let loop = true;

  while (loop) {
    const wAn = ns.weakenAnalyze(threadCount);
    const willFullyWeaken = securityDifference - wAn <= 0;
    if (willFullyWeaken) {
      loop = false;
    }
    threadCount += threadResolution;
  }

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

  if (true) {
    const formulasData = readFormulasData(ns)[host];
    console.log({ formulasData });
    return {
      threadCount: formulasData.growThreads,
      time: growTime,
      timeBuffer: 0,
    };
  }
};

export const getIdealHackThreadCountForOneIteration = (ns: NS, host: string): IdealThreadData => {
  const formulasData = readFormulasData(ns)[host];
  const singleThreadMultiplier = formulasData.hackPercent / 100;
  const threadCount = Math.ceil(1 / singleThreadMultiplier);
  const hackTime = Math.ceil(ns.getHackTime(host));
  console.log({ singleThreadMultiplier, threadCount, getHackTime: hackTime });

  return {
    threadCount: getMaxThreadCountForIdeal(ns, threadCount),
    time: hackTime,
    timeBuffer: 0,
  };
};
