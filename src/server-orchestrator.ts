import { NS } from '@ns';
import { getServerData } from './server-manager';
import { getCurrentTarget } from './get-current-target';
import { IdealThreadData } from './utils';

export const serverOrchestrator = async (
  ns: NS,
  target = getCurrentTarget(ns)?.name || 'foodnstuff',
  host = 'home',
) => {
  if (!ns.hasRootAccess(target)) {
    throw new Error(`No root access to ${target}`);
  }
  const serverData = getServerData(ns, target);
  console.log(serverData);

  const maxTaskTime = serverData[target].hack.time;

  const growTimeBuffer = maxTaskTime - serverData[target].grow.time;
  const hackTimeBuffer = maxTaskTime - serverData[target].hack.time;
  const weakenTimeBuffer = maxTaskTime - serverData[target].weaken.time;

  serverData[target].grow.timeBuffer = growTimeBuffer;
  serverData[target].hack.timeBuffer = hackTimeBuffer;
  serverData[target].weaken.timeBuffer = weakenTimeBuffer;

  /**
   * first, we want hack to finish
   * second, we want grow to finish
   * third, we want weaken to finish
   */
  const server = serverData[target];
  const threadsUsed = server.grow.threadCount + server.hack.threadCount + server.weaken.threadCount;
  const timesCanRunSupportedByThreads = Math.floor(ns.getServerMaxRam(host) / threadsUsed);
  //   const timesCanRunScriptInParallelOnServer = Math.floor(ns.getServerMaxRam(host) / threadsUsed);

  const totalRamUsedForExecute = ns.getScriptRam('weaken.js') + ns.getScriptRam('hack.js') + ns.getScriptRam('grow.js');
  const timesCanRunSupportedByRAM = Math.floor(ns.getServerMaxRam(host) / totalRamUsedForExecute);

  const maxTimesToRunOnServer = Math.min(timesCanRunSupportedByRAM, timesCanRunSupportedByThreads);

  // const executeFnWindow =

  //   console.log({
  //     threadsUsed,
  //     timesCanRunSupportedByThreads,
  //     totalRamUsedForExecute,
  //     timesCanRunSupportedByRAM,
  //     maxTimesToRunOnServer,
  //   });

  //   const FIRE = ({
  //     buffer,
  //     host,
  //     target,
  //     threadCount,
  //     timer,
  //     type,
  //   }: {
  //     host: string;
  //     threadCount: number;
  //     type: 'hack' | 'grow' | 'weaken';
  //     target: string;
  //     buffer: number;
  //     timer: number;
  //   }) => {
  //     return ns.exec('HWG.js', host, threadCount, type, target, kickoff(buffer), timer);
  //   };

  const numberInstances = 0;
  const kickoff = (place: number, buffer: number) => {
    const res = buffer + place * 10;
    console.log({ kickoffRes: res, place, buffer });
    return res;
  };

  const execute = () => {
    console.log({ hackTimeBuffer, growTimeBuffer, weakenTimeBuffer });
    const timer = Date.now();
    ['hack', 'grow', 'weaken'].forEach((type, i) => {
      //@ts-expect-error:: mad about keying target
      const data: IdealThreadData = serverData[target][type];
      console.log({ type, data });
      if (data.threadCount) {
        // ...[] to show parameters
        ns.exec('HWG.js', host, data.threadCount, ...[type, target, kickoff(i + 1, data.timeBuffer), timer]);
      }
    });
    return;

    //  // we add 0,10,20 as an offset for the order in which we want to finish
    //  if (serverData[target].hack.threadCount) {
    //    ns.exec('HWG.js', host, serverData[target].hack.threadCount, 'hack', target, kickoff(hackTimeBuffer, 1), timer);
    //  }
    //  if (serverData[target].grow.threadCount) {
    //    ns.exec('HWG.js', host, serverData[target].grow.threadCount, 'grow', target, kickoff(hackTimeBuffer, 2), timer);
    //  }

    //  if (serverData[target].weaken.threadCount) {
    //    ns.exec(
    //      'HWG.js',
    //      host,
    //      serverData[target].weaken.threadCount,
    //      'weaken',
    //      target,
    //      kickoff(hackTimeBuffer, 3),
    //      timer,
    //    );
    //  }
  };

  const timeDiff = serverData[target].hack.time - serverData[target].grow.timeBuffer;
  const iterationCount = Math.floor(timeDiff / serverData[target].grow.timeBuffer);
  //   const iterationCount = Math.floor(serverData[target].hack.time / timeDiff);

  console.log('1', {
    numberInstances,
    maxTimesToRunOnServer,
    timeDiff,
    iterationCount,
    hackTime: serverData[target].hack.time,
  });
  //   return execute();

  const counter = 0;

  while (true) {
    //  if (ns.getServerUsedRam(host) < ns.getServerMaxRam(host) * 0.9) {
    //    console.log('WAITING FOR MORE RAM TO OPEN');
    //    await ns.sleep(2000);
    //  }
    //   while (numberInstances < maxTimesToRunOnServer * 0.8) {
    //  console.log('2', { numberInstances, maxTimesToRunOnServer });
    execute();
    //  execute(ns.getServerUsedRam(host));
    //  ++numberInstances;
    const nextExecWaitTime = kickoff(2, serverData[target].grow.time);
    await ns.sleep(nextExecWaitTime);
    //  ++counter;
    //  if (counter > 1000) {
    //    console.log('BREAKING!');
    //    break;
    //  }
  }
  //   while (true) {
  //     if (ns.getServerUsedRam(host) < ns.getServerMaxRam(host) * 0.9) {
  //       console.log('WAITING FOR MORE RAM TO OPEN');
  //       await ns.sleep(2000);
  //     }
  //     //   while (numberInstances < maxTimesToRunOnServer * 0.8) {
  //     //  console.log('2', { numberInstances, maxTimesToRunOnServer });
  //     execute();
  //     //  execute(ns.getServerUsedRam(host));
  //     //  ++numberInstances;
  //     await ns.sleep(10);
  //   }

  //   while (true) {
  //     ns.exec('hack.js', 'home', serverData[host].hack.threadCount, host);
  //     await ns.sleep(hackTimeBuffer);
  //     ns.exec('grow.js', 'home', serverData[host].grow.time, host);
  //     await ns.sleep(growTimeBuffer);
  //     ns.exec('weaken.js', 'home', serverData[host].weaken.threadCount, host);
  //     await ns.sleep(weakenTimeBuffer);
  //   }

  //   const server = serverData[host]
  //    const threadsUsed = server.grow.threadCount + server.hack.threadCount + server.

  //   const hackScriptmem = ns.getScriptRam('hack.js');
  //   const growScriptMem = ns.getScriptRam('grow.js');
  //   const weakenScriptMem = ns.getScriptRam('weaken.js');

  //   console.log(serverData);
};

// const onTimer = () => {};
