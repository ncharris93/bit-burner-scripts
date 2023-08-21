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
  //   const gas = ns.growthAnalyzeSecurity(threads);
  //   const gas1 = ns.growthAnalyze();
  const growTime = ns.getGrowTime(host);
  //   const gvalue = ns.getServerGrowth(host);
  const cores = server.cpuCores;
  const gvalue = server.serverGrowth;
  const thing = server.ramUsed;
  const remainingRam = server.maxRam - server.ramUsed;

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
  console.log(`${prefix}\t${red}$M: ${ns.formatNumber(ns.getServerMaxMoney(host) || 0, 3, 0, true)}${reset}`);
  console.log(`${prefix}\t${red}Htime : ${ns.getHackTime(host)}${reset}`);
  console.log(`${prefix}\t${c.port}REQ ports : ${ns.getServerNumPortsRequired(host)}${reset}`);
  console.log(`${prefix}\t${c.hack}REQ hack : ${ns.getServerRequiredHackingLevel(host)}${reset}`);
  console.log(`${prefix}\t${c.bkdr}BKDR: ${server.backdoorInstalled}${reset}`);
  console.log(`${prefix}\t${c.admin}Admin: ${server.hasAdminRights}${reset}`);
  console.log(`${prefix}\t${c.mtr}$/T: ${moneyTimeRato}${reset}`);
  console.log(`${prefix}\t${c.mtr}$/hAn: ${ns.hackAnalyze(host)}${reset}`);
  console.log(`${prefix}\t${c.mtr}$/gAn 1k: ${ns.growthAnalyze(host, 1000)}${reset}`);
  console.log(`${prefix}\t${c.mtr}$/wAn 1k: ${ns.weakenAnalyze(1000)}${reset}`);
};

type Deep = {
  hostname: string;
  depth: number;
};

const getDeep = (names: string[], depth: number) => names.map((name) => ({ hostname: name, depth }));

export function printNodeNetwork(ns: NS) {
  const depthToPrint = parseInt(`${ns.args[0] || 9999}`);
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
    const nextDepth = host.depth + 1;
    if (nextDepth > depthToPrint) {
      continue;
    }
    const newDeep = getDeep(newNodes, nextDepth);
    queue.unshift(...newDeep);
  }
}
export async function main(ns: NS) {
  printNodeNetwork(ns);
}
