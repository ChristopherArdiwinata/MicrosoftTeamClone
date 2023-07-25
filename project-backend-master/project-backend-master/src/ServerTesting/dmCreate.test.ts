import { requestAuthRegister, requestClear, requestDmCreate, requestDmDetails } from '../wrappers';

import { authUserId } from '../interfaces';

// Global
let registered: authUserId;
let registered2: authUserId;
// let registered3: authUserId;
// let registered4: authUserId;
// let uIds: number[];
let uIds2: number[];
// let dmId: number;
let dmId2: number;

beforeAll(() => {
  requestClear();
  registered = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'B');
  registered2 = requestAuthRegister('adam@gmail.com', 'adam123', 'C', 'B');
  // registered3 = requestAuthRegister('baqaie@gmail.com', 'adam123', 'E', 'B');
  // registered4 = requestAuthRegister('a@gmail.com', 'adam123', 'F', 'B');
  // uIds = [registered2.authUserId, registered3.authUserId, registered4.authUserId];
  // dmId = requestDmCreate(registered.token, uIds).dmId;
  uIds2 = [registered2.authUserId];
  dmId2 = requestDmCreate(registered.token, uIds2).dmId;
});

describe('Correct Dm Create', () => {
  test('Creates Dm', () => {
    expect(requestDmCreate(registered.token, uIds2)).toStrictEqual({ dmId: expect.any(Number) });
  });

  // test('Correct Output DmList', () => {
  //   expect(requestDmList(registered3.token).body).toStrictEqual({
  //     dms: [{
  //       dmId: dmId,
  //       name: 'adamb, cb, eb, fb'
  //     }]
  //   });
  // });

  test('Correct Output DmDetails', () => {
    expect(requestDmDetails(registered2.token, dmId2).body).toStrictEqual({
      name: 'adamb, cb',
      members: [{
        uId: registered.authUserId,
        email: 'adam.baqaie@gmail.com',
        nameFirst: 'Adam',
        nameLast: 'B',
        handleStr: 'adamb'
      },
      {
        uId: registered2.authUserId,
        email: 'adam@gmail.com',
        nameFirst: 'C',
        nameLast: 'B',
        handleStr: 'cb'
      }]
    });
  });
});

describe('Incorrect Dm Create', () => {
  test('Invalid uId, Duplicate uId, auth in uIds, invalid token', () => {
    expect(requestDmCreate(registered.token, [registered2.authUserId, (registered.authUserId + Date.now()) * 2]).error).toStrictEqual({ message: expect.any(String) });
    expect(requestDmCreate(registered.token, [registered2.authUserId, registered2.authUserId]).error).toStrictEqual({ message: expect.any(String) });
    expect(requestDmCreate(registered.token, [registered2.authUserId, registered.authUserId]).error).toStrictEqual({ message: expect.any(String) });
    expect(requestDmCreate((registered.token + registered.token + Date.now()), uIds2).error).toStrictEqual({ message: expect.any(String) });
  });
  // test('Duplicate uId', () => {
  //   expect(requestDmCreate(registered.token, [registered2.authUserId, registered2.authUserId]).error).toStrictEqual({ message: expect.any(String) });
  // });
  // test('authorised user in uIds', () => {
  //   expect(requestDmCreate(registered.token, [registered2.authUserId, registered.authUserId]).error).toStrictEqual({ message: expect.any(String) });
  // });
  // test('Invalid token', () => {
  //   expect(requestDmCreate((registered.token + registered.token + Date.now()), uIds2).error).toStrictEqual({ message: expect.any(String) });
  // });
});
