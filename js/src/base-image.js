import {Grayscale, MeanBlur, DetectEdges, GaussianBlur} from './filters';

export default class BaseImage {
  constructor(file, callback) {
    this.originalImage = new Image();
    this.img = new Image();
    this.onload = callback;
    const imageType = /image.*/;
    const reader = new FileReader();

    if (typeof file === 'string') {
      this.originalImage.crossOrigin = '';
      this.originalImage.src = file;
      this.img.crossOrigin = '';
      this.img.src = file;
    } else if (!file.type.match(imageType)) {
      console.error("File not supported!");
    } else {
      reader.onload = e => {
        this.originalImage.src = reader.result;
        this.img.src = reader.result;
      }

      reader.readAsDataURL(file);
    }
  }

  get height() {
    return this.img.height;
  }

  get width() {
    return this.img.width;
  }

  set onload(callback) {
    this.img.onload = callback.bind(this, this);
  }

  detectEdges(callback) {
    let imageData = ImageToArray(this.originalImage);
    imageData = Grayscale(imageData);
    imageData = MeanBlur(imageData, this.height, this.width);
    imageData = DetectEdges(imageData, this.height, this.width);
    this.img = ArrayToImage(imageData, this.height, this.width);
    this.img.onload = callback;
  }

  startTimer() {
    this.timer = {};
    this.timer.start = performance.now();
  }

  stopTimer() {
    this.timer.end = performance.now();
    return Math.round(this.timer.end - this.timer.start);
  }
}

function ImageToArray(image) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = image.height;
  canvas.width = image.width;
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, image.width, image.height);
  return imageData.data;
}

function ArrayToImage(data, height, width) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  let image = new Image();
  let imgdata = new ImageData(data, width, height);
  canvas.height = height;
  canvas.width = width;
  context.putImageData(imgdata, 0, 0);
  image.src = canvas.toDataURL();
  return image;
}
