import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import { authRegisterV3, authLoginV3, authLogoutV2, authPasswordResetRequestV1, authPasswordResetResetV1 } from './auth';
import { dmCreateV2, dmLeaveV2, dmRemoveV2, dmDetailsV2, dmMessagesV2, dmListV2 } from './dm';
import { channelsListAllV3, channelsListV3, channelsCreateV3 } from './channels';
import { channelDetailsV3, channelLeaveV2, channelAddownerV2, channelInviteV3, channelJoinV3, channelRemoveOwnerV2, channelMessagesV3 } from './channel';
import { userProfileSethandleV2, userProfileSetemailV2, userProfileSetnameV2, usersAllV2, userProfileV3 } from './users';
import { messageSenddmV2, messageSendV2, messageEditV2, messageRemoveV2, messageSendLaterV1, messageSendLaterDmV1 } from './message';
import { messagePinV1, messageUnpinV1, messageReactV1, messageUnreactV1, messageShareV1 } from './message';
// import { messageUnpinV1 } from './messageUnpin';
// import { messageShareV1 } from './messageShare';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
// import { messageReactV1 } from './messageReact';
// import { messageUnreactV1 } from './messageUnreact';
import { clearV1 } from './other';
import { userRemove } from './userRemove';
import { searchV1 } from './search';
import { uploadPhoto } from './uploadphoto';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { notificationsGet } from './notifications';
import { PermissionChange } from './PermissionChange';
// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.get('/search/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;

  res.json(searchV1(token, queryStr));
});

app.post('/message/sendlater/v1', (req: Request, res: Response) => {
  const { channelId, message, timeSent } = req.body;
  const token = req.header('token');

  res.json(messageSendLaterV1(token, parseInt(channelId), message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response) => {
  const { dmId, message, timeSent } = req.body;
  const token = req.header('token');

  res.json(messageSendLaterDmV1(token, parseInt(dmId), message, timeSent));
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(messageSendV2(token, parseInt(channelId), message));
});

app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId, message } = req.body;

  res.json(messageSenddmV2(token, parseInt(dmId), message));
});

app.put('/message/edit/v2', (req: Request, res: Response) => {
  const { messageId, message } = req.body;
  const token = req.header('token');

  return res.json(messageEditV2(token, parseInt(messageId), message));
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);

  return res.json(messageRemoveV2(token, messageId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelAddownerV2(token, parseInt(channelId), parseInt(uId)));
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelLeaveV2(token, parseInt(channelId)));
});

app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV3(token, channelId));
});

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

app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  return res.json(authRegisterV3(email, password, nameFirst, nameLast));
});

app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;

  return res.json(authLoginV3(email, password));
});

app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  return res.json(authLogoutV2(token));
});

app.post('/dm/create/v2', (req: Request, res: Response) => {
  const { uIds } = req.body;
  const token = req.header('token') as string;

  return res.json(dmCreateV2(token, uIds));
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;

  return res.json(dmListV2(token));
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const dmId = req.query.dmId as string;
  const token = req.header('token') as string;

  return res.json(dmDetailsV2(token, parseInt(dmId)));
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const dmId = req.query.dmId as string;

  return res.json(dmRemoveV2(token, parseInt(dmId)));
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const { dmId } = req.body;
  const token = req.header('token') as string;

  return res.json(dmLeaveV2(token, parseInt(dmId)));
});

app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const dmId = req.query.dmId as string;
  const start = req.query.start as string;

  return res.json(dmMessagesV2(token, parseInt(dmId), parseInt(start)));
});

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const { name, isPublic } = req.body;
  const token = req.header('token') as string;

  return res.json(channelsCreateV3(token, name, Boolean(isPublic)));
});

app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;

  return res.json(channelsListV3(token));
});

app.get('/channels/listall/v3', (req: Request, res: Response) => {
  const token = req.header('token') as string;

  return res.json(channelsListAllV3(token));
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const handleStr = req.body.handleStr;
  return res.json(userProfileSethandleV2(token, handleStr));
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => { //
  const { email } = req.body;
  const token = req.header('token') as string;
  return res.json(userProfileSetemailV2(token, email));
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => { // everything about setname is fine... weird
  const { nameFirst, nameLast } = req.body;
  const token = req.header('token') as string;
  return res.json(userProfileSetnameV2(token, nameFirst, nameLast));
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  return res.json(usersAllV2(token));
});

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const uId = parseInt(req.query.uId as string);
  const token = req.header('token') as string;
  return res.json(userProfileV3(token, uId));
});

app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(notificationsGet(token));
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  return res.json(authPasswordResetRequestV1(email));
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  return res.json(clearV1());
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  return res.json(authPasswordResetResetV1(resetCode, newPassword));
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  return res.json(clearV1());
});

app.post('/standup/start/v1', (req: Request, res: Response) => {
  const { channelId, length } = req.body;
  const token = req.header('token');

  return res.json(standupStartV1(token, parseInt(channelId), parseInt(length)));
});

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const channelId = req.query.channelId as string;
  const token = req.header('token');

  return res.json(standupActiveV1(token, parseInt(channelId)));
});

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const { channelId, message } = req.body;
  const token = req.header('token');

  return res.json(standupSendV1(token, parseInt(channelId), message));
});
app.post('/message/pin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;

  res.json(messagePinV1(token, +messageId));
});
app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;

  res.json(messageUnpinV1(token, +messageId));
});

app.post('/message/share/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { ogMessageId, message, channelId, dmId } = req.body;

  res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  return res.json(PermissionChange(token, uId, permissionId));
});

app.post('/message/react/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;

  res.json(messageReactV1(token, +messageId, +reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;

  res.json(messageUnreactV1(token, +messageId, +reactId));
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const uId = req.query.uId as string;

  return res.json(userRemove(token, parseInt(uId)));
});

app.post('/user/profile/uploadphoto/v1', async (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  try {
    const result = await uploadPhoto(token, imgUrl, xStart, yStart, xEnd, yEnd);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.message);
  }
});
app.use('/static', express.static('src/static'));

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
