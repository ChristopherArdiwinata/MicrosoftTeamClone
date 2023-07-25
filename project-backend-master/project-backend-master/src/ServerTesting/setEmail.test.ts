import { requestClear, requestAuthRegister, requestuserSetemailV2, requestUserProfileV3 } from '../wrappers';
beforeEach(() => {
  requestClear();
});

describe('/user/profile/setemail/v2', () => {
  describe('error', () => {
    test('token is invaild', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
      expect(requestuserSetemailV2(tokenA + 'A', 'AI').statusCode).toBe(403);
      expect(requestuserSetemailV2(tokenA + 'A', 'AI').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('input email is invaild', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
      expect(requestuserSetemailV2(tokenA, 'AI').statusCode).toBe(400);
      expect(requestuserSetemailV2(tokenA, 'AI').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('input email is in use', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
      requestAuthRegister('csgo3@gmail.com', 'counterStrike', 'de', 'bug');
      requestAuthRegister('csgo6@gmail.com', 'qwer', 'tyu', 'io');
      expect(requestuserSetemailV2(tokenA, 'csgo3@gmail.com').statusCode).toBe(400);
      expect(requestuserSetemailV2(tokenA, 'csgo3@gmail.com').body.error).toStrictEqual({ message: expect.any(String) });
    });
  });

  test('return value', () => {
    requestClear();
    const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
    expect(requestuserSetemailV2(tokenA, 'Eatham@gmail.com').body).toStrictEqual({});
  });
  test('reset the email', () => {
    requestClear();
    const registerObject = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE');
    requestuserSetemailV2(registerObject.token, 'tEaiHem@gmail.com');
    expect(requestUserProfileV3(registerObject.token, registerObject.authUserId).body).toStrictEqual({
      user: {
        uId: registerObject.authUserId,
        email: 'tEaiHem@gmail.com',
        nameFirst: 'Ab',
        nameLast: 'CDE',
        handleStr: 'abcde',
        profileImgUrl: expect.any(String)
      }
    });
    requestClear();
  });
});
