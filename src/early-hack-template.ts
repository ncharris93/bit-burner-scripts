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
      // log(`[1/3] Weakening, diff: ${securityThresh - currentSecLevel}`);
      // If the server's security level is above our threshold, weaken it
      // const weakenedBy =
      await ns.weaken(target);
      // const amtLeft = securityThresh - weakenedBy;
      // const leftToGoMsg = amtLeft <= 0 ? 'COMPLETE' : `left to go: ${amtLeft}`;
      // log(`Weakened, ${leftToGoMsg}, thresh: ${securityThresh}, ms: ${endTime()}`);
      continue;
    }

    const availableMoney = ns.getServerMoneyAvailable(target);
    const shouldGrow = availableMoney < maxServerMoney;
    if (shouldGrow) {
      // log(`[2/3] Growing, diff: ${formatMoney(maxServerMoney - availableMoney)}`);
      // If the server's money is less than our threshold, grow it
      // const grownFactor =
      await ns.grow(target);
      // const moneyLeft = availableMoney * grownFactor - maxServerMoney;
      // const leftToGoMsg = moneyLeft <= 0 ? 'COMPLETE' : `left to go: ${formatMoney(moneyLeft)}`;
      // log(`Grown, ${leftToGoMsg}, thresh: ${formatMoney(maxServerMoney)}, ms: ${endTime()}`);
      continue;
    }

    // Otherwise, hack it
    //  log(`[3/3] Hacking`);
    const amtStolen = await ns.hack(target);
    log(`Hacked, Amount Stolen: ${formatMoney(amtStolen)}, ms: ${endTime()} elapsed: ${Date.now() - scriptLoopTime}`);
    scriptLoopTime = Date.now();
  }
}

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatMoney = (number: number) => formatter.format(+number.toFixed(0));
