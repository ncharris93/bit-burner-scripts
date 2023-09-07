import { NS } from '@ns';

const POLL_RATE = 3_000;
const POLL_DATA_LENGTH = 100;
const POLLS_PER_ANALYSIS = 10;

type History = {
  priceHistory: number[];
  analysis: number[];
};
type PollData = {
  [symbol: string]: History;
};

const pollingData: PollData = {};

export function main(ns: NS) {
  return pollDance(ns);
}

export const pollDance = async (ns: NS) => {
  const symbols = ns.stock.getSymbols();
  let counter = 0;

  while (++counter) {
    symbols.forEach((sym) => {
      const def: History = {
        priceHistory: [],
        analysis: [],
      };
      pollingData[sym] = pollingData[sym] || def;
      const p = pollingData[sym];
      p.priceHistory.push(ns.stock.getPrice(sym));
      if (p.priceHistory.length > POLL_DATA_LENGTH) {
        p.priceHistory.shift();
      }
    });
    await ns.sleep(POLL_RATE);
    if (counter % POLLS_PER_ANALYSIS === 0) {
      symbols.forEach((sym) => {
        pollingData[sym].analysis.push(basicBitchAnalysis(ns, pollingData[sym].priceHistory));
      });
      const log = Object.keys(pollingData)
        .sort((a, b) => pollingData[b].analysis.slice(-1)[0] - pollingData[a].analysis.slice(-1)[0])
        .map((key) => `${key}: ${pollingData[key].analysis}`);
      console.log({ pollingData: log });
    }
  }
};

/**
 *
 * @param ns
 * @param hist
 * @returns the basic percent trend of a given stock
 */
const basicBitchAnalysis = (ns: NS, hist: History['priceHistory']) => {
  const firstThreeAvg = hist.slice(0, 3).reduce((sum, cur) => (sum += cur), 0);
  const lastThreeAvg = hist.slice(-3).reduce((sum, cur) => (sum += cur), 0);
  //   const magnitude = firstThreeAvg / lastThreeAvg; // > 1 trends up , < 1 trends down
  const magnitudePercent = (lastThreeAvg - firstThreeAvg) / firstThreeAvg;
  return magnitudePercent;
};

// const buyStuff = (ns:NS) =>{
//    const thingToBuy =

// }
