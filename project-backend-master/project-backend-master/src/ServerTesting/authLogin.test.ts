import { requestAuthRegister, requestClear, requestAuthLogin } from '../wrappers';

beforeEach(() => {
  requestClear();
  requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie');
  requestAuthRegister('John@gmail.com', 'John123', 'John', 'Saul');
});

describe('Correct Login', () => {
  test('Correct Inputs', () => {
    const registered = requestAuthLogin('adam.baqaie@gmail.com', 'adam123');
    const registered2 = requestAuthLogin('John@gmail.com', 'John123');
    expect(registered).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(registered2).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });
});

describe('Incorrect Login', () => {
  test.each([
    { testName: 'incorrect email', email: 'albert.kim@gmail.com', password: 'adam123' },
    { testName: 'incorrect password', email: 'adam.baqaie@gmail.com', password: 'hello1' },
    { testName: 'incorrect password', email: 'Johne@gmail.com', password: 'hello1' },
  ])('Input has $testName', ({ email, password }) => {
    expect(requestAuthLogin(email, password).error).toStrictEqual({ message: expect.any(String) });
  });

  test('No Users', () => {
    requestClear();
    expect(requestAuthLogin('adam.b@gmail.com', 'password').error).toStrictEqual({ message: expect.any(String) });
  });
});
