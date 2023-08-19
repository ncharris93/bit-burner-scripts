import {NS} from '@ns'
import {NCH_Server} from './map-host-to-server'
/**
 * This is designed to split out work a specific server 
 * general idea = 
 * set each task (W/G/H) to take a specific amount of RAM,
 * calculate time to grow to max
 * calculate time to weaken to least
 * calculate time to hack
 * 
 * spawn 3 threads
 *    - W: use enough threads to weaken to min
 *    - G: use enough threads to grow to max
 *    - H: use all threads to hack
 * 
 * get max time highest common multiple
 * 
 * time W/G/H such that timing is hit (W)
 * 
 * 
 * 
 * 
 */
const 
export const internalServerManager = async (ns:NS: server: NCH_Server) => {

   

};
