import { NS } from '@ns';
import { FORMULA_FILE_NAME } from './formulas.constants';
import { Data } from './formulas.types';

export function main(ns: NS): Data {
  return readFormulasData(ns);
}
export function readFormulasData(ns: NS): Data {
  try {
    const data = ns.read(FORMULA_FILE_NAME);
    return JSON.parse(data);
  } catch (e) {
    ns.tprint(`ERROR: failed to parse json data. error: ${JSON.stringify(e)}`);
    return {} as Data;
  }
}
