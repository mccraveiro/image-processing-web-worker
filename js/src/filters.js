const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

function wrap(value, max) {
  if (value < 0) {
    return value + max;
  } else if (value >= max) {
    return value - max;
  }
  return value;
}

function ImageToArray(image) {
  canvas.height = image.height;
  canvas.width = image.width;
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, image.width, image.height);
  return imageData.data;
}

function ArrayToImage(data, height, width) {
  let image = new Image();
  let imgdata = new ImageData(data, width, height);
  canvas.height = height;
  canvas.width = width;
  context.putImageData(imgdata, 0, 0);
  image.src = canvas.toDataURL();
  return image;
}

export function Grayscale(image) {
  let i, imageData, average;
  imageData = ImageToArray(image);

  for (i = 0; i < imageData.length; i += 4) {
    average = imageData[i] + imageData[i + 1] + imageData[i + 2];
    average = Math.round(average / 3);

    imageData[i] = average;
    imageData[i + 1] = average;
    imageData[i + 2] = average;
  }

  return ArrayToImage(imageData, image.height, image.width);
}

export function MeanBlur(image) {
  let imageData = ImageToArray(image);
  let length = imageData.length;
  let result = new Uint8ClampedArray(length);
  let i, average;

  for (i = 0; i < length; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += imageData[wrap(i - (image.width + 1) * 4, length)];
    average += imageData[wrap(i - (image.width) * 4, length)];
    average += imageData[wrap(i - (image.width - 1) * 4, length)];
    average += imageData[wrap(i - 4, length)];
    average += imageData[wrap(i, length)];
    average += imageData[wrap(i + 4, length)];
    average += imageData[wrap(i + (image.width - 1) * 4, length)];
    average += imageData[wrap(i + (image.width) * 4, length)];
    average += imageData[wrap(i + (image.width + 1) * 4, length)];

    average = Math.round(average / 9);

    result[i] = average;
  }

  return ArrayToImage(result, image.height, image.width);
}

export function GaussianBlur(image) {
  let imageData = ImageToArray(image);
  let length = imageData.length;
  let result = new Uint8ClampedArray(length);
  let i, average;

  let kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];

  for (i = 0; i < length; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += kernel[0] * imageData[wrap(i - (image.width + 1) * 4, length)];
    average += kernel[1] * imageData[wrap(i - (image.width) * 4, length)];
    average += kernel[2] * imageData[wrap(i - (image.width - 1) * 4, length)];
    average += kernel[3] * imageData[wrap(i - 4, length)];
    average += kernel[4] * imageData[wrap(i, length)];
    average += kernel[5] * imageData[wrap(i + 4, length)];
    average += kernel[6] * imageData[wrap(i + (image.width - 1) * 4, length)];
    average += kernel[7] * imageData[wrap(i + (image.width) * 4, length)];
    average += kernel[8] * imageData[wrap(i + (image.width + 1) * 4, length)];

    average = Math.round(average / 16);

    result[i] = average;
  }

  return ArrayToImage(result, image.height, image.width);
}

export function DetectEdges(image) {
  let imageData = ImageToArray(image);
  let length = imageData.length;
  let resultHorizontal = new Uint8ClampedArray(length);
  let resultVertical = new Uint8ClampedArray(length);
  let result = new Uint8ClampedArray(length);
  let i, average;

  let horizontalKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  let verticalKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (i = 0; i < length; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += horizontalKernel[0] * imageData[wrap(i - (image.width + 1) * 4, length)];
    average += horizontalKernel[1] * imageData[wrap(i - (image.width) * 4, length)];
    average += horizontalKernel[2] * imageData[wrap(i - (image.width - 1) * 4, length)];
    average += horizontalKernel[3] * imageData[wrap(i - 4, length)];
    average += horizontalKernel[4] * imageData[wrap(i, length)];
    average += horizontalKernel[5] * imageData[wrap(i + 4, length)];
    average += horizontalKernel[6] * imageData[wrap(i + (image.width - 1) * 4, length)];
    average += horizontalKernel[7] * imageData[wrap(i + (image.width) * 4, length)];
    average += horizontalKernel[8] * imageData[wrap(i + (image.width + 1) * 4, length)];
    resultHorizontal[i] = average;

    average = 0;
    average += verticalKernel[0] * imageData[wrap(i - (image.width + 1) * 4, length)];
    average += verticalKernel[1] * imageData[wrap(i - (image.width) * 4, length)];
    average += verticalKernel[2] * imageData[wrap(i - (image.width - 1) * 4, length)];
    average += verticalKernel[3] * imageData[wrap(i - 4, length)];
    average += verticalKernel[4] * imageData[wrap(i, length)];
    average += verticalKernel[5] * imageData[wrap(i + 4, length)];
    average += verticalKernel[6] * imageData[wrap(i + (image.width - 1) * 4, length)];
    average += verticalKernel[7] * imageData[wrap(i + (image.width) * 4, length)];
    average += verticalKernel[8] * imageData[wrap(i + (image.width + 1) * 4, length)];
    resultVertical[i] = average;

    result[i] = Math.sqrt((resultHorizontal[i] * resultHorizontal[i]) + (resultVertical[i] * resultVertical[i]));
  }

  return ArrayToImage(result, image.height, image.width);
}
