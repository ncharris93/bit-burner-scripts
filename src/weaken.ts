import { NS } from '@ns';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  return ns.weaken(target);

  //   const secLevel = ns.getServerSecurityLevel(target);
  //   const min = ns.getServerMinSecurityLevel(target);
  //   console.log(`[${ns.getHostname()}]: weaken on ${target} resulted in new value of ${secLevel} - min: ${min}`);
}
