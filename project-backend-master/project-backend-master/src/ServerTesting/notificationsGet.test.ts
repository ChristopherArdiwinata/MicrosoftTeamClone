
import {
  requestAuthRegister, requestClear, requestMessageSend, requestChannelsCreate,
  requestChannelInvite, requestMessageEdit,
  requestMessageReact, requestNotificationsGet, requestDmCreate, requestMessageSenddm
} from '../wrappers';
import { authUserId } from '../interfaces';

let registered1: authUserId;
let registered2: authUserId;
let channelId1: number;
let messageId1: number;
let dmId1: number;
describe('Function Testing', () => {
  beforeAll(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
    channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
    requestChannelInvite(registered1.token, channelId1, registered2.authUserId);
    dmId1 = requestDmCreate(registered1.token, [registered2.authUserId]).dmId;
    messageId1 = requestMessageSend(registered2.token, channelId1, '@duckdash, Hi my ducklings').body.messageId;
    // requestMessageSend(registered1.token, channelId1, '@duckdash! @duckdash! Reminder!!');
    requestMessageSenddm(registered1.token, dmId1, 'hello @duckdash');
  });

  test('Tags from channels & Dm', () => {
    expect(requestNotificationsGet(registered1.token).body).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dmId1,
          notificationMessage: 'duckdash tagged you in chickmafia, duckdash: hello @duckdash'
        },
        // {
        //   channelId: channelId1,
        //   dmId: -1,
        //   notificationMessage: '{duckdash} tagged you in {nest}: @duckdash! @duckdash'
        // },
        {
          channelId: channelId1,
          dmId: -1,
          notificationMessage: 'chickmafia tagged you in nest: @duckdash, Hi my duc'
        }
      ]
    });
  });

  test('Edit Message and Join Channel Notif', () => {
    requestMessageEdit(registered2.token, messageId1, '@chickmafia, hello');
    expect(requestNotificationsGet(registered2.token).body).toStrictEqual({
      notifications: [
        {
          channelId: channelId1,
          dmId: -1,
          notificationMessage: 'chickmafia tagged you in nest: @chickmafia, hello'
        },
        {
          channelId: channelId1,
          dmId: -1,
          notificationMessage: 'duckdash added you to nest'
        }
      ]
    });
  });

  // test('Notif from joining channel', () => {
  //   const registered3 = requestAuthRegister('adam@gmail.com', 'adam123', 'adam', 'baqaie');
  //   requestChannelInvite(registered1.token, channelId1, registered3.authUserId);
  //   // requestMessageSend(registered2.token, channelId1, '@adambaqaie hello mate');
  //   expect(requestNotificationsGet(registered3.token).body).toStrictEqual({
  //     notifications: [
  //       // {
  //       //   channelId: channelId1,
  //       //   dmId: -1,
  //       //   notificationMessage: '{chickmafia} tagged you in {nest}: @adambaqaie hello ma'
  //       // },
  //       {
  //         channelId: channelId1,
  //         dmId: -1,
  //         notificationMessage: '{duckdash} added you to {nest}'
  //       }
  //     ]
  //   });
  // });

  test('Notif from react', () => {
    // Get registered 1 to react to registered 2 message in channel
    requestMessageReact(registered1.token, messageId1, 1);
    expect(requestNotificationsGet(registered2.token).body).toStrictEqual({
      notifications: [
        {
          channelId: channelId1,
          dmId: -1,
          notificationMessage: 'duckdash reacted to your message in nest'
        },
        {
          channelId: channelId1,
          dmId: -1,
          notificationMessage: 'chickmafia tagged you in nest: @chickmafia, hello'
        },
        {
          channelId: channelId1,
          dmId: -1,
          notificationMessage: 'duckdash added you to nest'
        }
      ]
    });
  });

  test('User tagged not apart of channel', () => {
    const registered3 = requestAuthRegister('adam@gmail.com', 'adam123', 'adam', 'baqaie');
    requestMessageSend(registered2.token, channelId1, '@adambaqaie hello mate');

    expect(requestNotificationsGet(registered3.token).body).toStrictEqual({ notifications: [] });
    expect(requestNotificationsGet(registered3.token).statusCode).toStrictEqual(200);
  });
});

describe('Error Cases', () => {
  test('Invalid token', () => {
    requestClear();
    expect(requestNotificationsGet('hello').body.error).toStrictEqual({ message: expect.any(String) });
    expect(requestNotificationsGet('hello').statusCode).toBe(403);
  });
});
