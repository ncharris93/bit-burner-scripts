import { NS } from '@ns';
import {
  getIdealGrowThreadCountForOneIteration,
  getIdealHackThreadCountForOneIteration,
  getIdealWeakenThreadCountForOneIteration,
} from './utils';

export const getServerData = (ns: NS, host: string) => {
  return {
    [host]: {
      weaken: getIdealWeakenThreadCountForOneIteration(ns, host),
      hack: getIdealHackThreadCountForOneIteration(ns, host),
      grow: getIdealGrowThreadCountForOneIteration(ns, host),
    },
  };
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
  return;

  //   const weaken = async () => ({
  //     n00dles: await getIdealWeakenThreadCountForOneIteration(ns, 'n00dles'),
  //     foodnstuff: await getIdealWeakenThreadCountForOneIteration(ns, 'foodnstuff'),
  //     'sigma-cosmetics': await getIdealWeakenThreadCountForOneIteration(ns, 'sigma-cosmetics'),
  //     joesguns: await getIdealWeakenThreadCountForOneIteration(ns, 'joesguns'),
  //     'hong-fang-tea': await getIdealWeakenThreadCountForOneIteration(ns, 'hong-fang-tea'),
  //     'harakiri-sushi': await getIdealWeakenThreadCountForOneIteration(ns, 'harakiri-sushi'),
  //     'iron-gym': await getIdealWeakenThreadCountForOneIteration(ns, 'iron-gym'),
  //   });

  //   const grow = async () => ({
  //     n00dles: await getIdealGrowThreadCountForOneIteration(ns, 'n00dles'),
  //     foodnstuff: await getIdealGrowThreadCountForOneIteration(ns, 'foodnstuff'),
  //     'sigma-cosmetics': await getIdealGrowThreadCountForOneIteration(ns, 'sigma-cosmetics'),
  //     joesguns: await getIdealGrowThreadCountForOneIteration(ns, 'joesguns'),
  //     'hong-fang-tea': await getIdealGrowThreadCountForOneIteration(ns, 'hong-fang-tea'),
  //     'harakiri-sushi': await getIdealGrowThreadCountForOneIteration(ns, 'harakiri-sushi'),
  //     'iron-gym': await getIdealGrowThreadCountForOneIteration(ns, 'iron-gym'),
  //   });

  //   const hack = async () => ({
  //     n00dles: await getIdealHackThreadCountForOneIteration(ns, 'n00dles'),
  //     foodnstuff: await getIdealHackThreadCountForOneIteration(ns, 'foodnstuff'),
  //     'sigma-cosmetics': await getIdealHackThreadCountForOneIteration(ns, 'sigma-cosmetics'),
  //     joesguns: await getIdealHackThreadCountForOneIteration(ns, 'joesguns'),
  //     'hong-fang-tea': await getIdealHackThreadCountForOneIteration(ns, 'hong-fang-tea'),
  //     'harakiri-sushi': await getIdealHackThreadCountForOneIteration(ns, 'harakiri-sushi'),
  //     'iron-gym': await getIdealHackThreadCountForOneIteration(ns, 'iron-gym'),
  //   });

  const getSleepTime = (things: { time: number }[]) => {
    const sleepTimeBeforePrinting = Object.keys(things).reduce((res, curr) => {
      const time = things[curr].time;
      return time > res ? time : res;
    }, 0);
    return sleepTimeBeforePrinting;
  };

  //   const grows = await grow();
  //   const weaks = await weaken();
  //   const hacks = await hack();

  //   console.log('weaken', weaks);
  //   console.log('grow', grows);
  //   console.log('hack', hacks);

  /**
   * weaken
   */
  //   const ideal = weaks
  const ideal = hacks;
  //   const ideal = grows;
  Object.keys(ideal).forEach((key) => {
    //@ts-expect-error:: key is typeof string
    const threads: number = ideal[key].threadCount;
    console.log({ threads });
    //  ns.exec('grow.js', 'home', threads, key);
    ns.exec('hack.js', 'home', threads, key);
    //  ns.exec('weaken.js', 'home', threads, key);
  });
  const sleepTimeBeforePrinting = getSleepTime(ideal);
  console.log(`Sleeping for ${sleepTimeBeforePrinting}ms before printing, please wait...`);

  await ns.sleep(sleepTimeBeforePrinting);
  console.log(await weaken());
}
