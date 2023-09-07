type HWGData = number;
export type Data = {
  [host: string]: {
    hackPercent: HWGData;
    //  weaken1: HWGData;
    //  weaken2: HWGData;
    growThreads: HWGData;
  };
};
