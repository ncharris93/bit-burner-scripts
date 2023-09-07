import { NS } from '@ns';
import { getNodeArray } from './get-node-array';
import { NCH_Server, mapHostToServer } from './map-host-to-server';
import { getServerData } from './server-manager';
import { HWG } from './types';
// import { getPriorityTargetList } from './get-priority-target-list';
import { getTimeString } from './logger';
import { getCurrentTarget } from './get-current-target';
import { isNewGame } from './utils';

/**
 * TODO: ideally this could play nice with the server-upgrade-manager?
 */

export async function main(ns: NS) {
  return swarmManager(ns);
}

const TIME_BETWEEN_ITERATIONS = 10_000;
const HOME_RAM_TO_SPARE = 50;

export async function swarmManager(ns: NS) {
  //   const scriptRam = ns.getScriptRam('weaken.js');
  const scriptRam = ns.getScriptRam('HWG.js');
  const allNodes = getNodeArray(ns);
  const serverFilter = (s: NCH_Server) => s.maxMem > scriptRam && s.canHack;
  //   const getMyServers = () => mapHostToServer(ns, getNodeArray(ns)).filter(serverFilter);
  const getMyServers = () => {
    const res = mapHostToServer(ns, getNodeArray(ns))
      .filter(serverFilter)
      .sort((a, b) => b.maxMem - a.maxMem);
    //  console.log({ myServers: res });
    return res;
  };
  const myServers = getMyServers();

  const totalMemoryToUse = myServers.reduce((res, cur) => (res += cur.maxMem), 0) - HOME_RAM_TO_SPARE;
  const getNetworkRamRemaining = () =>
    mapHostToServer(ns, allNodes)
      .filter(serverFilter)
      .reduce((res, cur) => (res += cur.maxMem), 0) - HOME_RAM_TO_SPARE;

  //   const targets = await getPriorityTargetList(ns);
  console.log({ scriptRam });
  //   const targetIndex = 0;
  //   const target = () => targets[targetIndex % targets.length];
  const target = (): NCH_Server =>
    isNewGame(ns) ? mapHostToServer(ns, ['foodnstuff'])[0] : (getCurrentTarget(ns) as NCH_Server);

  //   const target = (): NCH_Server =>
  //     isNewGame(ns) || ns.getServerMoneyAvailable('home') < 5_000_000
  //       ? mapHostToServer(ns, ['foodnstuff'])[0]
  //       : (getCurrentTarget(ns) as NCH_Server);
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

  //https://bitburner.readthedocs.io/en/latest/advancedgameplay/hackingalgorithms.html
  const methodCycleReduced = ['hack', 'weaken', 'grow', 'weaken'];
  const methodCycle = ['weaken', 'weaken', 'grow', 'hack'];
  //  const methodCycle = ['hack', 'weaken', 'grow', 'weaken'];
  //   const methodCycleReduced = ['weaken', 'grow', 'hack'];
  //   const methodCycle = ['hack', 'grow', 'weaken'];
  let methodIndex = 0;
  let hostIndex = 0;
  let networkRamRemaining = totalMemoryToUse;
  const shouldUseReducedTimeBuffer = () => {
    return numTimesCanExecute <= 1;
  };
  const getCurrentMethod = () =>
    (shouldUseReducedTimeBuffer() ? methodCycleReduced : methodCycle)[methodIndex % methodCycle.length] as HWG;
  const host = (idx = hostIndex) => getMyServers()[idx % getMyServers().length];
  const getServerRamRemaining = (idx = hostIndex) => {
    if (host(idx).name === 'home') {
      return ns.getServerMaxRam('home') - ns.getServerUsedRam('home') - HOME_RAM_TO_SPARE - scriptRam;
    }
    return host(idx).maxMem - ns.getServerUsedRam(host(idx).name);
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

  //   const threadCount = () => t[getCurrentMethod()].threadCount;

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
  const bufferForIncompleteCycle = 0;
  const numServers = ns.scan('home').length;
  let isStalling = false;
  ns.tprint('INFO: use reduced time buffer: ', shouldUseReducedTimeBuffer());

  const getNextAvailableHostIndex = (): number => {
    // getServerRamRemaining
    const all = getMyServers();
    const res = Array.from({ length: all.length }).findIndex((_, i) => getServerRamRemaining(i) > scriptRam);
    //  const res = all.findIndex((host) => (host.maxMem - host.usedMem) / scriptRam >= 1);
    //  console.log('next available index: ', res);
    return res;
  };

  while (getNetworkRamRemaining() > 0) {
    /**
     * TEMP
     */
    //  if (host().name !== 'home') {
    //    return;
    //  }

    /**
     * TEMP
     */
    const maxServerThreads = Math.floor(serverRamRemaining / scriptRam);
    const numThreadsForServer = Math.ceil(
      Math.min(
        maxServerThreads,
        //   threadCount(),
        threadCounter[getCurrentMethod()],
        numThreadsLeftBeforeRest,
        getThreadsLeftForServer(),
      ),
    );

    /**
     * TODO this needs tweaking, should check if there is enough ram on the given host to run the job, and if not, wait(?)
     */
    if (numThreadsForServer <= 0) {
      // ns.tprint(
      //   JSON.stringify({
      //     maxServerThreads: maxServerThreads,
      //     //  threadCount: threadCount(),
      //     threadCounter: threadCounter[getCurrentMethod()],
      //     numThreadsLeftBeforeRest: numThreadsLeftBeforeRest,
      //     getThreadsLeftForServer: getThreadsLeftForServer(),
      //   }),
      // );
      if (threadCounter[getCurrentMethod()] <= 0) {
        if (threadCounter.grow === 0 && threadCounter.hack === 0 && threadCounter.weaken === 0) {
          threadCounter = getThreadCounter();
        } else {
          ++methodIndex;
        }
        ns.tprint(`INFO ++methodIndex: ${methodIndex}`);
      }

      /**
       * I'd really like to get this to work...
       */
      if (getThreadsLeftForServer() <= 0 || maxServerThreads <= 0) {
        const nextHostIdx = getNextAvailableHostIndex();
        if (nextHostIdx >= 0) {
          //  ns.tprint(`INFO: next host index: ${nextHostIdx}`);
          if (nextHostIdx === hostIndex) {
            ns.tprint(`ERROR: next host is current host?`);
          }
          hostIndex = nextHostIdx;
          await ns.sleep(100);
        } else {
          await ns.sleep(9_000);
          ns.tprint(`WARN: sleeping for 9 sec and then cont`);
          continue;
          //  ++hostIndex;
        }
        ns.tprint(`INFO got next hostIndex: ${hostIndex}`);
        serverRamRemaining = getServerRamRemaining();
      }
      // if (getThreadsLeftForServer() <= 0 || maxServerThreads <= 0) {
      //   ++hostIndex;
      //   ns.tprint(`INFO ++hostIndex: ${hostIndex}`);
      //   serverRamRemaining = getServerRamRemaining();
      // }

      // is this logic good?
      if (host().maxMem - host().usedMem < scriptRam) {
        // if (host().name === 'home') {
        isStalling = true;
      }

      const shouldSleep = isStalling || getNetworkRamRemaining() < scriptRam * numServers * 10;
      if (isStalling) {
        // does this make sense to do?
        ns.tprint(`INFO: threadCounter: ${JSON.stringify(threadCounter)}`);
        if (threadCounter.grow === 0 && threadCounter.hack === 0 && threadCounter.weaken === 0) {
          threadCounter = getThreadCounter();
          ns.tprint('INFO [10sec sleep] resetting Thread Counter:', {
            threadCounter: { ...threadCounter },
          });
        }
        ns.tprint('INFO [10sec sleep] stalling out...');
        //   methodIndex = 0; // is this necessary? helps keep the weaken up?
        //   ns.tprint(`INFO should be using method: ${getCurrentMethod()}`);
        await ns.sleep(10_000);
      } else if (shouldSleep) {
        await ns.sleep(1_000);
      }
      ns.tprint(`HERE? ${host().name}`);
      // await ns.sleep(100);
      // await ns.sleep(1_000);
      continue;
    }

    isStalling = false;
    const amountOfRamUsed = numThreadsForServer * scriptRam;
    serverRamRemaining -= amountOfRamUsed;
    networkRamRemaining -= amountOfRamUsed;

    //  console.log({ ...threadCounter });
    threadCounter[getCurrentMethod()] -= numThreadsForServer;

    const data = t[getCurrentMethod()];
    const timeBuffer = shouldUseReducedTimeBuffer() ? 0 : data.timeBuffer;
    //  const timeBuffer = Math.min(data.timeBuffer, bufferForIncompleteCycle);

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
      ...[getCurrentMethod(), target().name, timeBuffer, timer, counter, host().name, numThreadsForServer],
    );

    numThreadsLeftBeforeRest -= numThreadsForServer;
    if (numThreadsLeftBeforeRest <= 0) {
      ns.tprint(`INFO: numThreadsLeftBeforeRest if`);
      const threadData = getTargetData()[startCycleMethod];
      const waitTime =
        threadData.time +
        threadData.timeBuffer -
        (Date.now() - cycleStartTime) -
        (methodIndex % 3) * TIME_BETWEEN_ITERATIONS;

      const wt = shouldUseReducedTimeBuffer() ? 0 : waitTime;
      ns.print('INFO: Wait Time for rest: ', wt);

      if (wt) {
        await ns.sleep(wt);
        ns.tprint(
          `INFO: MAX num utilized threads reached, waiting for ${msToTime(wt)} based off ${startCycleMethod} time.`,
        );
      }
      numThreadsLeftBeforeRest = numThreadsForFullCycle;
    }

    const needToUseNextHost = serverRamRemaining <= 0;
    if (needToUseNextHost) {
      ++hostIndex;
      ns.tprint(`INFO: needToUseNextHost if ${hostIndex}`);
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
      ns.tprint(`INFO: needToUseNextMethod if: ${methodIndex}`);
      const startingNewCycle = getCurrentMethod() === 'hack';

      if (startingNewCycle) {
        threadCounter = getThreadCounter();
        ns.tprint('INFO starting new cycle - getting threadCounter', { ...threadCounter });
        /**
         * TODO Here we can set logic to determine if we'll make it more than a single method
         */
        if (threadCounter[getCurrentMethod()] > numThreadsLeftBeforeRest) {
          ns.tprint(`We could avoid waiting by ${data.timeBuffer}? (from ${getCurrentMethod()}'s time buffer)`);
        }
      }
      // const sleepTime = 50;
      const sleepTime = Math.min(TIME_BETWEEN_ITERATIONS, Math.ceil(t.weaken.time / numTimesCanExecute / 4));
      // const sleepTime = Math.min(TIME_BETWEEN_ITERATIONS, Math.ceil(t.weaken.time / numTimesCanExecute));
      ns.tprint(`INFO New HWG Cycle, sleeping for ${sleepTime / 1000}sec`);
      await ns.sleep(sleepTime);
    }

    //  ns.tprint(`INFO ${counter}`);
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
