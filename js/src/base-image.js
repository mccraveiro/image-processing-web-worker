import {Grayscale, MeanBlur, DetectEdges, GaussianBlur} from './filters';

var workers = [];

for (let i = 0; i < 12; i++) {
  workers[i] = new Worker('js/worker.js');
}

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

  detectEdgesOnWorker(callback, numberOfWorkers = 1) {
    var that = this;
    var imageData = ImageToArray(this.originalImage);
    if (numberOfWorkers > 12) numberOfWorkers = 12;

    setupWorkers(imageData, that.height, that.width, numberOfWorkers)
    .then(executeOnWorkers.bind(this, numberOfWorkers, 'Grayscale'))
    .then(executeOnWorkers.bind(this, numberOfWorkers, 'MeanBlur'))
    .then(executeOnWorkers.bind(this, numberOfWorkers, 'DetectEdges'))
    .then(function (result) {
      that.img = ArrayToImage(result, that.height, that.width);
      that.img.onload = callback;
    });
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

function setupWorkers(imageData, height, width, numberOfWorkers) {
  return new Promise(function(resolve, reject) {
    var currentLength = 0;
    var eachLength = Math.ceil((imageData.length / 4) / numberOfWorkers) * 4;
    var finishedWorkers = 0;

    for (let i = 0; i < numberOfWorkers; i++) {
      workers[i].onmessage = function(e) {
        if (e.data[0] !== 'Setup') {
          return;
        }

        finishedWorkers++;

        if (finishedWorkers === numberOfWorkers) {
          resolve(imageData);
        }
      }

      workers[i].postMessage(['Setup', height, width, currentLength, currentLength + eachLength]);
      currentLength += eachLength;
    }
  });
}

function executeOnWorkers(numberOfWorkers, filter, imageData) {
  return new Promise(function(resolve, reject) {
    var finishedWorkers = 0;
    var resultImage = imageData;

    for (let i = 0; i < numberOfWorkers; i++) {
      workers[i].onmessage = function(e) {
        if (e.data[0] !== filter) {
          return;
        }

        resultImage = combineImage(resultImage, e.data[1], e.data[2], e.data[3])
        finishedWorkers++;

        if (finishedWorkers === numberOfWorkers) {
          resolve(resultImage);
        }
      }

      workers[i].postMessage([filter, imageData]);
    }
  });
}

export function ImageToArray(image) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = image.height;
  canvas.width = image.width;
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, image.width, image.height);
  return imageData.data;
}

export function ArrayToImage(data, height, width) {
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

function combineImage(result, data, initialIndex, maxIndex) {
  for (let i = initialIndex; i < maxIndex; i++) {
    result[i] = data[i];
  }

  return result;
}
