import { requestAuthLogout, requestAuthRegister, requestAuthLogin, requestClear } from '../wrappers';

let token1: string;
let token2: string;
beforeEach(() => {
  requestClear();
  token1 = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie').token;
  token2 = requestAuthRegister('John@gmail.com', 'John123', 'John', 'Saul').token;
});

describe('Correct token', () => {
  test('Correct Inputs', () => {
    const registered = requestAuthLogin('adam.baqaie@gmail.com', 'adam123').token;
    const registered2 = requestAuthLogin('adam.baqaie@gmail.com', 'adam123').token;
    const registered3 = requestAuthLogin('John@gmail.com', 'John123').token;
    expect(requestAuthLogout(token2)).toStrictEqual({});
    expect(requestAuthLogout(registered)).toStrictEqual({});
    expect(requestAuthLogout(registered2)).toStrictEqual({});
    expect(requestAuthLogout(registered3)).toStrictEqual({});
    expect(requestAuthLogout(token1)).toStrictEqual({});
  });
});

describe('Incorrect token', () => {
  test('incorrect token', () => {
    expect(requestAuthLogout((token1 + token2 + Date.now())).error).toStrictEqual({ message: expect.any(String) });
  });
});
