import { requestAuthRegister, requestClear, requestUploadPhoto } from '../wrappers';
const jpgImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Panda_Cub_from_Wolong%2C_Sichuan%2C_China.JPG/330px-Panda_Cub_from_Wolong%2C_Sichuan%2C_China.JPG';
const NGGUP = 'http://i1.kym-cdn.com/photos/images/original/000/377/946/0b9.jpg';
const cat = 'https://en.wikipedia.org/wiki/Cat#/media/File:Cat_August_2010-4.jpg';
const dog = 'https://en.wikipedia.org/wiki/Dog#/media/File:Brooks_Chase_Ranger_of_Jolly_Dogs_Jack_Russell.jpg'
// afterAll(() => {
//   requestClear();
// });
const tokenA = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash').token;
describe('uploadPhoto', () => {
  test('return 200 status code, return value is {}',  () => {
    requestClear();
    let tokenA = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash').token;
    const imgUrl = jpgImage;
    const xStart = 50;
    const yStart = 0;
    const xEnd = 300;
    const yEnd = 200;

    const { body, statusCode } = requestUploadPhoto(tokenA, imgUrl, xStart, yStart, xEnd, yEnd);

    expect(statusCode).toBe(200);
    expect(body).toEqual({});
  });
  // test('should throw 400 error if image cannot be retrieved',() => {
  //   requestClear();
    
  //   const tokenA = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash').token;
  //   const imgUrl = 'http://abcatsaidsufnuyasdif.com/non-existing-image.jpg';
  //   const xStart = 0;
  //   const yStart = 0;
  //   const xEnd = 100;
  //   const yEnd = 100;

  //   const { statusCode } = requestUploadPhoto(tokenA, imgUrl, xStart, yStart, xEnd, yEnd);

  //   expect(statusCode).toBe(400);
  // });
  test('invalid token',  () => {
    requestClear();
    const result = requestUploadPhoto(tokenA + 'C', NGGUP, 0, 0, 500, 200);
    expect(result.statusCode).toBe(403);
  });

  test('bound has negative value',  () => {
    requestClear();
    const tokenA = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash').token;
    const result = requestUploadPhoto(tokenA, cat, 0, -1, 500, 200);
    expect(result.statusCode).toBe(400);
  });

  test(' start value greater than end value',  () => {
    requestClear();
    const tokenA = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash').token;
    const result = requestUploadPhoto(tokenA, dog, 500, 0, 200, 200);
    expect(result.statusCode).toBe(400);
  });
  

  test('should throw 400 error if image file format is not JPEG', async () => {
    requestClear();
    const tokenA = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash').token;
    const imgUrl = 'http://example.com/image.png';
    const xStart = 0;
    const yStart = 0;
    const xEnd = 100;
    const yEnd = 100;

    const { statusCode } = requestUploadPhoto(tokenA, imgUrl, xStart, yStart, xEnd, yEnd);

    expect(statusCode).toBe(400);
  });

  test('should throw 400 error if crop bounds are invalid', async () => {
    requestClear();
    const tokenA = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash').token;
    const imgUrl = dog;
    const xStart = -1;
    const yStart = 0;
    const xEnd = 100;
    const yEnd = 100;

    const { statusCode } = requestUploadPhoto(tokenA, imgUrl, xStart, yStart, xEnd, yEnd);

    expect(statusCode).toBe(400);
  })
});
