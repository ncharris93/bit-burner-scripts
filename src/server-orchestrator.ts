import { NS } from '@ns';
import { getServerData } from './server-manager';
import { getCurrentTarget } from './get-current-target';
import { IdealThreadData } from './utils';

export async function main(ns: NS) {
  return serverOrchestrator(ns, `${ns.args[0]}`, `${ns.args[1]}`);
}
export const serverOrchestrator = async (
  ns: NS,
  target = getCurrentTarget(ns)?.name || 'foodnstuff',
  host = ns.getHostname(),
) => {
  if (!ns.hasRootAccess(target)) {
    throw new Error(`No root access to ${target}`);
  }
  let serverData = getServerData(ns, target);
  console.log(serverData);

  /**
   * first, we want hack to finish
   * second, we want grow to finish
   * third, we want weaken to finish
   */
  const server = serverData[target];
  console.log({ server, target });
  const threadsUsed = server.grow.threadCount + server.hack.threadCount + server.weaken.threadCount;
  const timesCanRunSupportedByThreads = Math.floor(ns.getServerMaxRam(host) / threadsUsed);

  //   console.log('1');
  //   const totalRamUsedForExecute =
  //     ns.getScriptRam('weaken.js', 'home') * server.weaken.threadCount +
  //     ns.getScriptRam('hack.js', 'home') * server.hack.threadCount +
  //     ns.getScriptRam('grow.js', 'home') * server.grow.threadCount;

  //   const totalRamUsedForExecute = 1;
  const hwgRAM = ns.getScriptRam('HWG.js', host);
  const totalRamUsedForExecute = Math.floor(
    hwgRAM * (server.weaken.threadCount + server.hack.threadCount + server.grow.threadCount),
  );
  //  const totalRamUsedForExecute = Math.floor(
  //    ns.getScriptRam('HWG.js', host) * server.weaken.threadCount +
  //      ns.getScriptRam('HWG.js', host) * server.hack.threadCount +
  //      ns.getScriptRam('HWG.js', host) * server.grow.threadCount,
  //  );

  //   console.log('2', { hwgRAM, totalRamUsedForExecute2 });
  const timesCanRunSupportedByRAM = Math.floor(ns.getServerMaxRam(host) / totalRamUsedForExecute);

  const maxTimesToRunOnServer = Math.min(timesCanRunSupportedByRAM, timesCanRunSupportedByThreads);

  console.log({
    threadsUsed,
    timesCanRunSupportedByThreads,
    totalRamUsedForExecute,
    timesCanRunSupportedByRAM,
    maxTimesToRunOnServer,
    scriptSize: ns.getScriptRam('HWG.js'),
  });

  //   ns.scan().forEach((host) => ns.killall(host));

  const execute = (iteration: number) => {
    //  console.log({ hackTimeBuffer, growTimeBuffer, weakenTimeBuffer });
    const timer = Date.now();
    serverData = getServerData(ns, target);
    //  console.log(`[${target}] [${iteration}] kickoff data: `, serverData[target]);
    ['hack', 'grow', 'weaken'].forEach((type) => {
      //@ts-expect-error:: mad about keying target
      const data: IdealThreadData = serverData[target][type];
      if (data.threadCount) {
        // ...[] to show parameters
        ns.exec(
          'HWG.js',
          host,
          data.threadCount,
          ...[type, target, data.timeBuffer, timer, iteration, host, data.threadCount],
        );
      }
    });

    return;
  };

  let counter = 0;

  const maxRam = ns.getServerMaxRam(host);
  while (true) {
    //   while (counter < 5) {
    const exeTimeDiff = server.weaken.time - server.hack.time;
    const usedRam = ns.getServerUsedRam(host);
    const ramRemaining = maxRam - usedRam;
    const serverHasEnoughMemoryForAnotherRun = ramRemaining > totalRamUsedForExecute;
    //  console.log({ ramRemaining, totalRamUsedForExecute, serverHasEnoughMemoryForAnotherRun });
    //  console.log({ serverHasEnoughMemoryForAnotherRun });

    if (!serverHasEnoughMemoryForAnotherRun) {
      // console.log(`SLEEPING: ${exeTimeDiff}`);
      await ns.sleep(5000);
      // await ns.sleep(exeTimeDiff);
      continue;
    }
    //   while (!counter) {
    execute(counter);

    //  const maxMoneyTime = server.weaken.time + 50;
    //  const waitTime = Math.min(maxMoneyTime, 10_000);
    await ns.sleep(500);
    //  await ns.sleep(waitTime);
    //  await ns.sleep(maxMoneyTime);
    //  ++counter;
    //  if (counter > 1000) {
    //    console.log('BREAKING!');
    //    break;
    //  }
    ++counter;
  }
};
