import { NS } from '@ns';

export const isNewGame = (ns: NS) => ns.getHackingLevel() < 100;
