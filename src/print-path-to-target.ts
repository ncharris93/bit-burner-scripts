import { NS } from '@ns';

const green = '\u001b[32m';
const reset = '\u001b[0m';

const logNode = (ns: NS, { depth, hostname }: Deep) => {
  const set = '|\t';
  console.log(`${set.repeat(depth - 1)}${green + '-'.repeat(5) + reset} ${hostname}${reset}`);
};

type Deep = {
  hostname: string;
  depth: number;
};

const getDeep = (names: string[], depth: number) => names.map((name) => ({ hostname: name, depth }));

export async function printPathToTarget(ns: NS) {
  const targetName = ns.args[0];
  if (!targetName) {
    throw new Error('Forgot target name!');
  }
  const deepRes: Deep[] = [];

  const queue: Deep[] = ns
    .scan()
    .filter((name) => !name.includes('pserv-'))
    .map((name) => ({ hostname: name, depth: 1 }));
  const processedNodes: string[] = ['home'];
  //   console.log(queue);
  while (queue.length) {
    const host = queue.shift();
    if (!host) {
      break;
    }
    processedNodes.push(host.hostname);
    deepRes.push(host);
    logNode(ns, host);

    const viewableNodes = ns.scan(host.hostname);
    const newNodes = viewableNodes.filter((n) => !processedNodes.includes(n));
    const newDeep = getDeep(newNodes, host.depth + 1);
    queue.unshift(...newDeep);
  }

  //   const res: string[] = [];
  const foundIndex = deepRes.findIndex(({ hostname }) => hostname === targetName);
  const prunedDeepRes = deepRes.slice(0, foundIndex + 1).reverse();
  let currentDepthWanted = prunedDeepRes[0].depth;
  const result = prunedDeepRes
    .reduce<string[]>((res, curr, i) => {
      if (i === 0) {
        --currentDepthWanted;
        return res.concat(curr.hostname);
      }
      if (curr.depth === currentDepthWanted) {
        --currentDepthWanted;
        return res.concat(curr.hostname);
      }
      return res;
    }, [])
    .reverse();

  //   console.log(result);
  //   ns.tprint('INFO: ', result);
  const pasteCmd = result.map((name) => `con ${name};`).join(' ');
  await navigator.clipboard.writeText(pasteCmd);
  //   ns.tprint('INFO: ', pasteCmd);

  return result;
}

export async function main(ns: NS) {
  await printPathToTarget(ns);
}
// import { NS } from '@ns';

// const green = '\u001b[32m';
// const reset = '\u001b[0m';

// const logNode = (ns: NS, { depth, hostname }: Deep) => {
//   const set = '|\t';
//   console.log(`${set.repeat(depth - 1)}${green + '-'.repeat(5) + reset} ${hostname}${reset}`);
// };

// type Deep = {
//   hostname: string;
//   depth: number;
// };

// const getDeep = (names: string[], depth: number) => names.map((name) => ({ hostname: name, depth }));

// export function printPathToTarget(ns: NS) {
//   const targetName = ns.args[0];
//   if (!targetName) {
//     throw new Error('Forgot target name!');
//   }

//   const queue: Deep[] = ns
//     .scan()
//     .filter((name) => !name.includes('pserv-'))
//     .map((name) => ({ hostname: name, depth: 1 }));

//   const processedNodes: string[] = ['home'];
//   const path: string[] = [];

//   while (queue.length) {
//     const host = queue.shift();
//     if (!host || host.hostname === targetName) {
//       break;
//     }

//     processedNodes.push(host.hostname);
//     path.push(host.hostname);
//     logNode(ns, host);

//     const viewableNodes = ns.scan(host.hostname);
//     const newNodes = viewableNodes.filter((n) => !processedNodes.includes(n));
//     if (newNodes.length === 0) {
//       path.pop();
//     }
//     const newDeep = getDeep(newNodes, host.depth + 1);
//     queue.unshift(...newDeep);
//   }
//   console.log({ path });
// }

// export async function main(ns: NS) {
//   printPathToTarget(ns);
// }
