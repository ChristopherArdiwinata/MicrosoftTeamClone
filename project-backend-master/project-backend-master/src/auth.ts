import { getData, setData } from './dataStore';
import validator from 'validator';
import { users, authUserId, error } from './interfaces';
import HTTPError from 'http-errors';
import { encrypt, findPassword, hashToken, userIndexToken } from './helper';
import nodemailer from 'nodemailer';

/**
 * Summary: Registers a user returning their unique Id
 *
 * Description:
 * This function accepts arguments that are details of a user and register his
 * details and then returns his unique Id. The way they are registered is first
 * making sure the inputs are valid, second storing their information in an object
 * inside of an array called users.
 * Amongst the inofrmation stored are two new fields. The userId and handleStr. The
 * userId is uniquely generated then the handleStr is made concatenating the first name
 * and last name.
 * Finally the userId is returned
 *
 * @param {string} email - Email address of the user
 * @param {string} password - password of the user
 * @param {string} nameFirst - first name of the user
 * @param {string} nameLast - last name of the user
 * @method POST
 * @returns {authUserId: Number} authUserId - Unqiue ID of the user created
 * @returns {error: 'string'} Error Message - Error message describing the error cause
 **/

function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string): authUserId | error {
  const data = getData();

  // Error Block
  const found = data.users.find(element => element.email === email);
  if (!(validator.isEmail(email))) {
    throw HTTPError(400, 'Invalid Email');
  } else if (found !== undefined) {
    throw HTTPError(400, 'Email in use');
  } else if (password.length < 6) {
    throw HTTPError(400, 'Password too short');
  } else if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'Incorrect nameFirst length');
  } else if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Incorrect nameLast length');
  }

  // Create handleStr
  let nameConcats = nameFirst.toLowerCase() + nameLast.toLowerCase();

  const regex = /[^a-z0-9]/g;
  // Remove all non-alphanumeric characters and convert to lowercase
  nameConcats = nameConcats.replace(regex, '').toLowerCase();

  if (nameConcats.length > 20) {
    nameConcats = nameConcats.slice(0, 20);
  }

  let nameConcat = nameConcats;

  // Check for duplicate and if found add numbers till unique
  let foundHandle = data.users.find(element => element.handleStr === nameConcats);
  for (let i = 0; foundHandle !== undefined; i++) {
    nameConcat = nameConcats + i;
    foundHandle = data.users.find(element => element.handleStr === nameConcat);
  }

  // Assign appropriate authId number and permissionId number
  let Id: number = data.users.length + 1;
  let permissionId = 2;
  if (data.users.length === 0) {
    Id = 1;
    permissionId = 1;
  } else if (data.users.length > 0) {
    Id = data.users[data.users.length - 1].uId + 1;
    permissionId = 2;
  }

  // Encrypt password
  const pass = encrypt(password);

  // Hash token
  const hashedToken = hashToken(nameConcat);
  const defaultImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Panda_Cub_from_Wolong%2C_Sichuan%2C_China.JPG/330px-Panda_Cub_from_Wolong%2C_Sichuan%2C_China.JPG';
  const user: users = {
    uId: Id,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: nameConcat,
    password: pass,
    token: [hashedToken],
    notifications: [],
    resetCode: 'NO',
    permissionId: permissionId,
    profileImgUrl: defaultImg
  };

  data.users.push(user);

  setData(data);

  return {
    token: nameConcat,
    authUserId: Id,
  };
}

/**
 * Summary: Logs a user in and returns their userId
 *
 * Descritpion: This function accepts the email and password of the user. It checks
 * that the user exists and then proceeds to return the userId of the user if their
 * email and password match up together.
 *
 * @param {string} email - Email address of the user
 * @param {string} password - password of the user
 *
 * @method POST
 * @returns {authUserId: Number} authUserId - Unqiue ID of the user created
 * @returns {error: 'string'} Error Message - Error message describing the error caus
 */
function authLoginV3(email: string, password: string): authUserId | error {
  const data = getData();

  // Error Block & find Object with details
  const found = data.users.find(element => element.email === email);
  const indexUser = data.users.findIndex(element => element.email === email);

  const foundPass = findPassword(password);
  if (found === undefined) {
    throw HTTPError(400, 'Email does not belong to a user');
  } else if (foundPass === false) {
    throw HTTPError(400, 'Password Incorrect');
  }

  const randNum = Math.floor(Math.random() * Date.now());
  const randToken = randNum.toString();

  // let foundToken = data.users.find(element => element.token.find(element => element === randToken))
  const hashedToken = hashToken(randToken);

  data.users[indexUser].token.push(hashedToken);

  setData(data);

  // Hash the token and return it

  return {
    token: randToken,
    authUserId: found.uId,
  };
}

/**
 * Logs out a user based on their token
 * @param {string} token - The token of the user to be logged out
 * @returns {Object} - An empty object upon successful logout
 * @method POST
 */
function authLogoutV2(token: string) {
  const data = getData();

  const userIndex = userIndexToken(token);

  if (userIndex !== -1) {
    const tokenIndex = data.users[userIndex].token.findIndex(element => element === hashToken(token));
    data.users[userIndex].token.splice(tokenIndex, 1);
    setData(data);
  } else {
    throw HTTPError(403, 'Incorrect token');
  }

  return {};
}

/**
 * Sends a password reset request email to the specified email address
 * @param {string} email - The email address to send the password reset request to
 * @returns {Object} - An empty object upon successful email sending
 * @method POST
 */
function authPasswordResetRequestV1(email: string) {
  const data = getData();
  // Generate reset code
  const resetCode = (Math.floor(Math.random() * Date.now())).toString();

  const userIndex = data.users.findIndex(element => element.email === email);

  if (userIndex !== -1) {
    data.users[userIndex].resetCode = resetCode;
    data.users[userIndex].token = [];
    setData(data);
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: 'ilyas.baqaie@gmail.com',
      pass: 'mayDqTZ8MILExjbQ',
    },
  });

  const mailOptions = {
    from: 'ilyas.baqaie@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Here is your key to reset your password: ${resetCode}`
  };

  transporter.sendMail(mailOptions);

  return {};
}

/**
 * Resets a user's password based on the reset code and new password provided
 * @param {string} resetCode - The reset code provided in the password reset email
 * @param {string} newPassword - The new password for the user
 * @returns {Object} - An empty object upon successful password reset
 * @method POST
 */
function authPasswordResetResetV1(resetCode: string, newPassword: string) {
  const data = getData();
  const userIndex = data.users.findIndex(element => element.resetCode === resetCode);

  if (userIndex === -1) {
    throw HTTPError(400, 'Invalid reset code');
  }

  if (newPassword.length < 6) {
    throw HTTPError(400, 'Password is too short (6 or more characters)');
  }

  data.users[userIndex].password = encrypt(newPassword);
  data.users[userIndex].resetCode = 'NO';
  setData(data);

  return {};
}

export { authRegisterV3, authLoginV3, authLogoutV2, authPasswordResetRequestV1, authPasswordResetResetV1 };
