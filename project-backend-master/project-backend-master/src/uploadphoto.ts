import HTTPError from 'http-errors';
import createError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';
import Jimp from 'jimp';
import { validateToken, userIndexToken } from './helper';
import { getData, setData } from './dataStore';
import config from './config.json';

export async function uploadPhoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  // Make sure the URL is not using https
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (xStart < 0 || yStart < 0 || xEnd < 0 || yEnd < 0) {
    throw HTTPError(400, 'Invalid crop bounds');
  }

  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'Invalid crop bounds');
  }
  // Download the image from the URL
  const response = request('GET', imgUrl);
  if (response.statusCode !== 200) {
    throw createError(400, 'Error retrieving image from URL');
  }

  const body = response.getBody();
  const filename = `src/static/${Date.now().toString()}-avatar.jpg`;
  fs.writeFileSync(filename, body, { flag: 'w' });

  // Load the image with Jimp
  const image = await Jimp.read(filename);
  if (!image) {
    throw HTTPError(400, 'Error loading image file');
  }

  // Get the dimensions of the image
  const { width, height } = await image;

  // Check that the crop bounds are within the image dimensions
  if (xStart >= width || yStart >= height || xEnd >= width || yEnd >= height) {
    throw HTTPError(400, 'Invalid crop bounds');
  }

  // Check that xEnd is greater than xStart and yEnd is greater than yStart

  // Check that the file is a JPEG
  const fileFormat = await Jimp.MIME_JPEG;
  if (image.getMIME() !== fileFormat) {
    throw HTTPError(400, 'Invalid file format');
  }

  // Crop the image and save it as a new file with a unique name
  const newFilename = `src/static/${Date.now().toString()}-cropped.jpg`;
  image.crop(xStart, yStart, xEnd - xStart, yEnd - yStart).writeAsync(newFilename);

  // Generate a new URL for the cropped image
  const url = `${config.url}:${config.port}/static/${newFilename}`;

  const data = getData();
  const userIndex = userIndexToken(token);
  data.users[userIndex].profileImgUrl = url;
  setData(data);

  return {};
}
