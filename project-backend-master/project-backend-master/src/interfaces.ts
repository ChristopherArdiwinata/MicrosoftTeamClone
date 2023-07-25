interface password {
    iv: string,
    encryptedData: string
}

interface notifications {
    channelId: number,
    dmId: number,
    notificationMessage: string
}

interface users {
    uId: number,
    email: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string,
    password: password,
    token: string[],
    notifications: notifications[],
    resetCode: string,
    permissionId: number,
    profileImgUrl: string
}

interface user {
    uId: number,
    email: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string,
}

// interface messages {
//     messageId: number,
//     uId: number,
//     message: string,
//     timeSent: number
// }

interface messages {
    messageId: number,
    uId: number,
    message: string,
    timeSent: number,
    reacts: [{
        reactId: 1,
        uIds: number[],
        // isThisUserReacted?: boolean
    }],
    isPinned: boolean
}
interface channels {
    channelId: number
    name: string
}

interface standup {
    standupMessage: string,
    isActive: boolean,
    timeFinish: number,
    authUserId: number
}

interface channel {
    channelId: number
    name: string
    isPublic: boolean
    ownerMembers: user[]
    allMembers: user[]
    messages: messages[]
    standup?: standup
}

type dmId = { dmId: number }

interface dms {
    dmId: number,
    name: string,
    creator: user,
    members: user[]
    messages: messages[]
}

interface dmsOutput {
    dmId: number,
    name: string,
}

interface dmDetails {
    name: string,
    members: user[],
}

interface dmMessages {
    messages: messages[],
    start: number,
    end: number
}
interface dataTs {
    users: users[]
    channels: channel[]
    dms: dms[]
    deletedUsers: users[]
}

type timeFinish = { timeFinish: number };

type standupActive = { isActive: boolean, timeFinish: number };

type authUserId = { token: string, authUserId: number };

type error = { error: string };

type channelId = { channelId: number }

type messageId = { messageId: number }

export {
  users, channels, user, messages, dataTs, authUserId, error, channel,
  dmMessages, dmDetails, dmsOutput, dmId, dms, channelId, password, standup,
  timeFinish, standupActive, notifications, messageId
};
