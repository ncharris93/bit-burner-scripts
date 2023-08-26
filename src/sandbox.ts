import { NS } from '@ns';
import { swarmManager } from './swarm-manager';

export async function main(ns: NS) {
  return swarmManager(ns);
}
