import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  // Defines the "target server", which is the server
  // that we're going to hack. In this case, it's "n00dles"
  const target = `${ns.args[0]}`;
  //const server = ns.getServer()

  const log = (...args: any[]) => {
    if (args.length === 1) {
      const msg = args[0];
      return console.log(`[${target}]: ${msg}`);
    }
    return console.log(`[${target}]: `, ...args);
  };

  log('Init Hacking Template: ', target);

  // Defines how much money a server should have before we hack it
  // In this case, it is set to the maximum amount of money.
  const maxServerMoney = ns.getServerMaxMoney(target);

  // Defines the maximum security level the target server can
  // have. If the target's security level is higher than this,
  // we'll weaken it before doing anything else
  const securityThresh = ns.getServerMinSecurityLevel(target);

  // Get root access to target server
  ns.nuke(target);
  let scriptLoopTime = Date.now();

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    const startTime = Date.now();
    const endTime = () => Date.now() - startTime;

    const currentSecLevel = ns.getServerSecurityLevel(target);
    const shouldWeaken = currentSecLevel > securityThresh;
    if (shouldWeaken) {
      log(`[1/3] Weakening, diff: ${securityThresh - currentSecLevel}`);
      // If the server's security level is above our threshold, weaken it
      const weakenedBy = await ns.weaken(target);
      const amtLeft = securityThresh - weakenedBy;
      const leftToGoMsg = amtLeft <= 0 ? 'COMPLETE' : `left to go: ${amtLeft}`;
      log(`Weakened, ${leftToGoMsg}, thresh: ${securityThresh}, ms: ${endTime()}`);
      continue;
    }

    const availableMoney = ns.getServerMoneyAvailable(target);
    const shouldGrow = availableMoney < maxServerMoney;
    if (shouldGrow) {
      log(`[2/3] Growing, diff: ${formatMoney(maxServerMoney - availableMoney)}`);
      // If the server's money is less than our threshold, grow it
      const grownFactor = await ns.grow(target);
      const moneyLeft = availableMoney * grownFactor - maxServerMoney;
      const leftToGoMsg = moneyLeft <= 0 ? 'COMPLETE' : `left to go: ${formatMoney(moneyLeft)}`;
      log(`Grown, ${leftToGoMsg}, thresh: ${formatMoney(maxServerMoney)}, ms: ${endTime()}`);
      continue;
    }

    // Otherwise, hack it
    log(`[3/3] Hacking`);
    const amtStolen = await ns.hack(target);
    log(`Hacked, Amount Stolen: ${formatMoney(amtStolen)}, ms: ${endTime()} elapsed: ${Date.now() - scriptLoopTime}`);
    scriptLoopTime = Date.now();
  }
}

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatMoney = (number: number) => formatter.format(+number.toFixed(0));
