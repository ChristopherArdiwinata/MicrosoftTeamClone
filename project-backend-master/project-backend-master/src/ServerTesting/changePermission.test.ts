import { requestAuthRegister, requestClear, requestPermissionChange } from '../wrappers';
describe('test only for changePermission', () => {
  let authId1: number;
  let authId2: number;
  let authToken1: string;
  let authToken2: string;
  let authToken3: string;

  beforeEach(() => {
    requestClear();
    const user1 = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Albert');
    authId1 = user1.authUserId;
    authToken1 = user1.token;

    const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Baqaie');
    authId2 = user2.authUserId;
    authToken2 = user2.token;

    const user3 = requestAuthRegister('claire@gmail.com', 'ccc123', 'Claire', 'Christopher');
    authToken3 = user3.token;
  });

  test('Backstab: The initial global owner upgrade a member perimission and then he downgrade the ex-owner ', () => {
    expect(requestPermissionChange(authToken1, authId2, 1).body).toEqual({});
    expect(requestPermissionChange(authToken2, authId1, 2).body).toEqual({});
    expect(requestPermissionChange(authToken1, authId2, 2).statusCode).toBe(403);
  });

  test('global owner try to demoted himself to a user', () => {
    expect(requestPermissionChange(authToken1, authId2, 1).body).toEqual({});
    expect(requestPermissionChange(authToken1, authId1, 2).body).toEqual({});
  });

  describe('test only about register and permission ', () => {
    let authId1: number;
    let authId2: number;
    let authId3: number;
    let authToken1: string;
    let authToken2: string;
    let authPId1: number;
    let authPId2: number;
    beforeEach(() => {
      requestClear();
      const user1 = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Albert');
      authId1 = user1.authUserId;
      authToken1 = user1.token;
      authPId1 = user1.permission;
      const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Baqaie');
      authId2 = user2.authUserId;
      authToken2 = user2.token;
      authPId2 = user2.permission;
    });

    test('Invalid uId', () => {
      expect(requestPermissionChange(authToken1, (authId1 + authId2 + authId3), 1).statusCode).toBe(400);
    });

    test('Invalid token', () => {
      expect(requestPermissionChange(authToken1 + authToken2 + authToken3, authId2, 1).statusCode).toBe(403);
    });

    test('uId already have permissionId 2', () => {
      expect(requestPermissionChange(authToken1, authId2, 2).statusCode).toBe(400);
    });

    test('uId already have permissionId1', () => {
      expect(requestPermissionChange(authToken1, authId2, 1).body).toEqual({});
      expect(requestPermissionChange(authToken2, authId1, 1).statusCode).toBe(400);
    });

    test('only global owner try to demoted himself to a user', () => {
      expect(requestPermissionChange(authToken1, authId1, 2).statusCode).toBe(400);
    });

    test('Invalid permissionId', () => {
      expect(requestPermissionChange(authToken1, authId2, authPId1 + authPId2).statusCode).toBe(400);
    });
  });
});
