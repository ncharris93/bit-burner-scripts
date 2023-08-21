import { NS } from '@ns';
import { getPriorityTargetList } from './get-priority-target-list';

import { initServerOrchestrator } from './init-server-orchestrator';
import { serverUpgradeManager } from './server-upgrade-manager';
import { serverOrchestrator } from './server-orchestrator';
export async function main(ns: NS) {
  //  await serverOrchestrator(ns);
  //   await initServerOrchestrator(ns);
  await serverOrchestrator(ns, 'n00dles', 'home');
  //   console.log({ singleThreadMultiplier });
  // await serverUpgradeManager(ns);
  //   ns.upgradePurchasedServer('pserv-4096-0', 1048576);
}
