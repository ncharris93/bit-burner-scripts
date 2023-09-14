import { NS, Server } from '@ns';

import { getNodeArray } from './get-node-array';
import { getCurrentTarget } from './get-current-target';
import { HWG } from './types';

const METHOD_CYCLE: Array<HWG> = ['weaken', 'weaken', 'grow', 'hack'];
// const methodIndex = 0;
// const getMethodMod = () => methodIndex % METHOD_CYCLE.length;
// const getMethod = () => METHOD_CYCLE[getMethodMod()];

const hostFilter = (s: string) => !s.includes('pserv') && !(s === 'home');
const getHostNames = (ns: NS) => getNodeArray(ns).filter(hostFilter);
// const hostIndex = 0;
// const getHostMod = (ns: NS) => hostIndex % getHostNames(ns).length;
// const getHost = (ns: NS) => getHostNames(ns)[getHostMod(ns)];

const MS_BETWEEN_ITERATIONS = 100;
const MS_BETWEEN_METHOD_CALLS = 100;
const SCRIPT_RAM = 1.75;

const getServer = (ns: NS) => {
  const server = ns.getServer(getCurrentTarget(ns).name);
  //   server.hackDifficulty = ns.getServerSecurityLevel(server.hostname);
  //   server.moneyAvailable = ns.getServerMoneyAvailable(server.hostname);
  return server;
};

let server: Server;

type Method = {
  time: number;
  threadCount: number;
  name: HWG;
  buffer: number;
};
export async function main(ns: NS) {
  //   const getTarget = () => getCurrentTarget(ns);
  let counter = 0;
  ns.tprint(`counter: ${counter}`);
  await ns.sleep(30_000);
  // batcher
  while (++counter) {
    if (counter > 10) {
      return;
    }

    if (!server) {
      ns.tprint(`INFO: setting server`);
      server = getServer(ns);
    }

    // we won't have a host if there isn't enough RAM to run the script at least once.
    const host = getNextAvailableHost(ns);
    if (!host) {
      ns.tprint('WARN: No host available - sleeping for 10 sec');
      await ns.sleep(10_000);
      continue;
    }

    /**
     * we want to hold these incase we can't execute the scripts,
     * in which case we'll need to reinstate this data
     */

    const target = server.hostname;
    const player = ns.getPlayer();
    const hacking = ns.formulas.hacking;

    const hackTime = hacking.hackTime(server, player);
    //@ts-expect-error:: buffer added later
    const hack: Method = {
      time: hackTime,
      threadCount: getHackThreadCount(ns, target) as number,
      name: 'hack',
    };

    const doHack = (args: ExecParams = {}) =>
      exec({
        counter,
        host,
        method: 'hack',
        ns,
        target,
        threadCount: maxThreadsServerCanExe,
        timeBuffer: hack.buffer,
        ...args,
      });

    let maxThreadsServerCanExe = getNumberOfThreadsServerCanExe(ns, target);
    const canFullyExecuteHack = hack.threadCount <= maxThreadsServerCanExe;
    if (!canFullyExecuteHack) {
      ns.tprint(`WARN: Can't execute full hack. have: ${maxThreadsServerCanExe} need: ${hack.threadCount}`);
      // todo: is threadCount necessary here?
      doHack({ timeBuffer: 0, threadCount: maxThreadsServerCanExe });
      continue;
    }
    maxThreadsServerCanExe -= hack.threadCount;

    // decrement the available money by how much will be stolen
    //@ts-expect-error: :value exists
    server.moneyAvailable = server?.moneyAvailable * ns.hackAnalyze(target);
    //@ts-expect-error: :value exists
    server.hackDifficulty *= ns.hackAnalyzeSecurity(hack.threadCount);

    const weaken1: Method = {
      time: hacking.weakenTime(server, player),
      threadCount: getWeakenThreadCount(ns, target) as number,
      name: 'weaken',
      buffer: 0,
    };
    const doWeaken1 = (args: ExecParams = {}) =>
      exec({
        counter,
        host,
        method: 'weaken',
        ns,
        target,
        threadCount: maxThreadsServerCanExe,
        timeBuffer: weaken1.buffer,
        ...args,
      });
    hack.buffer = weaken1.time - hackTime - MS_BETWEEN_METHOD_CALLS;
    const canFullyExecuteWeaken1 = weaken1.threadCount <= maxThreadsServerCanExe;
    if (!canFullyExecuteWeaken1) {
      ns.tprint(`WARN Can't execute full Weaken1. have: ${maxThreadsServerCanExe} need: ${weaken1.threadCount}`);
      doHack();
      doWeaken1({ threadCount: maxThreadsServerCanExe });
      continue;
    }
    maxThreadsServerCanExe -= weaken1.threadCount;

    // decrement the amount of difficulty set by the weaken
    //@ts-expect-error: :value exists
    server.hackDifficulty = server.hackDifficulty - ns.weakenAnalyze(weaken1.threadCount);

    const growTime = hacking.growTime(server, player);
    const grow: Method = {
      time: growTime,
      threadCount: hacking.growThreads(server, player, server.moneyMax as number),
      name: 'grow',
      buffer: weaken1.time - growTime - MS_BETWEEN_METHOD_CALLS * 2,
    };

    const doGrow = (args: ExecParams = {}) =>
      exec({
        counter,
        host,
        method: 'grow',
        ns,
        target,
        threadCount: maxThreadsServerCanExe,
        timeBuffer: grow.buffer,
        ...args,
      });

    const canFullyExecuteGrow = grow.threadCount <= maxThreadsServerCanExe;
    if (!canFullyExecuteGrow) {
      ns.tprint(`WARN: Can't execute full Grow. have: ${maxThreadsServerCanExe} need: ${grow.threadCount}`);
      doHack();
      doWeaken1();
      doGrow({ threadCount: maxThreadsServerCanExe });
      continue;
    }
    maxThreadsServerCanExe -= grow.threadCount;
    // increment the amount of money done by the grow
    server.moneyAvailable *= hacking.growPercent(server, grow.threadCount, player);
    server.hackDifficulty += ns.growthAnalyzeSecurity(grow.threadCount);

    const weaken2: Method = {
      time: hacking.weakenTime(server, player),
      threadCount: getWeakenThreadCount(ns, target) as number,
      name: 'weaken',
      buffer: MS_BETWEEN_METHOD_CALLS * METHOD_CYCLE.length,
    };

    const doWeaken2 = (args: ExecParams = {}) =>
      exec({
        counter,
        host,
        method: 'weaken',
        ns,
        target,
        threadCount: maxThreadsServerCanExe,
        timeBuffer: weaken2.buffer,
        ...args,
      });
    const canFullyExecuteWeaken2 = weaken2.threadCount <= maxThreadsServerCanExe;
    if (!canFullyExecuteWeaken2) {
      ns.tprint(`WARN Can't execute full Weaken2. have: ${maxThreadsServerCanExe} need: ${weaken2.threadCount}`);
      doHack();
      doWeaken1();
      doGrow();
      doWeaken2({ threadCount: maxThreadsServerCanExe });
      continue;
    }

    /**
     * This assumes that we can run the whole script in one go
     */
    //  maxThreadsServerCanExe -= weaken2.threadCount;
    const execMethods = [weaken1, weaken2, grow, hack];
    //  const execIndex = 0;
    //  const getExecMethod = () => execMethods[execIndex % execMethods.length];

    //  const method = getMethod();

    for (const meth of execMethods) {
      exec({ counter, host, method: meth.name, ns, target, threadCount: meth.threadCount, timeBuffer: meth.buffer });
      ns.tprint({
        counter,
        host,
        method: meth.name,
        ns,
        target,
        threadCount: meth.threadCount,
        timeBuffer: meth.buffer,
      });
    }

    //  const arr = [hack, weaken1, grow, weaken2];
    //  const arr = execMethods;
    //  for (const meth of arr) {
    //    // meth.name === 'grow'{
    //    exec({ counter, host, method: meth.name, ns, target, threadCount: meth.threadCount, timeBuffer: 0 });
    //    ns.tprint({ counter, host, method: meth.name, ns, target, threadCount: meth.threadCount, timeBuffer: 0 });

    //    await ns.sleep(MS_BETWEEN_METHOD_CALLS);
    //  }

    //  exec({ counter, host, method, ns, target, threadCount, timeBuffer: 0 });
    //  exec({ counter, host, method, ns, target, threadCount, timeBuffer: 0 });
    //  exec({ counter, host, method, ns, target, threadCount, timeBuffer: 0 });
    //  exec({ counter, host, method, ns, target, threadCount, timeBuffer: 0 });

    //  execIndex++;
    await ns.sleep(MS_BETWEEN_ITERATIONS);
  }
}

const PERCENT_HACK_THRESHOLD = 0.5;
const getHackThreadCount = (ns: NS, host: string) => {
  const server = ns.getServer(host);
  const player = ns.getPlayer();

  const currentMoney = server.moneyAvailable as number;
  const maxMoney = ns.getServerMaxMoney(host);

  const percentMoneyToStealPerThread = ns.formulas.hacking.hackPercent(server, player);
  let threadCount = 0;
  while (++threadCount) {
    const moneyLeftAfterHack = currentMoney - percentMoneyToStealPerThread * threadCount;
    if (moneyLeftAfterHack <= maxMoney * PERCENT_HACK_THRESHOLD) {
      return threadCount;
    }
  }
};

const PERCENT_MAX_SECURITY_THRESHOLD = 1;
const getWeakenThreadCount = (ns: NS, host: string) => {
  const cpuCoresAvailable = ns.getServer(host).cpuCores;
  const currentSecurity = ns.getServerSecurityLevel(host);
  const minSecurity = ns.getServerMinSecurityLevel(host);

  let threadCount = 0;
  while (++threadCount) {
    const securityRemoved = ns.weakenAnalyze(threadCount, cpuCoresAvailable);
    const maxThreadsFound = (currentSecurity - securityRemoved) * PERCENT_MAX_SECURITY_THRESHOLD <= minSecurity;
    if (maxThreadsFound) {
      return threadCount;
    }
  }
};

type ExecParams = Partial<Parameters<typeof exec>[0]>;
const exec = ({
  ns,
  host,
  counter,
  method,
  scriptRam = 1.75,
  target,
  threadCount,
  timeBuffer,
  timer = Date.now(),
}: {
  ns: NS;
  host: string;
  threadCount: number;
  scriptRam?: number;
  method: HWG;
  target: string;
  timeBuffer: number;
  timer?: number;
  counter: number;
}) =>
  ns.exec(
    'HWG.js',
    host,
    { threads: threadCount, ramOverride: scriptRam },
    ...[method, target, timeBuffer, timer, counter, host, threadCount],
  );

const getNumberOfThreadsServerCanExe = (ns: NS, host: string) =>
  Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / SCRIPT_RAM);

const getNextAvailableHost = (ns: NS) => {
  return getHostNames(ns).find((host) => {
    return getNumberOfThreadsServerCanExe(ns, host) > 1;
  });
};
