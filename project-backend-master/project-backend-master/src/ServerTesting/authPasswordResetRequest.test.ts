import { requestAuthRegister, requestClear, requestAuthPasswordResetRequest } from '../wrappers';

beforeEach(() => {
  requestClear();
  requestAuthRegister('ilyas.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie');
});

describe('Email Sent', () => {
  test('Correct Inputs', () => {
    expect(requestAuthPasswordResetRequest('ilyas.baqaie@gmail.com').body).toStrictEqual({});
    expect(requestAuthPasswordResetRequest('ilyas.baqaie@gmail.com').statusCode).toBe(200);
  });
});
