import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const target = `${ns.args[0]}`;
  const host = ns.getHostname();

  if (!ns.hasRootAccess(target)) {
    return console.log(`[EHT] No root access for: ${target}`);
  }

  const log = (...args: any[]) => {
    if (args.length === 1) {
      const msg = args[0];
      return console.log(`[${host}]: ${msg}`);
    }
    return console.log(`[${host}]: `, ...args);
  };

  log('Init Hacking Template: ', target);

  const maxServerMoney = ns.getServerMaxMoney(target);
  const securityThresh = ns.getServerMinSecurityLevel(target);

  let scriptLoopTime = Date.now();

  while (true) {
    const startTime = Date.now();
    const endTime = () => Date.now() - startTime;

    const currentSecLevel = ns.getServerSecurityLevel(target);
    const shouldWeaken = currentSecLevel > securityThresh;
    if (shouldWeaken) {
      await ns.weaken(target);
      continue;
    }

    const availableMoney = ns.getServerMoneyAvailable(target);
    const shouldGrow = availableMoney < maxServerMoney;
    if (shouldGrow) {
      await ns.grow(target);
      continue;
    }

    const amtStolen = await ns.hack(target);
    const lapse = Date.now() - scriptLoopTime;

    log(`Hacked ${target}, Amount Stolen: ${formatMoney(amtStolen)}, ms: ${endTime()} elapsed: ${lapse}`);
    scriptLoopTime = Date.now();
  }
}

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatMoney = (number: number) => formatter.format(+number.toFixed(0));
