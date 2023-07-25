// SERVER
/*
app.post('/channel/join/v3', (req: Request, res: Response) => {
    const token = req.header('token');
    const { channelId } = req.body;

    return res.json(channelJoinV3(token, parseInt(channelId)));
  });

  app.post('/channel/invite/v3', (req: Request, res: Response) => {
    const token = req.header('token');
    const { channelId, uId } = req.body;

    return res.json(channelInviteV3(token, channelId, uId));
  });

  app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
    const token = req.header('token');
    const { channelId, uId } = req.body;
    return res.json(channelRemoveOwnerV2(token, channelId, uId));
  });

  app.get('/channel/messages/v3', (req: Request, res: Response) => {
    const token = req.header('token');
    const channelId = parseInt(req.query.channelId as string);
    const start = parseInt(req.query.start as string);
    return res.json(channelMessagesV3(token, channelId, start));
  });
  */

// --- WRAPPERS
/*
export function requestChannelJoin(token: string, channelId: number) {
    const res = request(
      'POST',
      `${url}:${port}/channel/join/v3`,
      {
        json: {
          channelId: channelId
        },
        headers: {
          token
        },
        timeout: 100
      }
    );

    return JSON.parse(res.getBody() as string);
  }

  export function requestChannelInvite(token: string, channelId: number, uId: number) {
    const res = request(
      'POST',
      `${url}:${port}/channel/invite/v3`,
      {
        json: {
          channelId: channelId,
          uId: uId
        },
        headers: {
          token
        },
        timeout: 100
      }
    );

    return JSON.parse(res.getBody() as string);
  }

  export function requestChannelRemoveOwner(token: string, channelId: number, uId: number) {
    const res = request(
      'POST',
      `${url}:${port}/channel/removeowner/v2`,
      {
        json: {
          channelId: channelId,
          uId: uId,
        },
        headers: {
          token
        },
        timeout: 100
      }
    );

    return JSON.parse(res.getBody() as string);
  }

  export function requestChannelMessages(token: string, channelId: number, start: number) {
    const res = request(
      'GET',
      `${url}:${port}/channel/messages/v3`,
      {
        qs: {
          channelId: channelId,
          start: start
        },
        headers: {
          token
        },
        timeout: 100
      }
    );

    return JSON.parse(res.getBody() as string);
  }
*/

// ---FUNCTIONS
/*
import HTTPError from 'http-errors'
import { getData, setData } from './dataStore';
import { isChannelIdValid, validateToken, isUserIdValid, getUIdFromToken, isOwner, getChannel, isMember, getUser, isOwnerByToken } from './helper';
import { user, channel, dataTs } from './interfaces';

export function channelJoinV3(token: string, channelId: number) {
  const data: dataTs = getData();

  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, "Invalid ChannelId");
  }
  if (!validateToken(token)) {
    throw HTTPError(403, "Invalid Token");
  }

  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);
  const authUserId: number = getUIdFromToken(token) as number;
  // checks if a non-global owner is joining a private channel

  const channel: channel = getChannel(channelId) as channel;
  if (!channel.isPublic && authUserId !== 1) {
    throw HTTPError(403, "Regular users cannot join private channels");;
  }

  if (isMember(channelId, authUserId) !== false) {
    throw HTTPError(400, "This user is already a member of this channel");
  }
  const userObj = getUser(authUserId);
  data.channels[channelIndex].allMembers.push(userObj);
  setData(data);
  return {};
}

export function channelInviteV3(token: string, channelId: number, uId: number) {
  const data: dataTs = getData();
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, "Invalid ChannelId");
  }

  if (!validateToken(token)) {
    throw HTTPError(403, "Invalid Token");
  }

  if (!isUserIdValid(uId)) {
    throw HTTPError(400, "Invalid uId");
  }

  // can safely assume authUserId is a number as token must be valid from above
  const authUserId: number = getUIdFromToken(token) as number;

  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);
  if (isMember(channelId, uId)) {
    throw HTTPError(400, "This user is already a member of this channel");;
  } else if (!isMember(channelId, authUserId)) {
    throw HTTPError(403, "This authorised user is not a member of this channel");;
  }

  // finally adds user to channel
  const userObj = getUser(uId);
  data.channels[channelIndex].allMembers.push(userObj);
  setData(data);
  return {};
}

export function channelRemoveOwnerV2(token: string, channelId: number, uId: number) {
  const data: dataTs = getData();
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, "Invalid ChannelId");
  }

  if (!validateToken(token)) {
    throw HTTPError(403, "Invalid Token");
  }

  if (!isUserIdValid(uId)) {
    throw HTTPError(400, "Invalid uId");
  }

  if (!isOwner(channelId, uId)) {
    throw HTTPError(400, "This user is not currently an owner");
  }

  const channel: channel = getChannel(channelId) as channel;
  if (channel.ownerMembers.length === 1) {
    throw HTTPError(400, "This user is the only owner in this channel");
  }

  const authUserId: number = getUIdFromToken(token) as number;
  if (!isOwner(channelId, authUserId) && (authUserId !== 1 || !isMember(channelId, 1))) {
    throw HTTPError(403, "This authUser does not have the correct owner permissions");
  }

  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);
  data.channels[channelIndex].ownerMembers = channel.ownerMembers.filter(owner => owner.uId !== uId);
  setData(data);
  return {};
}

export function channelMessagesV3(token: string, channelId: number, start: number) {
  const data: dataTs = getData();
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, "Invalid ChannelId");
  }

  if (!validateToken(token)) {
    throw HTTPError(403, "Invalid Token");
  }

  // can safely assume authUserId is a number as token must be valid from above
  const authUserId: number = getUIdFromToken(token) as number;

  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);
  const channel: channel = data.channels[channelIndex];
  const hasAuthUser: user = channel.allMembers.find(member => member.uId === authUserId);

  if (hasAuthUser === undefined && authUserId !== 1) {
    throw HTTPError(403, "This authUser is not a member of this channel");;
  }

  if (start > channel.messages.length) {
    throw HTTPError(400, "Start is greater than the total number of messages in this channel");
  }

  let end: number;
  let endrange: number;
  if (channel.messages.length > start + 50) {
    end = start + 50;
    endrange = end;
  } else {
    end = -1;
    endrange = channel.messages.length;
  }
  return {

    messages: channel.messages.reverse().slice(start, endrange),
    start: start,
    end: end

  };
}
*/

/* CHANNEL INVITE TEST
import { requestClear, requestAuthRegister, requestChannelsCreate, requestChannelInvite, requestChannelDetails } from '../wrappers';

describe('Members with different permissions inviting once', () => {
  let globalOwnerId: number;
  let globalOwnerToken: string;
  let authId2: number;
  let authToken2: string;
  let channelId2: number;
  let authId3: number;
  let authToken3: string;

  beforeEach(() => {
    requestClear();
    const globalOwner = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Adams');
    globalOwnerId = globalOwner.authUserId;
    globalOwnerToken = globalOwner.token;

    // authId2 is the Id of a regular user
    const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Biggums');
    authId2 = user2.authUserId;
    authToken2 = user2.token;

    // channel2 is a regular channel
    channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).channelId;
    const user3 = requestAuthRegister('chris@outlook.com', 'ccc123', 'Chris', 'Catman');
    authId3 = user3.authUserId;
    authToken3 = user3.token;
  });

  test('Global owner invites user to a channel they do not own', () => {
    expect(requestChannelInvite(globalOwnerToken, channelId2, authId3)).toEqual({});
    expect(requestChannelDetails(globalOwnerToken, channelId2)).toEqual({
      name: 'Channel 2',
      isPublic: true,
      ownerMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      },
      {
        uId: authId3,
        email: 'chris@outlook.com',
        nameFirst: 'Chris',
        nameLast: 'Catman',
        handleStr: expect.any(String),
      }],
    });
  });

  test('Regular owner invites global owner', () => {
    expect(requestChannelInvite(authToken2, channelId2, globalOwnerId)).toEqual({});
    expect(requestChannelDetails(authToken2, channelId2)).toEqual({
      name: 'Channel 2',
      isPublic: true,
      ownerMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      },
      {
        uId: globalOwnerId,
        email: 'anna@gmail.com',
        nameFirst: 'Anna',
        nameLast: 'Adams',
        handleStr: expect.any(String),
      }],
    });
  });

  test('Regular owner invites another regular user', () => {
    expect(requestChannelInvite(authToken2, channelId2, authId3)).toEqual({});
    expect(requestChannelDetails(authToken2, channelId2)).toEqual({
      name: 'Channel 2',
      isPublic: true,
      ownerMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      },
      {
        uId: authId3,
        email: 'chris@outlook.com',
        nameFirst: 'Chris',
        nameLast: 'Catman',
        handleStr: expect.any(String),
      }],
    });
  });

  test('Regular member invites others', () => {
    const authId4 = requestAuthRegister('dora@outlook.com', 'ddd123', 'Dora', 'DeeExplora').authUserId;

    expect(requestChannelInvite(authToken2, channelId2, authId3)).toEqual({});
    expect(requestChannelInvite(authToken3, channelId2, authId4)).toEqual({});
    expect(requestChannelDetails(authToken3, channelId2)).toEqual({
      name: 'Channel 2',
      isPublic: true,
      ownerMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      },
      {
        uId: authId3,
        email: 'chris@outlook.com',
        nameFirst: 'Chris',
        nameLast: 'Catman',
        handleStr: expect.any(String),
      },
      {
        uId: authId4,
        email: 'dora@outlook.com',
        nameFirst: 'Dora',
        nameLast: 'DeeExplora',
        handleStr: expect.any(String),
      }],
    });
  });
});

describe('ERRORS: Reinviting users', () => {
  let globalOwnerId: number;
  let authId2: number;
  let authToken2: string;
  let channelId2: number;
  let authId3: number;

  beforeEach(() => {
    requestClear();
    // note that globalOwnerToken is the first Id and hence a global owner
    globalOwnerId = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Adams').authUserId;
    // authId2 is the Id of a regular user
    const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Biggums');
    authId2 = user2.authUserId;
    authToken2 = user2.token;

    // channel2 is a regular channel
    channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).channelId;

    authId3 = requestAuthRegister('chris@outlook.com', 'ccc123', 'Chris', 'Catman').authUserId;
  });

  test('Owner reinvites themselves', () => {
    expect(requestChannelInvite(authToken2, channelId2, authId2).error).toEqual({ message: expect.any(String) });
    expect(requestChannelDetails(authToken2, channelId2)).toEqual({
      name: 'Channel 2',
      isPublic: true,
      ownerMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }]
    });
  });

  test('Owner reinvites another user', () => {
    expect(requestChannelInvite(authToken2, channelId2, authId3)).toEqual({});
    expect(requestChannelInvite(authToken2, channelId2, authId3).error).toEqual({ message: expect.any(String) });
    expect(requestChannelDetails(authToken2, channelId2)).toEqual({
      name: 'Channel 2',
      isPublic: true,
      ownerMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      },
      {
        uId: authId3,
        email: 'chris@outlook.com',
        nameFirst: 'Chris',
        nameLast: 'Catman',
        handleStr: expect.any(String),
      }],
    });
    expect(requestChannelInvite(authToken2, channelId2, globalOwnerId)).toEqual({});
  });
});

describe('Miscallaneous errors', () => {
  let globalOwnerId: number;
  let authId2: number;
  let authToken2: string;
  let channelId2: number;
  let authId3: number;
  let authToken3: string;

  beforeEach(() => {
    requestClear();
    // note that globalOwnerToken is the first Id and hence a global owner
    globalOwnerId = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Adams').authUserId;
    // authId2 is the Id of a regular user
    const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Biggums');
    authId2 = user2.authUserId;
    authToken2 = user2.token;

    // channel2 is a regular channel
    channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).channelId;

    const user3 = requestAuthRegister('chris@outlook.com', 'ccc123', 'Chris', 'Catman');
    authId3 = user3.authUserId;
    authToken3 = user3.token;
  });

  test('Invalid Channel Id', () => {
    requestClear();
    expect(requestChannelInvite(authToken3, channelId2 + 1, authId3).error).toEqual({ message: expect.any(String) });
  })
  test('Valid channel Id but user not a member', () => {
    expect(requestChannelInvite(authToken3, channelId2, globalOwnerId).error).toEqual({ message: expect.any(String) });
  })
  test('InvalId UserId', () => {
    expect(requestChannelInvite(authToken2, channelId2, (authId2 + authId3) / 2).error).toEqual({ message: expect.any(String) });
  })
  test('InvalId token', () => {
    requestClear();
    expect(requestChannelInvite('abc', channelId2, authId2).error).toEqual({ message: expect.any(String) });
  })
});
*/

/*
import { requestAuthRegister, requestChannelDetails, requestChannelsCreate, requestClear, requestChannelJoin } from '../wrappers';

describe('Valid joining sequences', () => {
  let globalOwnerId: number;
  let globalOwnerToken: string;
  let regularOwnerId: number;
  let regularOwnerToken: string;
  let publicChannelId: number;
  let privateChannelId: number;
  let regularUserId: number;
  let regularUserToken: string;

  beforeEach(() => {
    requestClear();
    const globalOwner = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Adams');
    globalOwnerId = globalOwner.authUserId;
    globalOwnerToken = globalOwner.token;

    const regularOwner = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Biggums');
    regularOwnerId = regularOwner.authUserId;
    regularOwnerToken = regularOwner.token;

    publicChannelId = requestChannelsCreate(regularOwnerToken, 'Public Channel', true).channelId;
    privateChannelId = requestChannelsCreate(regularOwnerToken, 'Private Channel', false).channelId;

    const regularUser = requestAuthRegister('chris@outlook.com', 'ccc123', 'Chris', 'Catman');
    regularUserId = regularUser.authUserId;
    regularUserToken = regularUser.token;
  });

  test('Global owner joins private channel', () => {
    expect(requestChannelJoin(globalOwnerToken, privateChannelId)).toEqual({});
    expect(requestChannelDetails(globalOwnerToken, privateChannelId)).toEqual({
      name: 'Private Channel',
      isPublic: false,
      ownerMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      },
      {
        uId: globalOwnerId,
        email: 'anna@gmail.com',
        nameFirst: 'Anna',
        nameLast: 'Adams',
        handleStr: expect.any(String),
      }]
    });
  });

  test('Regular user joins public channel', () => {
    expect(requestChannelJoin(regularUserToken, publicChannelId)).toEqual({});
    expect(requestChannelDetails(regularUserToken, publicChannelId)).toEqual({
      name: 'Public Channel',
      isPublic: true,
      ownerMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      },
      {
        uId: regularUserId,
        email: 'chris@outlook.com',
        nameFirst: 'Chris',
        nameLast: 'Catman',
        handleStr: expect.any(String),
      }]
    });
  });
});

describe('InvalId joining sequences', () => {
  let globalOwnerToken: string;
  let regularOwnerId: number;
  let regularOwnerToken: string;
  let publicChannelId: number;
  let privateChannelId: number;
  let regularUserId: number;
  let regularUserToken: string;

  beforeEach(() => {
    requestClear();
    globalOwnerToken = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Adams').token;

    const regularOwner = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Biggums');
    regularOwnerId = regularOwner.authUserId;
    regularOwnerToken = regularOwner.token;

    publicChannelId = requestChannelsCreate(regularOwnerToken, 'Public Channel', true).channelId;
    privateChannelId = requestChannelsCreate(regularOwnerToken, 'Private Channel', false).channelId;

    const regularUser = requestAuthRegister('chris@outlook.com', 'ccc123', 'Chris', 'Catman');
    regularUserId = regularUser.authUserId;
    regularUserToken = regularUser.token;
  });

  test('Regular user joins private channel', () => {
    expect(requestChannelJoin(globalOwnerToken, publicChannelId)).toEqual({});
    expect(requestChannelJoin(regularUserToken, privateChannelId).error).toEqual({ message: expect.any(String) });
    expect(requestChannelDetails(regularOwnerToken, privateChannelId)).toEqual({
      name: 'Private Channel',
      isPublic: false,
      ownerMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }]
    });
  });

  test('Regular user joins multiple times', () => {
    expect(requestChannelJoin(regularUserToken, publicChannelId)).toEqual({});
    expect(requestChannelJoin(regularUserToken, publicChannelId).error).toEqual({ message: expect.any(String) });
    expect(requestChannelDetails(regularUserToken, publicChannelId)).toEqual({
      name: 'Public Channel',
      isPublic: true,
      ownerMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      },
      {
        uId: regularUserId,
        email: 'chris@outlook.com',
        nameFirst: 'Chris',
        nameLast: 'Catman',
        handleStr: expect.any(String),
      }]
    });
  });

  test('Owner rejoins channel', () => {
    expect(requestChannelJoin(regularOwnerToken, publicChannelId).error).toEqual({ message: expect.any(String) });
    expect(requestChannelDetails(regularOwnerToken, publicChannelId)).toEqual({
      name: 'Public Channel',
      isPublic: true,
      ownerMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
    });
  });

  test('InvalId userId', () => {
    expect(requestChannelJoin('abc', publicChannelId).error).toEqual({ message: expect.any(String) });
    expect(requestChannelDetails(regularOwnerToken, publicChannelId)).toEqual({
      name: 'Public Channel',
      isPublic: true,
      ownerMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }]
    });
  });

  test('InvalId channelId', () => {
    expect(requestChannelJoin(regularUserToken, publicChannelId + +privateChannelId + 1).error).toEqual({ message: expect.any(String) });
    expect(requestChannelDetails(regularOwnerToken, publicChannelId)).toEqual({
      name: 'Public Channel',
      isPublic: true,
      ownerMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: regularOwnerId,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Biggums',
        handleStr: expect.any(String),
      }]
    });
  });
});
*/

/*
import { requestAuthRegister, requestClear, requestChannelsCreate, requestChannelMessages, requestMessageSend } from '../wrappers';
import { messages } from '../interfaces';

describe('Incorrect input', () => {
  let authToken1: string;
  let authToken2: string;
  let authToken3: string;
  let channelId1: number;
  let channelId2: number;
  let channelId3: number;

  beforeEach(() => {
    requestClear();
    authToken1 = requestAuthRegister('gura@gmail.com', '114514810', 'huaizhi', 'li').token;
    authToken2 = requestAuthRegister('Ina@outlook.com', 'asdgf8', 'me', 'vasdui').token;
    authToken3 = requestAuthRegister('ichiru@qq.com', 'asduif8195', 'ichiru', 'shirase').token;

    channelId1 = requestChannelsCreate(authToken1, 'Channel 1', true).channelId;
    channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).channelId;
    channelId3 = requestChannelsCreate(authToken3, 'Channel 3', false).channelId;
  });
  test('Invalid token', () => {
    // concatenates all token strings together, to guarantee an invalid token
    expect(requestChannelMessages(authToken1 + authToken2 + authToken3, channelId1, 0).error).toEqual({ message: expect.any(String) });
  });
  test('Start that greater than the total number of messages', () => {
    expect(requestChannelMessages(authToken1, channelId1, 250).error).toEqual({ message: expect.any(String) });
  });
  test('Invalid channelId', () => {
    expect(requestChannelMessages(authToken1, channelId1 + channelId2 + channelId3, 0).error).toEqual({ message: expect.any(String) });
  });
  test('ChannelId is valid but the authorised user is not a member of the channel', () => {
    expect(requestChannelMessages(authToken1, channelId1 + channelId2 + channelId3, 0).error).toEqual({ message: expect.any(String) });
  });
  test('Invalid channelId and token ', () => {
    expect(requestChannelMessages(authToken1 + authToken2 + authToken3, channelId1 + channelId2 + channelId3, 0).error).toEqual({ message: expect.any(String) });
  });
});

describe('Correct input', () => {
  let authToken1: string;
  let authId1: number;
  let authToken2: string;
  let authId2: number;
  let authToken3: string;
  let authId3: number;
  let channelId1: number;
  let channelId2: number;
  let channelId3: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestAuthRegister('gura@gmail.com', '114514810', 'huaizhi', 'li');
    authToken1 = user1.token;
    authId1 = user1.authUserId;
    const user2 = requestAuthRegister('Ina@outlook.com', 'asdgf8', 'me', 'vasdui');
    authToken2 = user2.token;
    authId2 = user2.authUserId;
    const user3 = requestAuthRegister('ichiru@qq.com', 'asduif8195', 'ichiru', 'shirase');
    authToken3 = user3.token;
    authId3 = user3.authUserId;

    channelId1 = requestChannelsCreate(authToken1, 'Channel 1', true).channelId;
    channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).channelId;
    channelId3 = requestChannelsCreate(authToken3, 'Channel 3', false).channelId;
  });

  test('No messages sent', () => {
    expect(requestChannelMessages(authToken3, channelId3, 0)).toEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('Single Message', () => {
    const messageId: number = requestMessageSend(authToken3, channelId3, 'My first message!').messageId;
    expect(requestChannelMessages(authToken3, channelId3, 0)).toEqual({
      messages: [{
        messageId: messageId,
        uId: authId3,
        message: 'My first message!',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
  });

  test('Start is not at index 0', () => {
    const messageId1 = requestMessageSend(authToken2, channelId2, 'My first message!').messageId;
    const messageId2 = requestMessageSend(authToken2, channelId2, 'My second message!').messageId;
    requestMessageSend(authToken2, channelId2, 'My third message!');
    expect(requestChannelMessages(authToken2, channelId2, 1)).toEqual({
      messages: [{
        messageId: messageId2,
        uId: authId2,
        message: 'My second message!',
        timeSent: expect.any(Number)
      },
      {
        messageId: messageId1,
        uId: authId2,
        message: 'My first message!',
        timeSent: expect.any(Number)
      }],
      start: 1,
      end: -1
    });
  });

  test('Over 50 messages', () => {
    // generates 50 messages and pushes to an array: ['0', '1', '2', etc...]
    const messages: messages[] = [];
    for (let i = 0; i < 55; i++) {
      const currentMessage = i.toString();
      const messageId: number = requestMessageSend(authToken1, channelId1, currentMessage).messageId;

      messages.push({
        messageId: messageId,
        uId: authId1,
        message: currentMessage,
        timeSent: expect.any(Number)
      });
    }

    expect(requestChannelMessages(authToken1, channelId1, 0)).toEqual({
      messages: messages.reverse().slice(0, 50),
      start: 0,
      end: 50
    });
  });
});
*/

/* REMOVE OWNER
import { requestAuthRegister, requestClear, requestChannelsCreate, requestChannelAddowner, requestChannelJoin, requestChannelRemoveOwner, requestChannelDetails } from '../wrappers';

describe('Valid Inputs', () => {
  let authId1: number;
  let authId2: number;
  let authId3: number;
  let authToken1: string;
  let authToken2: string;
  let authToken3: string;
  let channelId1: number;
  let channelId2: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Albert');
    authId1 = user1.authUserId;
    authToken1 = user1.token;

    const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Baqaie');
    authId2 = user2.authUserId;
    authToken2 = user2.token;

    const user3 = requestAuthRegister('claire@gmail.com', 'ccc123', 'Claire', 'Christopher');
    authId3 = user3.authUserId;
    authToken3 = user3.token;

    channelId1 = requestChannelsCreate(authToken1, 'Channel 1', true).channelId;
    requestChannelJoin(authToken2, channelId1);
    requestChannelAddowner(authToken1, channelId1, authId2);

    channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).channelId;
    requestChannelJoin(authToken3, channelId2);
    // Channel1: [Owners: authId1, authId2], [Members: authId1, authId2]
    // Channel2: [Owners: authId2], [Members: authId2, authId3]
  });

  test('Owner removes self', () => {
    expect(requestChannelRemoveOwner(authToken2, channelId1, authId2)).toEqual({});
    expect(requestChannelDetails(authToken1, channelId1)).toEqual({
      name: 'Channel 1',
      isPublic: true,
      ownerMembers: [{
        uId: authId1,
        email: 'anna@gmail.com',
        nameFirst: 'Anna',
        nameLast: 'Albert',
        handleStr: expect.any(String),
      },
      ],
      allMembers: [{
        uId: authId1,
        email: 'anna@gmail.com',
        nameFirst: 'Anna',
        nameLast: 'Albert',
        handleStr: expect.any(String),
      },
      {
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Baqaie',
        handleStr: expect.any(String),
      },
      ]
    });
  });

  test('Global owner removes another in a channel they are not in', () => {
    requestChannelAddowner(authToken2, channelId2, authId3);
    expect(requestChannelRemoveOwner(authToken1, channelId2, authId2)).toEqual({});
    expect(requestChannelDetails(authToken1, channelId2)).toEqual({
      name: 'Channel 2',
      isPublic: true,
      ownerMembers: [
        {
          uId: authId3,
          email: 'claire@gmail.com',
          nameFirst: 'Claire',
          nameLast: 'Christopher',
          handleStr: expect.any(String),
        },
      ],
      allMembers: [
        {
          uId: authId2,
          email: 'bob@outlook.com',
          nameFirst: 'Bob',
          nameLast: 'Baqaie',
          handleStr: expect.any(String),
        },
        {
          uId: authId3,
          email: 'claire@gmail.com',
          nameFirst: 'Claire',
          nameLast: 'Christopher',
          handleStr: expect.any(String),
        }]
    });
  });

  test('Owner removes other', () => {
    expect(requestChannelRemoveOwner(authToken1, channelId1, authId2)).toEqual({});
    expect(requestChannelDetails(authToken1, channelId1)).toEqual({
      name: 'Channel 1',
      isPublic: true,
      ownerMembers: [{
        uId: authId1,
        email: 'anna@gmail.com',
        nameFirst: 'Anna',
        nameLast: 'Albert',
        handleStr: expect.any(String),
      },
      ],
      allMembers: [{
        uId: authId1,
        email: 'anna@gmail.com',
        nameFirst: 'Anna',
        nameLast: 'Albert',
        handleStr: expect.any(String),
      },
      {
        uId: authId2,
        email: 'bob@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Baqaie',
        handleStr: expect.any(String),
      },
      ]
    });
  });

  describe('Invalid Inputs', () => {
    let authId1: number;
    let authId2: number;
    let authId3: number;
    let authToken1: string;
    let authToken2: string;
    let authToken3: string;
    let channelId1: number;
    let channelId2: number;

    beforeEach(() => {
      requestClear();
      const user1 = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Albert');
      authId1 = user1.authUserId;
      authToken1 = user1.token;

      const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Baqaie');
      authId2 = user2.authUserId;
      authToken2 = user2.token;

      const user3 = requestAuthRegister('claire@gmail.com', 'ccc123', 'Claire', 'Christopher');
      authId3 = user3.authUserId;
      authToken3 = user3.token;

      channelId1 = requestChannelsCreate(authToken1, 'Channel 1', true).channelId;
      requestChannelJoin(authToken2, channelId1);
      requestChannelAddowner(authToken1, channelId1, authId2);
      requestChannelJoin(authToken3, channelId1);

      channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).channelId;
      requestChannelJoin(authToken3, channelId2);
    // Channel1: [Owners: authId1, authId2], [Members: authId1, authId2, authId3]
    // Channel2: [Owners: authId2], [Members: authId2, authId3]
    });

    test('Invalid channelId', () => {
      expect(requestChannelRemoveOwner(authToken1, (channelId1 ** 2 + channelId2 ** 2) / 2, authId2).error).toEqual({ message: expect.any(String) });
    });

    test('Invalid uId', () => {
      expect(requestChannelRemoveOwner(authToken1, channelId1, authId1 ** 2 + authId2 ** 2 + authId3 ** 2).error).toEqual({ message: expect.any(String) });
    });

    test('uId is not already an owner', () => {
      expect(requestChannelRemoveOwner(authToken1, channelId1, authId3).error).toEqual({ message: expect.any(String) });
    });

    test('uId is the only owner', () => {
      expect(requestChannelRemoveOwner(authToken2, channelId2, authId2).error).toEqual({ message: expect.any(String) });
    });

    test('Valid channelId but authUser does not have owner permissions', () => {
      expect(requestChannelRemoveOwner(authToken3, channelId1, authId2).error).toEqual({ message: expect.any(String) });
    });

    test('Invalid token', () => {
      expect(requestChannelRemoveOwner(authToken1 + authToken2 + authToken3, channelId1, 0).error).toEqual({ message: expect.any(String) });
    });
  });
});
*/
