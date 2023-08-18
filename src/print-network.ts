import { NS } from '@ns';

const cyan = '\u001b[36m';
const green = '\u001b[32m';
const red = '\u001b[31m';
const reset = '\u001b[0m';

const logNode = (ns: NS, { depth, hostname }: Deep) => {
  const set = '|\t';
  const prefix = set.repeat(depth);

  console.log(`${set.repeat(depth - 1)}${green + '-'.repeat(depth) + reset}${green} ${hostname}${reset}`);
  console.log(`${prefix}\t${red}${ns.getServerSecurityLevel(hostname)}${reset}`);
  console.log(`${prefix}\t${red}${ns.getServerMoneyAvailable(hostname)}${reset}`);
  console.log(`${prefix}\t${red}${ns.getHackTime(hostname)}${reset}`);
};

type Deep = {
  hostname: string;
  depth: number;
};

const getDeep = (names: string[], depth: number) => names.map((name) => ({ hostname: name, depth }));

export function printNodeNetwork(ns: NS) {
  const queue: Deep[] = ns.scan().map((name) => ({ hostname: name, depth: 1 }));
  const processedNodes: string[] = ['home'];
  console.log(queue);
  while (queue.length) {
    const host = queue.shift();
    if (!host) {
      break;
    }
    processedNodes.push(host.hostname);
    logNode(ns, host);
    const viewableNodes = ns.scan(host.hostname);
    const newNodes = viewableNodes.filter((n) => !processedNodes.includes(n));
    const newDeep = getDeep(newNodes, host.depth + 1);
    queue.unshift(...newDeep);
  }
}
