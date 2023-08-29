import { NS } from '@ns';
import { getNodeArray } from './get-node-array';
import { NCH_Server, mapHostToServer } from './map-host-to-server';
import { getServerData } from './server-manager';
import { HWG } from './types';
// import { getPriorityTargetList } from './get-priority-target-list';
import { getTimeString } from './logger';
import { getCurrentTarget } from './get-current-target';

/**
 * TODO: ideally this could play nice with the server-upgrade-manager?
 */

export async function main(ns: NS) {
  return swarmManager(ns);
}

const TIME_BETWEEN_ITERATIONS = 10_000;

export async function swarmManager(ns: NS) {
  const scriptRam = ns.getScriptRam('weaken.js');
  //   const scriptRam = ns.getScriptRam('HWG.js');
  const allNodes = getNodeArray(ns);
  const serverFilter = (s: NCH_Server) => s.maxMem > scriptRam && s.canHack;
  const getMyServers = () => mapHostToServer(ns, getNodeArray(ns)).filter(serverFilter);
  const myServers = getMyServers();

  const homeRamToSpare = 10;
  const totalMemoryToUse = myServers.reduce((res, cur) => (res += cur.maxMem), 0) - homeRamToSpare;
  const getNetworkRamRemaining = () =>
    mapHostToServer(ns, allNodes)
      .filter(serverFilter)
      .reduce((res, cur) => (res += cur.maxMem), 0) - homeRamToSpare;

  //   const targets = await getPriorityTargetList(ns);
  console.log({ scriptRam });
  //   const targetIndex = 0;
  //   const target = () => targets[targetIndex % targets.length];
  const target = () => getCurrentTarget(ns) as NCH_Server;
  if (!target()) {
    throw new Error('No target?');
  }

  const getTargetData = () => getServerData(ns, target().name)[target().name];

  const getTotalRamNeeded = (t = getTargetData()) => {
    const totalRamNeeded = (t.grow.threadCount + t.hack.threadCount + t.weaken.threadCount) * scriptRam;
    return totalRamNeeded;
  };

  const t = getTargetData(); //[target().name];
  const numTimesCanExecute = totalMemoryToUse / getTotalRamNeeded();
  const numThreadsForFullCycle = Math.floor(
    numTimesCanExecute * (t.grow.threadCount + t.hack.threadCount + t.weaken.threadCount),
  );
  console.log({ numTimesCanExecute, totalMemoryToUse, totalRam: getTotalRamNeeded(), numThreadsForFullCycle });

  const methodCycle = ['hack', 'grow', 'weaken'];
  let methodIndex = 0;
  let hostIndex = 0;
  let networkRamRemaining = totalMemoryToUse;
  const getCurrentMethod = () => methodCycle[methodIndex % methodCycle.length] as HWG;
  const host = () => getMyServers()[hostIndex % getMyServers().length];
  const getServerRamRemaining = () => {
    if (host().name === 'home') {
      return ns.getServerMaxRam('home') - ns.getServerUsedRam('home') - homeRamToSpare - scriptRam;
    }
    return host().maxMem - ns.getServerUsedRam(host().name);
    //  return host().maxMem - ns.getServerUsedRam(host().name) - scriptRam;
  };

  let serverRamRemaining = getServerRamRemaining();
  let counter = 0;

  const getThreadCounter = (): Record<HWG, number> => {
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

  const threadCount = () => t[getCurrentMethod()].threadCount;

  console.log({ myServers });
  let cycleStartTime = Date.now();
  let numThreadsLeftBeforeRest = numThreadsForFullCycle;
  let startCycleMethod = getCurrentMethod();

  const getThreadsLeftForServer = () => {
    const res = getServerRamRemaining() / scriptRam;
    //  ns.tprint(`SUCCESS: threads left for server: ${res} - host: ${host().name}`);
    return res;
  };

  //   const waitTimeOffset = t.hack.timeBuffer;
  while (getNetworkRamRemaining() > 0) {
    const maxServerThreads = Math.floor(serverRamRemaining / scriptRam);
    const numThreadsForServer = Math.min(
      maxServerThreads,
      threadCount(),
      threadCounter[getCurrentMethod()],
      numThreadsLeftBeforeRest,
      getThreadsLeftForServer(),
    );

    /**
     * TODO this needs tweaking, should check if there is enough ram on the given host to run the job, and if not, wait(?)
     */
    if (numThreadsForServer <= 0) {
      // console.log('Not enough threads for server... trying next host', {
      //   currentHost: host().name,
      //   maxServerThreads,
      //   tc: threadCount(),
      //   tctr: threadCounter[getCurrentMethod()],
      //   serverRamRemaining,
      //   scriptRam,
      // });
      ++hostIndex;
      serverRamRemaining = getServerRamRemaining();

      await ns.sleep(1_000);
      continue;
    }
    const amountOfRamUsed = numThreadsForServer * scriptRam;
    serverRamRemaining -= amountOfRamUsed;
    networkRamRemaining -= amountOfRamUsed;

    //  console.log({ ...threadCounter });
    threadCounter[getCurrentMethod()] -= numThreadsForServer;

    const data = t[getCurrentMethod()];

    ns.tprint(
      `[${getTimeString()}][${getCurrentMethod()}][${counter}]:[${numThreadsForServer}] ${host().name} against ${
        target().name
      }`,
    );
    const timer = Date.now();

    ns.exec(
      'HWG.js',
      host().name,
      { threads: numThreadsForServer, ramOverride: scriptRam },
      ...[getCurrentMethod(), target().name, data.timeBuffer, timer, counter, host().name, numThreadsForServer],
    );

    numThreadsLeftBeforeRest -= numThreadsForServer;
    if (numThreadsLeftBeforeRest <= 0) {
      const threadData = getTargetData()[startCycleMethod];
      const waitTime =
        threadData.time +
        threadData.timeBuffer -
        (Date.now() - cycleStartTime) -
        (methodIndex % 3) * TIME_BETWEEN_ITERATIONS;

      ns.tprint(
        `INFO: MAX num utilized threads reached, waiting for ${msToTime(waitTime)} based off ${startCycleMethod} time.`,
      );
      await ns.sleep(waitTime);
      numThreadsLeftBeforeRest = numThreadsForFullCycle;
    }

    const needToUseNextHost = serverRamRemaining <= 0;
    if (needToUseNextHost) {
      ++hostIndex;
      serverRamRemaining = getServerRamRemaining();

      const isNewSererCycle = host().name === 'home';
      if (isNewSererCycle) {
        startCycleMethod = getCurrentMethod();
        cycleStartTime = Date.now();
      }
    }

    const needToUseNextMethod = threadCounter[getCurrentMethod()] <= 0;
    if (needToUseNextMethod) {
      ++methodIndex;
      const startingNewCycle = getCurrentMethod() === 'hack';

      if (startingNewCycle) {
        threadCounter = getThreadCounter();
        ns.tprint('INFO getting threadCounter', { ...threadCounter });
        /**
         * TODO Here we can set logic to determine if we'll make it more than a single method
         */
        if (threadCounter[getCurrentMethod()] > numThreadsLeftBeforeRest) {
          ns.tprint(`We could avoid waiting by ${data.timeBuffer}? (from ${getCurrentMethod()}'s time buffer)`);
        }
      }
      const sleepTime = Math.min(TIME_BETWEEN_ITERATIONS, Math.ceil(t.weaken.time / numTimesCanExecute));
      ns.tprint(`INFO New HWG Cycle, sleeping for ${sleepTime / 1000}sec`);
      await ns.sleep(sleepTime);
    }

    ++counter;
  }

  console.log('ERROR Whelp...this is awkward...');
}

function msToTime(duration: number) {
  const milliseconds = Math.floor((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}
