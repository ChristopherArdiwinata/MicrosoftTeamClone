import { requestAuthRegister, requestClear } from '../wrappers';
import { authUserId } from '../interfaces';

// Global
let registered: authUserId;
beforeAll(() => {
  requestClear();
  registered = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adamklklklk', 'Baqaieokokokokok');
});

describe('Correct Registration', () => {
  test('Correct Inputs', () => {
    expect(registered).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });
});

describe('Incorrect Registration', () => {
  test.each([
    { testName: 'incorrect email', email: 'foo.bar@@gmail.c@m', password: 'hello123', nameFirst: 'Daniel', nameLast: 'Murphy' },
    { testName: 'in-use email', email: 'adam.baqaie@gmail.com', password: 'hello1', nameFirst: 'Daniel', nameLast: 'Murphy' },
    { testName: 'password < 6 char', email: 'foo.bar@foobar.com', password: 'hello', nameFirst: 'Daniel', nameLast: 'Murphy' },
    { testName: 'length of nameFirst < 1 || > 50', email: 'foo.bar@foobar.com', password: 'hello1', nameFirst: '', nameLast: 'Murphy' },
    { testName: 'length of nameFirst < 1 || > 50', email: 'foo.bar@foobar.com', password: 'hello1', nameFirst: 'ghfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfh', nameLast: 'Murphy' },
    { testName: 'length of nameLast < 1 || > 50', email: 'foo.bar@foobar.com', password: 'hello1', nameFirst: 'Daniel', nameLast: '' },
    { testName: 'length of nameLast < 1 || > 50', email: 'foo.bar@foobar.com', password: 'hello1', nameFirst: 'Daniel', nameLast: 'ghfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfh' },
  ])('Input has $testName', ({ email, password, nameFirst, nameLast }) => {
    expect(requestAuthRegister(email, password, nameFirst, nameLast).error).toStrictEqual({ message: expect.any(String) });
  });
});
