import { requestUserProfileV3, requestClear, requestuserProfileSethandleV2, requestAuthRegister } from '../wrappers';
beforeEach(() => {
  requestClear();
});
describe('/user/profile/sethandle/v1', () => {
  describe('error', () => {
    test('the token is invaild', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
      expect(requestuserProfileSethandleV2(tokenA + 'A', 'AIIsLove').statusCode).toBe(403);
      expect(requestuserProfileSethandleV2(tokenA + 'A', 'AIIsLove').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('the length of new handle smaller than 3', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
      expect(requestuserProfileSethandleV2(tokenA, 'AI').statusCode).toBe(400);
      expect(requestuserProfileSethandleV2(tokenA, 'AI').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('the length of new handle greater than 20', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
      expect(requestuserProfileSethandleV2(tokenA, 'ILoveAnimationGirlAndTheyAreMyWaifu').statusCode).toBe(400);
      expect(requestuserProfileSethandleV2(tokenA, 'ILoveAnimationGirlAndTheyAreMyWaifu').body.error).toStrictEqual({ message: expect.any(String) });
    });
    test('handleStr include non alphanumeric', () => {
      requestClear();
      const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
      expect(requestuserProfileSethandleV2(tokenA, ':d%^$#!@$#%^').statusCode).toBe(400);
      expect(requestuserProfileSethandleV2(tokenA, ':d%^$#!@$#%^').body.error).toStrictEqual({ message: expect.any(String) });
    });
  });

  test('return value', () => {
    requestClear();
    const tokenA = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE').token;
    expect(requestuserProfileSethandleV2(tokenA, 'AbCats').body).toStrictEqual({});
  });

  test('reset the handle', () => {
    requestClear();
    const registerObject = requestAuthRegister('csgo@gmail.com', 'counterStrike', 'Ab', 'CDE');
    requestuserProfileSethandleV2(registerObject.token, 'AbCats');
    expect(requestUserProfileV3(registerObject.token, registerObject.authUserId).body).toStrictEqual({
      user: {
        uId: registerObject.authUserId,
        email: 'csgo@gmail.com',
        nameFirst: 'Ab',
        nameLast: 'CDE',
        handleStr: 'AbCats',
        profileImgUrl: expect.any(String)
      }
    });
  });
});
