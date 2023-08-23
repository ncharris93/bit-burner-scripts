import { NS } from '@ns';

export async function main(ns: NS) {
  const fns = [
    'crawler',
    'early-hack-template',
    'eht-max',
    'grow',
    'hack',
    'weaken',
    'HWG',
    'init-server-orchestrator',
    'internal-server-manager',
    'purchase-server',
    'server-manger',
    'server-orchestrator',
    'server-upgrade-manager',
    'swarm-manager',
  ];

  const res = {};

  fns.forEach((name) => {
    res[name] = ns.getScriptRam(`${name}.js`);
  });

  console.log(res);
}
