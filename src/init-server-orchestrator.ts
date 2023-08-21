import { NS } from '@ns';
import { getPriorityTargetList } from './get-priority-target-list';

/** @param {NS} ns */
export async function initServerOrchestrator(ns: NS, host?: string) {
  const targetList = await getPriorityTargetList(ns);
  const hardestTarget = targetList.shift();

  const orchestratorRAM = ns.getScriptRam('server-orchestrator.js');
  console.log(`it takes ${orchestratorRAM} to run the server-orchestrator`);

  const largeServers = host
    ? [host]
    : ns
        .scan('home')
        .filter((name) => name.includes('pserv'))
        .concat('home');

  /**
   * if we can calc the number of expected ram each target will consume, then we can better dole out tasks to multiple servers
   */
  console.log({ targetList });

  const filesToCopy = [
    'server-orchestrator.js',
    'server-manager.js',
    'utils.js',
    'get-current-target.js',
    'get-node-array.js',
    'map-host-to-server.js',
    'HWG.js',
  ];

  for (const host of largeServers) {
    //   ['home'].forEach((host, i) => {
    //  if (i >= targetList.length) {
    //    return;
    //  }
    //  const target = targetList[i % targetList.length].name;
    const target = hardestTarget?.name as string;
    //  console.log({ target });
    ns.disableLog('scp');
    ns.scp(filesToCopy, host);
    ns.enableLog('scp');
    await ns.sleep(5000);
    ns.exec('server-orchestrator.js', host, { threads: 1, ramOverride: orchestratorRAM }, ...[target, host]);
  }
}

// export async function initServerOrchestratorAtHost(ns: NS, host: string) {
//   //   const targetNames = [
//   //     'n00dles',
//   //     'foodnstuff',
//   //     'sigma-cosmetics',
//   //     'joesguns',
//   //     'hong-fang-tea',
//   //     'harakiri-sushi',
//   //     //  'iron-gym',
//   //   ];

//   const targetList = await getPriorityTargetList(ns, 1);
//   const hardestTarget = targetList.shift();

//   const orchestratorRAM = ns.getScriptRam('server-orchestrator.js');
//   console.log(`it takes ${orchestratorRAM} to run the server-orchestrator`);

//   //   const largeServers = ns
//   //     .scan('home')
//   //     .filter((name) => name.includes('pserv-4096'))
//   //     .concat('home');

//   /**
//    * if we can calc the number of expected ram each target will consume, then we can better dole out tasks to multiple servers
//    */
//   console.log({ targetList });

//   const filesToCopy = [
//     'server-orchestrator.js',
//     'server-manager.js',
//     'utils.js',
//     'get-current-target.js',
//     'get-node-array.js',
//     'map-host-to-server.js',
//     'HWG.js',
//   ];

//   //   for (const host of largeServers) {
//   //   ['home'].forEach((host, i) => {
//   //  if (i >= targetList.length) {
//   //    return;
//   //  }
//   //  const target = targetList[i % targetList.length].name;
//   const target = hardestTarget?.name as string;
//   console.log({ target });
//   ns.disableLog('scp');
//   ns.scp(filesToCopy, host);
//   ns.enableLog('scp');
//   await ns.sleep(1000);
//   ns.exec('server-orchestrator.js', host, { threads: 1, ramOverride: orchestratorRAM }, ...[target, host]);
// //   //   }
// // }
