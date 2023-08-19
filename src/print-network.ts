import { NS } from '@ns';

const cyan = '\u001b[36m';
const green = '\u001b[32m';
const red = '\u001b[31m';
const reset = '\u001b[0m';

const getColor = (is?: boolean) => (is ? green : red);

const logNode = (ns: NS, { depth, hostname: host }: Deep) => {
  const set = '|\t';
  const prefix = set.repeat(depth);

  const server = ns.getServer(host);
  const numReqPorts = server.numOpenPortsRequired || 0;
  const openPorts = server.openPortCount || 0;
  const hasEnoughPortsToHack = openPorts >= numReqPorts;
  const moneyTimeRato = ns.getServerMaxMoney(host) / ns.getHackTime(host);

  const c = {
    port: getColor(hasEnoughPortsToHack),
    bkdr: getColor(server.backdoorInstalled),
    hack: getColor((server.requiredHackingSkill || 0) <= ns.getHackingLevel()),
    admin: getColor(server.hasAdminRights),
    mtr: reset,
  };

  console.log(`${set.repeat(depth - 1)}${cyan + '-'.repeat(5) + reset} ${host}${reset}`);
  console.log(`${prefix}\t${red}SEC: ${ns.getServerSecurityLevel(host)}${reset}`);
  console.log(`${prefix}\t${red}$$$: ${ns.formatNumber(ns.getServerMoneyAvailable(host) || 0, 3, 0, true)}${reset}`);
  console.log(`${prefix}\t${red}Htime : ${ns.getHackTime(host)}${reset}`);
  console.log(`${prefix}\t${c.port}REQ ports : ${ns.getServerNumPortsRequired(host)}${reset}`);
  console.log(`${prefix}\t${c.hack}REQ hack : ${ns.getServerRequiredHackingLevel(host)}${reset}`);
  console.log(`${prefix}\t${c.bkdr}BKDR: ${server.backdoorInstalled}${reset}`);
  console.log(`${prefix}\t${c.admin}Admin: ${server.hasAdminRights}${reset}`);
  console.log(`${prefix}\t${c.mtr}$/T: ${moneyTimeRato}${reset}`);
};

type Deep = {
  hostname: string;
  depth: number;
};

const getDeep = (names: string[], depth: number) => names.map((name) => ({ hostname: name, depth }));

export function printNodeNetwork(ns: NS) {
  const queue: Deep[] = ns
    .scan()
    .filter((name) => !name.includes('pserv-'))
    .map((name) => ({ hostname: name, depth: 1 }));
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
export async function main(ns: NS) {
  printNodeNetwork(ns);
}
