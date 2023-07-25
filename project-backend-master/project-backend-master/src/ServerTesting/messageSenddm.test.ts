
import { requestAuthRegister, requestClear, requestMessageSenddm, requestDmCreate, requestDmMessages } from '../wrappers';
import { authUserId } from '../interfaces';

let registered1: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let registered4: authUserId;
let registered5: authUserId;
let dmId1: number;
let dmId2: number;

beforeAll(() => {
  requestClear();
  registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
  registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
  registered3 = requestAuthRegister('dog@gmail.com', 'dogs123', 'dog', 'drown');
  registered4 = requestAuthRegister('owl@gmail.com', 'owls123', 'owl', 'sink');
  registered5 = requestAuthRegister('hunter@gmail.com', 'hunter123', 'hunter', 'great');
  dmId1 = requestDmCreate(registered2.token, [registered1.authUserId, registered3.authUserId]).dmId;
  dmId2 = requestDmCreate(registered2.token, [registered1.authUserId, registered3.authUserId, registered4.authUserId]).dmId;
});
afterAll(() => {
  requestClear();
});
describe('Error Cases', () => {
  test('Invalid dm Id', () => {
    // console.log(requestMessageSenddm(registered1.token, dmId1 + 1, 'Hi my ducklings'));
    expect(requestMessageSenddm(registered1.token, dmId1 + 1, 'Hi my ducklings').statusCode).toStrictEqual(400);
  });
  test('Message must be between 1 to 1000 letters', () => {
    // console.log((requestMessageSenddm(registered1.token, dmId1, '')));
    expect(requestMessageSenddm(registered1.token, dmId1, '').statusCode).toStrictEqual(400);
  });
  test('Message must be between 1 to 1000 letters', () => {
    let fullChar = '';
    for (let i = 0; i < 1001; i++) {
      fullChar += 'p';
    }
    // console.log(requestMessageSenddm(registered1.token, dmId1, fullChar));
    expect(requestMessageSenddm(registered1.token, dmId1, fullChar).statusCode).toStrictEqual(400);
  });
  test('User is not member of channel', () => {
    // console.log(requestMessageSenddm(registered5.token, dmId1, 'Lets dance'));
    expect(requestMessageSenddm(registered5.token, dmId1, 'Lets dance').statusCode).toStrictEqual(403);
  });
  test('Invalid token', () => {
    // console.log(requestMessageSenddm(registered1.token + 'p', dmId1, 'Lets dance'));
    expect(requestMessageSenddm(registered1.token + 'p', dmId1, 'Lets dance').statusCode).toStrictEqual(400);
  });
});

describe('Function Testing', () => {
  test('Send a dm', () => {
    expect(requestMessageSenddm(registered1.token, dmId2, 'Hi my ducklings').body).toStrictEqual({ messageId: expect.any(Number) });
    const a = requestDmMessages(registered1.token, dmId2, 0).body;
    expect(a.messages[0].message).toStrictEqual('Hi my ducklings');
  });
  test('Send two dms', () => {
    expect(requestMessageSenddm(registered1.token, dmId2, 'Hi my ducklings').body).toStrictEqual({ messageId: expect.any(Number) });
    expect(requestMessageSenddm(registered1.token, dmId2, 'How to get bread ?').body).toStrictEqual({ messageId: expect.any(Number) });
    const a = requestDmMessages(registered1.token, dmId2, 0).body;
    expect(a.messages[1].message).toStrictEqual('Hi my ducklings');
    expect(a.messages[0].message).toStrictEqual('How to get bread ?');
  });
  test('send multiple dms to multiple people', () => {
    requestMessageSenddm(registered1.token, dmId2, 'Hi my ducklings');
    requestMessageSenddm(registered3.token, dmId1, 'How to get bread ?');
    const a = requestDmMessages(registered1.token, dmId2, 0).body;
    const b = requestDmMessages(registered3.token, dmId1, 0).body;
    expect(a.messages[0].message).toStrictEqual('Hi my ducklings');
    expect(b.messages[0].message).toStrictEqual('How to get bread ?');
  });
});
