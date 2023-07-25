
import { requestClear, requestAuthRegister, requestUsersAllV2 } from '../wrappers';

describe('correct return value', () => {
  test('correct return value', () => {
    expect(requestClear()).toStrictEqual({});
  });
  test('delete all users', () => {
    const registerObjectC = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE');
    expect(requestUsersAllV2(registerObjectC.token).body).toStrictEqual({
      users: [
        {
          uId: registerObjectC.authUserId,
          email: 'csgo@gmail.com',
          nameFirst: 'Ab',
          nameLast: 'CDE',
          handleStr: 'abcde',
          profileImgUrl: expect.any(String)
        }
      ]
    });
    requestClear();
    expect(requestUsersAllV2(registerObjectC.token).statusCode).toBe(403);
    expect(requestUsersAllV2(registerObjectC.token).body.error).toStrictEqual({ message: expect.any(String) });
  });
});

/*  old version
import { clearV1 } from '../other.js';

import { authRegisterV1 } from '../auth.js';

import { channelsCreateV1, channelsListAllV1 } from './../channels.js';

import { channelJoinV1 } from './../channel.js';

import { userProfileV1 } from '../users.js';
describe('three tests', () => {
  test('Empty dataStore object', () => {
    const authId1 = authRegisterV1('gura@gmail.com', '114514810', 'huaizhi', 'li').authUserId;
    expect(clearV1()).toStrictEqual({});
    expect(channelsListAllV1(authId1)).toStrictEqual({ error: expect.any(String) });
    expect(userProfileV1(authId1, authId1)).toStrictEqual({ error: expect.any(String) });
  });

  test('clear the userMember', () => {
    const authId1 = authRegisterV1('gura@gmail.com', '114514810', 'huaizhi', 'li').authUserId;
    const channelId1 = channelsCreateV1(authId1, 'Channel 1', true).channelId;
    const authId2 = authRegisterV1('Ina@outlook.com', 'asdgf8', 'me', 'vasdui').authUserId;
    const authId3 = authRegisterV1('lion@qq.com', 'asduif8195', 'agsdfoj', 'antman').authUserId;

    channelJoinV1(authId1, channelId1);
    expect(userProfileV1(authId2, authId2)).toEqual({
      user: {
        uId: authId2,
        email: 'Ina@outlook.com',
        nameFirst: 'me',
        nameLast: 'vasdui',
        handleStr: 'mevasdui',
      }
    });
    clearV1();
    expect(userProfileV1(authId2, authId3)).toStrictEqual({ error: expect.any(String) });
    expect(channelsListAllV1(authId1)).toStrictEqual({ error: expect.any(String) });
  });

  test('clear all channels', () => {
    const authId1 = authRegisterV1('gura@gmail.com', '114514810', 'huaizhi', 'li').authUserId;
    const channelId1 = channelsCreateV1(authId1, 'Channel 1', true).channelId;
    channelJoinV1(authId1, channelId1);
    expect(channelsListAllV1(authId1)).toStrictEqual({
      channels: [{
        channelId: authId1,
        name: 'Channel 1',
      }]
    });

    clearV1();
    expect(channelsListAllV1(authId1)).toStrictEqual({ error: expect.any(String) });
    expect(userProfileV1(authId1, authId1)).toStrictEqual({ error: expect.any(String) });
  });
});
*/
