/**
 * Resets the internal data of the application to its initial state
 * @param none
 * @returns {{}}
 */
import { setData } from './dataStore';
import { dataTs } from './interfaces';
export function clearV1() {
  const iniData: dataTs = {
    users: [],
    channels: [],
    dms: [],
    deletedUsers: []
  };
  setData(iniData);

  return {};
}
