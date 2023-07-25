import { requestAuthRegister, requestClear, requestAuthPasswordResetReset } from '../wrappers';
import { getData } from '../dataStore';

// Global
beforeEach(() => {
  requestClear();
  requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adamk', 'Baqaie');
});

describe('Correct Reset', () => {
  test('Correct resetcode', () => {
    const data = getData();

    expect(requestAuthPasswordResetReset(data.users[0].resetCode, 'hell11o').body).toStrictEqual({});
    expect(requestAuthPasswordResetReset(data.users[0].resetCode, 'hell11o').statusCode).toStrictEqual(200);
  });
});

describe('Incorrect Reset', () => {
  test('incorrect resetcode', () => {
    const data = getData();
    expect(requestAuthPasswordResetReset(data.users[0].resetCode, 'helo').body.error).toStrictEqual({ message: expect.any(String) });
    expect(requestAuthPasswordResetReset('1234', 'hell11o').statusCode).toStrictEqual(400);
  });
  test('Short password', () => {
    expect(requestAuthPasswordResetReset('1234', 'hello').body.error).toStrictEqual({ message: expect.any(String) });
    expect(requestAuthPasswordResetReset('1234', 'hello').statusCode).toStrictEqual(400);
  });
});
