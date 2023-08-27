import { Sleeve } from './../NetscriptDefinitions.d';
import { NS } from '@ns';
import { getNodeArray } from './get-node-array';
import { NCH_Server, mapHostToServer } from './map-host-to-server';
import { getCurrentTarget } from './get-current-target';
import { IdealServerData, getServerData } from './server-manager';
import { HWG } from './types';
import { getPriorityTargetList } from './get-priority-target-list';

/**
 * TODO: ideally this could play nice with the server-upgrade-manager?
 */

export async function main(ns: NS) {
  return swarmManager(ns);
}

const TIME_BETWEEN_ITERATIONS = 10_000;

export async function swarmManager(ns: NS) {
  //   const scriptRam = ns.getScriptRam('weaken.js'); // this is b/c HWG uses same things
  const scriptRam = ns.getScriptRam('HWG.js');
  const allNodes = getNodeArray(ns);
  const serverFilter = (s: NCH_Server) => s.maxMem > scriptRam && s.canHack;
  const getMyServers = () => mapHostToServer(ns, getNodeArray(ns)).filter(serverFilter);
  const myServers = getMyServers();

  const homeRamToSpare = 10;
  const totalMemoryToUse = myServers.reduce((res, cur) => (res += cur.maxMem), 0) - homeRamToSpare;
  //   console.log({ totalMemoryToUse });
  const getNetworkRamRemaining = () =>
    mapHostToServer(ns, allNodes)
      .filter(serverFilter)
      .reduce((res, cur) => (res += cur.maxMem), 0) - homeRamToSpare;

  const targets = await getPriorityTargetList(ns);
  console.log({ scriptRam });
  const targetIndex = 0;
  const target = () => targets[targetIndex % targets.length];
  //   const target = () => mapHostToServer(ns, ['foodnstuff'])[0];
  //  const
  //   const target = getCurrentTarget(ns);
  if (!target()) {
    throw new Error('No target?');
  }

  type TargetData = ReturnType<typeof getTargetData>;
  const getTargetData = () => getServerData(ns, target().name)[target().name];

  /**
   * while loop here
   */
  const getTotalRamNeeded = (t = getTargetData()) => {
    const totalRamNeeded = (t.grow.threadCount + t.hack.threadCount + t.weaken.threadCount) * scriptRam;
    return totalRamNeeded;
  };

  //   const canExecuteFully = () => {
  //     const t = getTargetData();
  //     //  const targetData = getTargetData();
  //     //  const t = targetData[target().name];
  //     const totalRamNeeded = getTotalRamNeeded(t);
  //     const canFullyExecuteCycle = totalRamNeeded <= totalMemoryToUse;
  //     console.log({ totalRamNeeded, scriptRam, totalMemoryToUse, canFullyExecuteCycle });
  //     return canFullyExecuteCycle;
  //   };

  //   console.log({ target, targetData, totalRamNeeded, canFullyExecuteCycle });

  //   while (!canExecuteFully()) {
  //     //   console.log(`Unable to fully target ${target().name}, trying next`);
  //     //  console.log({ target: { ...target() } });
  //     ++targetIndex;
  //     console.log({ nextTarget: { ...target() } });
  //     //  console.log(`New Target: ${target().name}`);
  //   }

  const t = getTargetData(); //[target().name];
  const numTimesCanExecute = totalMemoryToUse / getTotalRamNeeded();
  const numThreadsForFullCycle = Math.floor(
    numTimesCanExecute * (t.grow.threadCount + t.hack.threadCount + t.weaken.threadCount),
  );
  console.log({ numTimesCanExecute, totalMemoryToUse, totalRam: getTotalRamNeeded(), numThreadsForFullCycle });

  /**
   * while loop ends here
   */

  const methodCycle = ['hack', 'grow', 'weaken'];
  let methodIndex = 0;
  let hostIndex = 0;
  let networkRamRemaining = totalMemoryToUse;
  const currentMethod = () => methodCycle[methodIndex % methodCycle.length] as HWG;
  //   const host = myServers[hostIndex];
  const host = () => getMyServers()[hostIndex % getMyServers().length];
  const getServerRamRemaining = () => {
    if (host().name === 'home') {
      return ns.getServerMaxRam('home') - homeRamToSpare - scriptRam;
    }
    return host().maxMem - scriptRam;
  };

  let serverRamRemaining = getServerRamRemaining();
  let counter = 0;
  const methodCycleCounter = 0;

  const getThreadCounter = () => {
    const t = getTargetData();
    return {
      hack: t.hack.threadCount,
      weaken: t.weaken.threadCount,
      grow: t.grow.threadCount,
    };
  };

  let threadCounter = getThreadCounter();
  ns.tprint('INFO Starting Thread Counter:', { threadCounter: { ...threadCounter } });

  myServers.forEach(({ name }) => ns.scp('HWG.js', name));

  const threadCount = () => t[currentMethod()].threadCount;

  console.log({ myServers });
  let cycleStartTime = Date.now();
  let numThreadsLeftBeforeRest = numThreadsForFullCycle;
  let startCycleMethod = currentMethod();

  while (getNetworkRamRemaining() > 0) {
    const maxServerThreads = Math.floor(serverRamRemaining / scriptRam);
    const numThreadsForServer = Math.min(
      maxServerThreads,
      threadCount(),
      threadCounter[currentMethod()],
      numThreadsLeftBeforeRest,
    );

    /**
    numthr * TODO this needs tweaking, should check if there is enough ram on the given host to run the job, and if not, wait(?)
     */
    if (numThreadsForServer <= 0) {
      console.log('Not enough threads for server... trying next host', {
        currentHost: host().name,
        maxServerThreads,
        tc: threadCount(),
        tctr: threadCounter[currentMethod()],
        serverRamRemaining,
        scriptRam,
      });
      ++hostIndex;
      serverRamRemaining = getServerRamRemaining();

      await ns.sleep(10_000);
      continue;
    }
    const amountOfRamUsed = numThreadsForServer * scriptRam;
    serverRamRemaining -= amountOfRamUsed;
    networkRamRemaining -= amountOfRamUsed;

    //  console.log({ ...threadCounter });
    threadCounter[currentMethod()] -= numThreadsForServer;

    const data = t[currentMethod()];

    ns.tprint(`[${currentMethod()}][${counter}]:[${numThreadsForServer}] ${host().name} against ${target().name}`);
    const timer = Date.now();

    ns.exec(
      'HWG.js',
      host().name,
      { threads: numThreadsForServer, ramOverride: scriptRam },
      ...[currentMethod(), target().name, data.timeBuffer, timer, counter, host().name, numThreadsForServer],
    );

    numThreadsLeftBeforeRest -= numThreadsForServer;
    if (numThreadsLeftBeforeRest <= 0) {
      const threadData = getTargetData()[startCycleMethod];
      const waitTime =
        threadData.time +
        threadData.timeBuffer -
        (Date.now() - cycleStartTime) -
        (methodIndex % 3) * TIME_BETWEEN_ITERATIONS;

      const timeStr = waitTime / 1000 > 180 ? `${waitTime / 1000 / 60}min` : `${waitTime / 1000}s`;
      ns.tprint(`INFO: MAX num utilized threads reached, waiting for ${timeStr} based off ${startCycleMethod} time.`);
      await ns.sleep(waitTime);
      numThreadsLeftBeforeRest = numThreadsForFullCycle;
    }

    const needToUseNextHost = serverRamRemaining <= 0;
    //  console.log({ needToUseNextHost });
    if (needToUseNextHost) {
      ++hostIndex;
      serverRamRemaining = getServerRamRemaining();

      /**
       * TODO if you go through the whole cycle on a single method, then we need to wait the amount of time of the HWG method
       */

      const isNewSererCycle = host().name === 'home';
      if (isNewSererCycle) {
        startCycleMethod = currentMethod();
        cycleStartTime = Date.now();
      }
      // console.log('Next Host');
      // await ns.sleep(1000);
      // if (isNewSererCycle) {
      //   //   const extraTime = TIME_BETWEEN_ITERATIONS * methodCycleCounter + 50;
      //   //   const sleepTime = t.weaken.time - extraTime; // 50 is a buffer?
      //   methodCycleCounter = 0;
      //   //   console.log(
      //   //     `FALSE: Hit new serer cycle, sleeping for ${sleepTime},  this was subtracted from the weaken time: ${extraTime}`,
      //   //   );
      //   //   await ns.sleep(sleepTime);
      // }
    }

    const needToUseNextMethod = threadCounter[currentMethod()] <= 0;
    if (needToUseNextMethod) {
      ++methodIndex;
      const startingNewCycle = currentMethod() === 'hack';

      if (startingNewCycle) {
        threadCounter = getThreadCounter();
        ns.tprint('INFO getting threadCounter', { ...threadCounter });
      }
      const sleepTime = Math.min(TIME_BETWEEN_ITERATIONS, Math.ceil(t.weaken.time / numTimesCanExecute));
      ns.tprint(`INFO New HWG Cycle, sleeping for ${sleepTime / 1000}sec`);
      await ns.sleep(sleepTime);
    }

    ++counter;
  }

  console.log('ERROR Whelp...this is awkward...');
}
