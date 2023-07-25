import { requestClear, requestAuthRegister, requestSetNameV2, requestUserProfileV3 } from '../wrappers';
beforeEach(() => {
  requestClear();
});

describe('/user/profile/setname/v1', () => {
  test('return value', () => {
    requestClear();
    const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
    expect(requestSetNameV2(tokenA, 'DeathLoop', 'ABCD').body).toStrictEqual({});// more tests needed when other function finished
  });

  describe('error', () => {
    test('token is invaild', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo3@gmail.com', 'counterStrike', 'de', 'bug').token;
      expect(requestSetNameV2(tokenA + 'A', 'HeiHeiHei', 'Ichiru').statusCode).toBe(403);
      expect(requestSetNameV2(tokenA + 'A', 'HeiHeiHei', 'Ichiru').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('nameFirst is too long', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo3@gmail.com', 'counterStrike', 'de', 'bug').token;
      expect(requestSetNameV2(tokenA, 'ILoveAnimationGirlAndTheyAreMyWaifuHeiHeiHeiHeiHeiHei', 'Ichiru').statusCode).toBe(400);
      expect(requestSetNameV2(tokenA, 'ILoveAnimationGirlAndTheyAreMyWaifuHeiHeiHeiHeiHeiHei', 'Ichiru').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('nameLast is too long', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo3@gmail.com', 'counterStrike', 'de', 'bug').token;
      expect(requestSetNameV2(tokenA, 'Ichiru', 'ILoveAnimationGirlAndTheyAreMyWaifuHeiHeiHeiHeiHeiHei').statusCode).toBe(400);
      expect(requestSetNameV2(tokenA, 'Ichiru', 'ILoveAnimationGirlAndTheyAreMyWaifuHeiHeiHeiHeiHeiHei').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('nameFirst is empty', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo3@gmail.com', 'counterStrike', 'de', 'bug').token;
      expect(requestSetNameV2(tokenA, '', 'Ichiru').statusCode).toBe(400);
      expect(requestSetNameV2(tokenA, '', 'Ichiru').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('nameLast is empty', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo3@gmail.com', 'counterStrike', 'de', 'bug').token;
      expect(requestSetNameV2(tokenA, 'Ichiru', '').statusCode).toBe(400);
      expect(requestSetNameV2(tokenA, 'Ichiru', '').body.error).toStrictEqual({ message: expect.any(String) });
    });
  });

  test('return value', () => {
    requestClear();
    const tokenA = requestAuthRegister('csgo3@gmail.com', 'counterStrike', 'de', 'bug').token;
    expect(requestSetNameV2(tokenA, 'DeathLoop', 'ABCD').body).toStrictEqual({});
  });
  test('reset the name', () => {
    requestClear();
    const registerObject = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE');
    requestSetNameV2(registerObject.token, 'Ichiru', 'Shirase');
    expect(requestUserProfileV3(registerObject.token, registerObject.authUserId).body).toStrictEqual({
      user: {
        uId: registerObject.authUserId,
        email: 'csgo@gmail.com',
        nameFirst: 'Ichiru',
        nameLast: 'Shirase',
        handleStr: 'abcde',
        profileImgUrl: expect.any(String)
      }
    });
  });
});
