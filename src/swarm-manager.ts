import { NS } from '@ns';
import { getNodeArray } from './get-node-array';
import { NCH_Server, mapHostToServer } from './map-host-to-server';
import { getCurrentTarget } from './get-current-target';
import { getServerData } from './server-manager';
import { HWG } from './types';

/**
 * TODO: ideally this could play nice with the server-upgrade-manager?
 */

export async function main(ns: NS) {
  return swarmManager(ns);
}

const TIME_BETWEEN_ITERATIONS = 10_000;

export async function swarmManager(ns: NS) {
  const scriptRam = ns.getScriptRam('HWG.js');
  const allNodes = getNodeArray(ns);
  const serverFilter = (s: NCH_Server) => s.maxMem > scriptRam && s.canHack;
  const myServers = mapHostToServer(ns, allNodes).filter(serverFilter);

  const homeRamToSpare = 10;
  const totalMemoryToUse = myServers.reduce((res, cur) => (res += cur.maxMem), 0) - homeRamToSpare;
  //   console.log({ totalMemoryToUse });
  const getNetworkRamRemaining = () =>
    mapHostToServer(ns, allNodes)
      .filter(serverFilter)
      .reduce((res, cur) => (res += cur.maxMem), 0) - homeRamToSpare;

  console.log({ scriptRam });
  const target = getCurrentTarget(ns);
  if (!target) {
    throw new Error('No target?');
  }

  const targetData = getServerData(ns, target?.name);
  const t = targetData[target.name];

  const totalRamNeeded = (t.grow.threadCount + t.hack.threadCount + t.weaken.threadCount) * scriptRam;

  const canFullyExecuteCycle = totalRamNeeded <= totalMemoryToUse;
  //   console.log({ target, targetData, totalRamNeeded, canFullyExecuteCycle });

  if (!canFullyExecuteCycle) {
    throw new Error('Not yet implemented! TODO');
  }

  const methodCycle = ['hack', 'grow', 'weaken'];
  let methodIndex = 0;
  let hostIndex = 0;
  let networkRamRemaining = totalMemoryToUse;
  const currentMethod = () => methodCycle[methodIndex % methodCycle.length] as HWG;
  //   const host = myServers[hostIndex];
  const host = () => myServers[hostIndex % myServers.length];
  const getServerRamRemaining = () => {
    if (host().name === 'home') {
      return ns.getServerMaxRam('home') - homeRamToSpare - scriptRam;
    }
    return host().maxMem - scriptRam;
  };

  let serverRamRemaining = getServerRamRemaining();
  let counter = 0;
  let methodCycleCounter = 0;

  const getThreadCounter = () => ({
    hack: t.hack.threadCount,
    weaken: t.weaken.threadCount,
    grow: t.grow.threadCount,
  });

  let threadCounter = getThreadCounter();
  //   console.log({ threadCounter: { ...threadCounter } });

  myServers.forEach(({ name }) => ns.scp('HWG.js', name));

  const threadCount = () => t[currentMethod()].threadCount;

  //   console.log({ myServers });

  while (getNetworkRamRemaining() > 0) {
    const maxServerThreads = Math.floor(serverRamRemaining / scriptRam);
    const numThreadsForServer = Math.min(Math.floor(maxServerThreads), threadCount(), threadCounter[currentMethod()]);

    /**
     * TODO this needs tweaking, should check if there is enough ram on the given host to run the job, and if not, wait(?)
     */
    if (numThreadsForServer <= 0) {
      // ++hostIndex;
      console.log('Not enough threads for server... trying next host');
      //     ,{
      //   hostIndex,
      //   numThreadsForServer,
      //   maxServerThreads,
      //   serverRamRemaining,
      //   scriptRam,
      // });
      // if (numThreadsForServer === 0) {
      //   console.log('No threads available, trying next server');
      ++hostIndex;
      serverRamRemaining = getServerRamRemaining();

      // console.log({ hostIndex, get: getServerRamRemaining(), serverRamLeft: serverRamRemaining, host: host() });
      // }
      // await ns.sleep(1_000);
      await ns.sleep(10_000);
      continue;
    }
    //  if (numThreadsForServer === 0) {
    //    console.log('No threads available, trying next server');
    //    ++hostIndex;
    //  }
    const amountOfRamUsed = numThreadsForServer * scriptRam;
    //  console.log({
    //    host: host().name,
    //    counter,
    //    numThreadsForServer,
    //    amountOfRamUsed,
    //    serverRamRemaining: `${serverRamRemaining}`,
    //    networkRamRemaining,
    //    maxServerThreads,
    //    threadCount: threadCount(),
    //  });
    serverRamRemaining -= amountOfRamUsed;
    networkRamRemaining -= amountOfRamUsed;

    //  console.log({
    //    numThreadsForServer,
    //    amountOfRamUsed,
    //    currentMethod: currentMethod(),
    //    host: host().name,
    //    target: target.name, against  against  against
    //    serverRamRemaining: `${serverRamRemaining}`,
    //    networkRamRemaining: `${networkRamRemaining}`,
    //  });

    //  console.log({ threadCounter });
    //  console.log({ threadCounter: { ...threadCounter }, currentMethod: currentMethod(), numThreadsForServer });
    //  console.log(
    //    `Subtracting ${numThreadsForServer} from the threadCounter's ${currentMethod()} method. Current Value: ${
    //      threadCounter[currentMethod()]
    //    }`,
    //  );
    threadCounter[currentMethod()] -= numThreadsForServer;
    //  console.log({ threadCounter });
    console.log({ threadCounter: { ...threadCounter } });

    const data = t[currentMethod()];

    console.log(
      `${host().name} is running ${currentMethod()} with ${numThreadsForServer} threads against target ${target.name}`,
    );
    const timer = Date.now();
    ns.exec(
      'HWG.js',
      host().name,
      numThreadsForServer,
      ...[currentMethod(), target.name, data.timeBuffer, timer, counter, host().name, numThreadsForServer],
    );

    const needToUseNextHost = serverRamRemaining <= 0;
    console.log({ needToUseNextHost });
    if (needToUseNextHost) {
      ++hostIndex;
      serverRamRemaining = getServerRamRemaining();

      const isNewSererCycle = host().name === 'home';
      if (isNewSererCycle) {
        const sleepTime = t.weaken.time - TIME_BETWEEN_ITERATIONS * methodCycleCounter + 50; // 50 is a buffer?
        methodCycleCounter = 0;
        console.log(`Hit new serer cycle, sleeping for ${sleepTime}`);
        await ns.sleep(sleepTime);
      }
    }

    const needToUseNextMethod = threadCounter[currentMethod()] <= 0;
    console.log({ needToUseNextMethod });
    if (needToUseNextMethod) {
      ++methodIndex;
      const startingNewCycle = currentMethod() === 'hack';
      if (startingNewCycle) {
        ++methodCycleCounter;
        console.log('New Method Cycle, sleeping...', { TIME_BETWEEN_ITERATIONS });
        threadCounter = getThreadCounter();
        await ns.sleep(TIME_BETWEEN_ITERATIONS);
      }
    }

    ++counter;
  }

  console.log('Whelp...this is awkward...');

  // []
  //  const execute = (iteration: number) => {
  //  //  console.log({ hackTimeBuffer, growTimeBuffer, weakenTimeBuffer });
  //   const timer = Date.now();
  //  serverData = getServerData(ns, target);
  //  //  const sd2 = mapHostToServer(ns, [target]);
  //  //  console.log({ serverData, sd2 });
  //  //  console.log(`[${target}] [${iteration}] kickoff data: `, serverData[target]);

  //   ['hack', 'grow', 'weaken'].forEach((type) => {
  //     //@ts-expect-error:: mad about keying target
  //     const data: IdealThreadData = targetData[target][type];
  //     // if (data.threadCount) {
  //     // ...[] to show parameters
  //     ns.exec(
  //       'HWG.js',
  //       host,
  //       data.threadCount,
  //       ...[type, target, data.timeBuffer, timer, iteration, host, data.threadCount],
  //     );
  //     // }
  //   });

  //  return;
  //   };
  //
  //   ns.exec(
  //  'HWG.js',
  //  host,
  //  { threads: t.hack.threadCount },
  //  'hack',
  //  target.name,
  //  t.hack.timeBuffer,
  //  host,
  //  t.hack.threadCount,
  //   );
  //   ns.exec(
  //  'HWG.js',
  //  host,
  //  { threads: t.hack.threadCount },
  //  'grow',
  //  target.name,
  //  t.hack.timeBuffer,
  //  host,
  //  t.hack.threadCount,
  //   );
  //   ns.exec(
  //  'HWG.js',
  //  host,
  //  { threads: t.hack.threadCount },
  //  'weaken',
  //  target.name,
  //  t.hack.timeBuffer,
  //  host,
  //  t.hack.threadCount,
  //   );
  //   ns.hack(target.name, { threads: t.hack.threadCount });
  //   ns.weaken(target.name, { threads: t.weaken.threadCount });
  //   ns.grow(target.name, { threads: t.grow.threadCount });
}
