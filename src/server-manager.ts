import { NS } from '@ns';
import {
  getIdealGrowThreadCountForOneIteration,
  getIdealHackThreadCountForOneIteration,
  getIdealWeakenThreadCountForOneIteration,
} from './utils';

const kickoff = (place: number, buffer: number) => {
  const res = buffer + place * 50;
  //  console.log({ kickoffRes: res, place, buffer });
  return res;
};

export const getServerData = (ns: NS, host: string) => {
  const res = {
    [host]: {
      weaken: getIdealWeakenThreadCountForOneIteration(ns, host),
      hack: getIdealHackThreadCountForOneIteration(ns, host),
      grow: getIdealGrowThreadCountForOneIteration(ns, host),
    },
  };

  const data = res[host];
  const maxTaskTime = res[host].weaken.time;
  const hackTimeBuffer = kickoff(1, maxTaskTime - res[host].hack.time);
  const growTimeBuffer = kickoff(2, maxTaskTime - res[host].grow.time);
  const weakenTimeBuffer = kickoff(3, maxTaskTime - res[host].weaken.time);
  //   const growTimeBuffer = maxTaskTime - res[host].grow.time;
  //   const hackTimeBuffer = maxTaskTime - res[host].hack.time;
  //   const weakenTimeBuffer = maxTaskTime - res[host].weaken.time;

  res[host].grow.timeBuffer = growTimeBuffer;
  res[host].grow.expectedEndTime = growTimeBuffer + data.grow.time;

  res[host].hack.timeBuffer = hackTimeBuffer;
  res[host].hack.expectedEndTime = hackTimeBuffer + data.hack.time;

  res[host].weaken.timeBuffer = weakenTimeBuffer;
  res[host].weaken.expectedEndTime = weakenTimeBuffer + data.weaken.time;

  return res;
};
/** @param {NS} ns */
export async function main(ns: NS) {
  const hostnames = [
    'n00dles',
    'foodnstuff',
    'sigma-cosmetics',
    'joesguns',
    'hong-fang-tea',
    'harakiri-sushi',
    'iron-gym',
  ];

  const serverData = hostnames.map((host) => getServerData(ns, host));

  console.log({ serverData });
  throw new Error('Not supposed to call this as script');
  return;
}
