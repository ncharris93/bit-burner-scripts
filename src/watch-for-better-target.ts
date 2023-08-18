import { NS } from '@ns';
import { getCurrentTarget } from './get-current-target';

export async function main(ns: NS) {
  const currentTarget = getCurrentTarget(ns).name;

  while (true) {
    await ns.sleep(5000);
    const nextTarget = getCurrentTarget(ns).name;
    if (nextTarget !== currentTarget) {
      ns.print(`NEW TARGET ACQUIRED! ${nextTarget}`);
      ns.exec('unlock.js', 'home');
    }
  }
}
