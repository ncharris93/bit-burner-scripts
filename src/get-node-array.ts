/**
 * Use a queue to iterate over the tree to gather all necessary nodes
 */

import { NS } from '@ns';

export function getNodeArray(ns: NS) {
  const queue = ns.scan().concat(ns.getHostname());
  const seenNodes = [...queue];
  const res = [];
  while (queue.length) {
    const hostname = queue.pop();
    if (!hostname) {
      break;
    }
    const viewableNodes = ns.scan(hostname);
    res.push(hostname);
    seenNodes.push(hostname);
    const newNodes = viewableNodes.filter((n) => !seenNodes.includes(n));
    queue.push(...newNodes);
  }
  return res;
}

/**
 export default async function getNodeArray(ns) {
   const queue = ns.scan()
   const seenNodes = [...queue]
   const res = []
   while (queue.length) {
     const hostname = queue.pop()
     const viewableNodes = ns.scan()
     res.push(hostname)
     seenNodes.push(hostname)
     const newNodes = viewableNodes.filter(n => !(seenNodes.includes(n)))
     queue.push(...newNodes)
   }
   return res
 }
  * 
  */
