import { NS } from '@ns';
import { getNodeArray } from './get-node-array';

export async function main(ns: NS) {
  getNodeArray(ns)
    .filter((name) => name === 'home')
    .forEach((name) => ns.killall(name));
}
