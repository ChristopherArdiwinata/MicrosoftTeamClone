
import { requestAuthRegister, requestClear, requestMessageSend, requestChannelsCreate } from '../wrappers';
import { requestChannelMessages } from '../wrappers';
import { authUserId } from '../interfaces';

let registered1: authUserId;
let registered2: authUserId;
let channelId1: number;
let channelId2: number;

afterAll(() => {
  requestClear();
});

beforeAll(() => {
  requestClear();
  registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
  registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
  channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
  channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
});
describe('Error Cases', () => {
  test('Invalid channelId', () => {
    expect(requestMessageSend(registered1.token, channelId1 * channelId2 + 1, 'Hi my ducklings').statusCode).toStrictEqual(400);
  });
  test('Message must be between 1 to 1000 letters', () => {
    expect(requestMessageSend(registered1.token, channelId1, '').statusCode).toStrictEqual(400);
  });
  test('Message must be between 1 to 1000 letters', () => {
    let fullChar = '';
    for (let i = 0; i < 1001; i++) {
      fullChar += 'p';
    }
    expect(requestMessageSend(registered1.token, channelId1, fullChar).statusCode).toStrictEqual(400);
  });
  test('User is not member of channel', () => {
    expect(requestMessageSend(registered1.token, channelId2, 'Lets dance').statusCode).toStrictEqual(403);
  });
  test('Invalid token', () => {
    expect(requestMessageSend(registered1.token + registered2.token + 'p', channelId1, 'Lets dance').statusCode).toStrictEqual(400);
  });
});

describe('Function Testing', () => {
  test('Send a message', () => {
    expect(requestMessageSend(registered1.token, channelId1, 'Hi my ducklings').body).toStrictEqual({ messageId: expect.any(Number) });
    const a = requestChannelMessages(registered1.token, channelId1, 0).body;
    expect(a.messages[0].message).toStrictEqual('Hi my ducklings');
  });
  test('Send two messages in the same channel', () => {
    expect(requestMessageSend(registered1.token, channelId1, 'Hi my ducklings').body).toStrictEqual({ messageId: expect.any(Number) });
    expect(requestMessageSend(registered1.token, channelId1, 'How to get bread ?').body).toStrictEqual({ messageId: expect.any(Number) });
    const a = requestChannelMessages(registered1.token, channelId1, 0).body;
    expect(a.messages[1].message).toStrictEqual('Hi my ducklings');
    expect(a.messages[0].message).toStrictEqual('How to get bread ?');
  });
  test('Send four messages in the two channels', () => {
    expect(requestMessageSend(registered1.token, channelId1, 'one').body).toStrictEqual({ messageId: expect.any(Number) });
    expect(requestMessageSend(registered2.token, channelId2, 'two').body).toStrictEqual({ messageId: expect.any(Number) });
    expect(requestMessageSend(registered1.token, channelId1, 'three').body).toStrictEqual({ messageId: expect.any(Number) });
    expect(requestMessageSend(registered2.token, channelId2, 'four').body).toStrictEqual({ messageId: expect.any(Number) });

    const a = requestChannelMessages(registered1.token, channelId1, 0).body;
    const b = requestChannelMessages(registered2.token, channelId2, 0).body;

    expect(a.messages[1].message).toStrictEqual('one');
    expect(a.messages[0].message).toStrictEqual('three');
    expect(b.messages[1].message).toStrictEqual('two');
    expect(b.messages[0].message).toStrictEqual('four');
  });
});
