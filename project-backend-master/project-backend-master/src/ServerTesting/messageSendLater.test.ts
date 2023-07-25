
import { requestAuthRegister, requestClear, requestMessageSendLater, requestChannelsCreate } from '../wrappers';
import { requestChannelMessages } from '../wrappers';
import { authUserId } from '../interfaces';
const ERROR = { message: expect.any(String) };

let registered1: authUserId;
let registered2: authUserId;
let channelId1: number;
let channelId2: number;

beforeEach(() => {
  requestClear();
  registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
  registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
  channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
  channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
});

describe('Error Cases', () => {
  test('Invalid channelId', () => {
    const timeSent = new Date().getTime() / 1000 + 500;
    expect(requestMessageSendLater(registered1.token, channelId1 * channelId2 + 1, 'Hi my ducklings', timeSent).statusCode).toBe(400);
    expect(requestMessageSendLater(registered1.token, channelId1 * channelId2 + 1, 'Hi my ducklings', timeSent).body.error).toStrictEqual(ERROR);
  });

  test('Message must be between 1 to 1000 letters', () => {
    const timeSent = new Date().getTime() / 1000 + 500;
    expect(requestMessageSendLater(registered1.token, channelId1, '', timeSent).statusCode).toBe(400);
    expect(requestMessageSendLater(registered1.token, channelId1, '', timeSent).body.error).toStrictEqual(ERROR);
  });

  test('Message must be between 1 to 1000 letters', () => {
    let fullChar = '';
    for (let i = 0; i < 1001; i++) {
      fullChar += 'p';
    }
    const timeSent = new Date().getTime() / 1000 + 500;
    expect(requestMessageSendLater(registered1.token, channelId1, fullChar, timeSent).statusCode).toBe(400);
    expect(requestMessageSendLater(registered1.token, channelId1, fullChar, timeSent).body.error).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const timeSent = new Date().getTime() / 1000 + 500;
    expect(requestMessageSendLater(registered1.token + registered2.token + 'p', channelId1, 'Lets dance', timeSent).statusCode).toBe(403);
    expect(requestMessageSendLater(registered1.token + registered2.token + 'p', channelId1, 'Lets dance', timeSent).body.error).toStrictEqual(ERROR);
  });

  test('User is not member of channel', () => {
    const timeSent = new Date().getTime() / 1000 + 500;
    expect(requestMessageSendLater(registered1.token, channelId2, 'Lets dance', timeSent).statusCode).toBe(403);
    expect(requestMessageSendLater(registered1.token, channelId2, 'Lets dance', timeSent).body.error).toStrictEqual(ERROR);
  });

  test('timeSent is in the past', () => {
    const timeSent = new Date().getTime() / 1000 - 500;
    expect(requestMessageSendLater(registered1.token, channelId1, 'Lets dance', timeSent).statusCode).toBe(400);
    expect(requestMessageSendLater(registered1.token, channelId1, 'Lets dance', timeSent).body.error).toStrictEqual(ERROR);
  });
});

describe('Function Testing', () => {
  test('Send a message', () => {
    const timeSent = (new Date().getTime() / 1000) + 1;
    expect(requestMessageSendLater(registered1.token, channelId1, 'Hi my ducklings', timeSent).body).toStrictEqual({ messageId: expect.any(Number) });
    const a = requestChannelMessages(registered1.token, channelId1, 0).body;
    expect(a.messages[0].message).toStrictEqual('Hi my ducklings');
    expect(a.messages[0].timeSent).toStrictEqual(~~timeSent);
  });

  // test('Send two messages in the same channel', () => {
  //   const timeSent = (new Date().getTime() / 1000) + 1;
  //   const timeSent2 = (new Date().getTime() / 1000) + 2;

  //   expect(requestMessageSendLater(registered1.token, channelId1, 'Hi my ducklings', timeSent).body).toStrictEqual({ messageId: expect.any(Number) });
  //   expect(requestMessageSendLater(registered1.token, channelId1, 'How to get bread ?', timeSent2).body).toStrictEqual({ messageId: expect.any(Number) });
  //   const a = requestChannelMessages(registered1.token, channelId1, 0).body;

  //   expect(a.messages[1].message).toStrictEqual('Hi my ducklings');
  //   expect(a.messages[1].timeSent).toStrictEqual(~~timeSent);

  //   expect(a.messages[0].message).toStrictEqual('How to get bread ?');
  //   expect(a.messages[0].timeSent).toStrictEqual(~~timeSent2);
  // });

  // test('Send four messages in the two channels', () => {
  //   const timeSent = (new Date().getTime() / 1000) + 1;
  //   const timeSent2 = timeSent + 2;
  //   const timeSent3 = timeSent2 + 3;
  //   const timeSent4 = timeSent3 + 4;
  //   expect(requestMessageSendLater(registered1.token, channelId1, 'one', timeSent).body).toStrictEqual({ messageId: expect.any(Number) });
  //   expect(requestMessageSendLater(registered2.token, channelId2, 'two', timeSent2).body).toStrictEqual({ messageId: expect.any(Number) });
  //   expect(requestMessageSendLater(registered1.token, channelId1, 'three', timeSent3).body).toStrictEqual({ messageId: expect.any(Number) });
  //   expect(requestMessageSendLater(registered2.token, channelId2, 'four', timeSent4).body).toStrictEqual({ messageId: expect.any(Number) });

  //   const a = requestChannelMessages(registered1.token, channelId1, 0).body;
  //   const b = requestChannelMessages(registered2.token, channelId2, 0).body;

  //   expect(a.messages[1].message).toStrictEqual('one');
  //   expect(a.messages[1].timeSent).toStrictEqual(~~timeSent);

  //   expect(a.messages[0].message).toStrictEqual('three');
  //   expect(a.messages[0].timeSent).toStrictEqual(~~timeSent3);

  //   expect(b.messages[1].message).toStrictEqual('two');
  //   expect(b.messages[1].timeSent).toStrictEqual(~~timeSent2);

  //   expect(b.messages[0].message).toStrictEqual('four');
  //   expect(b.messages[0].timeSent).toStrictEqual(~~timeSent4);

  //   requestClear();
  // });
});
