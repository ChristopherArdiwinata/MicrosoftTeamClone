import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { validateToken, userIndexUid1, getUIdFromToken, isUserIdValid, isGlobalOwnerFromToken1, getPermissionIdFromUid1 } from './helper';
export function PermissionChange(token: string, uId: number, permissionId: number) {
  const data = getData();
  if (!validateToken(token)) {
    throw HTTPError(403, 'token is not valid');
  }

  if (!isUserIdValid(uId)) {
    throw HTTPError(400, 'Invalid uId');
  }
  if (!isGlobalOwnerFromToken1(token)) {
    throw HTTPError(403, 'you are not a global owner!');
  }
  if (!(permissionId === 1 || permissionId === 2)) {
    throw HTTPError(400, 'permissionId invaild');
  }

  if (getPermissionIdFromUid1(uId) === permissionId) {
    throw HTTPError(400, 'the user already has this permission level!');
  }
  const newArrays = data.users.filter(function (item) {
    return item.permissionId === 1;
  });
  if (newArrays.length === 1 && uId === getUIdFromToken(token) && permissionId === 2) {
    throw HTTPError(400, 'You are the only global user now and you can not demote yourself!');
  }
  const userIndex = userIndexUid1(uId);
  data.users[userIndex].permissionId = permissionId;
  setData(data);
  return {};
}
