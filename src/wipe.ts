import { NS } from '@ns';
import { getNodeArray } from './get-node-array';

export async function main(ns: NS) {
  getNodeArray(ns).forEach((name) => ns.killall(name));
}
