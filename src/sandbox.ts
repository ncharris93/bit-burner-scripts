import { NS } from '@ns';
import { main as W } from './formulas/formulas-write';
import { main as R } from './formulas/formulas-read';
import { pollDance } from './stocks';
import { getNodeArray } from './get-node-array';
import { mapHostToServer } from './map-host-to-server';
import { getCurrentTarget } from './get-current-target';

export async function main(ns: NS) {
  // batcher
  const getTarget = () => getCurrentTarget(ns);
}

const HACK = (ns: NS, target) => {};

// export async function main(ns: NS) {
//   return pollDance(ns);
//   //   const symbols = ns.stock.getSymbols();
//   //   const sym = symbols[0];
//   //   const orgs = symbols.map((sym) => {
//   //     return ns.stock.getOrganization(sym);
//   //   });

//   //   console.log({
//   //     orgs,
//   //     getAskPrice: ns.stock.getAskPrice(sym),
//   //     getConstants: ns.stock.getConstants(),
//   //     getBidPrice: ns.stock.getBidPrice(sym),
//   //     getMaxShares: ns.stock.getMaxShares(sym),
//   //     //  getOrders: ns.stock.getOrders(),
//   //     getPosition: ns.stock.getPosition(sym),
//   //   });
// }
