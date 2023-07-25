
import { requestAuthRegister, requestClear, requestDmCreate, requestDmDetails } from '../wrappers';
import { authUserId } from '../interfaces';

// Global
let registered: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let registered4: authUserId;
let registered5: authUserId;
let uIds: number[];
let uIds2: number[];
let dmId: number;
let dmId2: number;
beforeEach(() => {
  requestClear();
  registered = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'B');
  registered2 = requestAuthRegister('adam@gmail.com', 'adam123', 'C', 'B');
  registered3 = requestAuthRegister('baqaie@gmail.com', 'adam123', 'E', 'B');
  registered4 = requestAuthRegister('a@gmail.com', 'adam123', 'F', 'B');
  registered5 = requestAuthRegister('aa@gmail.com', 'adam123', 'G', 'H');
  uIds = [registered2.authUserId, registered3.authUserId, registered4.authUserId];
  dmId = requestDmCreate(registered.token, uIds).dmId;
  uIds2 = [registered2.authUserId];
  dmId2 = requestDmCreate(registered.token, uIds2).dmId;
});

describe('dmDetails Success', () => {
  test('Test 1', () => {
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
    expect(requestDmDetails(registered2.token, dmId2).statusCode).toBe(200);
  });
});

describe('dmDetails Error', () => {
  test('Test 1: Invalid Token', () => {
    expect(requestDmDetails(registered5.token + 'asldkjalsdj', dmId).statusCode).toBe(403);
    expect(requestDmDetails(registered5.token + 'asldkjalsdj', dmId).body.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Test 2: Invalid dmId', () => {
    expect(requestDmDetails(registered5.token, dmId + dmId2).statusCode).toBe(400);
    expect(requestDmDetails(registered5.token, dmId + dmId2).body.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Test 3: Member is not in DM', () => {
    expect(requestDmDetails(registered5.token, dmId).statusCode).toBe(403);
    expect(requestDmDetails(registered5.token, dmId).body.error).toStrictEqual({ message: expect.any(String) });
  });
});
