"use strict";

import {Grayscale, MeanBlur, DetectEdges, GaussianBlur} from './filters';

const defaultImage = 'https://upload.wikimedia.org/wikipedia/en/2/24/Lenna.png';
const events = [
  ['original', 'reset'],
  ['grayscale', 'toGrayscale'],
  ['meanBlur', 'meanBlur'],
  ['gaussianBlur', 'gaussianBlur'],
  ['meanBlurGrayscale', 'meanBlurGrayscale'],
  ['edges', 'detectEdges']
];

let fileInput, canvas, ctx, currentImage;

window.onload = () => {
  fileInput = document.getElementById('file');
  canvas = document.getElementById('result');
  ctx = canvas.getContext('2d');

  fileInput.addEventListener('change', loadImage);
  canvas.addEventListener('mousemove', pick);

  events.forEach(setEvent);

  // Load default image
  new BaseImage(null, imageLoaded);
};

function setEvent(event) {
  document.getElementById(event[0]).addEventListener('click', () => {
    currentImage[event[1]].call(currentImage)
  });
}

function loadImage(e) {
  new BaseImage(fileInput.files[0], imageLoaded);
}

function imageLoaded(image) {
  currentImage = image;
  image.draw();
  console.log(`Image Dimensions: ${image.height}px x ${image.width}px`);
}

class BaseImage {
  constructor(file, callback) {
    this.originalImage = new Image();
    this.img = new Image();
    this.onload = callback;
    const imageType = /image.*/;
    const reader = new FileReader();

    if (!file) {
      this.originalImage.crossOrigin = '';
      this.originalImage.src = defaultImage;
      this.img.onload = this.onload.bind(this, this);
      this.img.crossOrigin = '';
      this.img.src = defaultImage;
    } else if (!file.type.match(imageType)) {
      console.error("File not supported!");
    } else {
      reader.onload = e => {
        this.originalImage.src = reader.result;
        this.img.onload = this.onload.bind(this, this);
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

  draw() {
    canvas.height = this.height;
    canvas.width = this.width;
    ctx.drawImage(this.img, 0, 0);
  }

  reset() {
    this.img = this.originalImage;
    this.draw();
  }

  toGrayscale() {
    this.startTimer();
    let image = Grayscale(this.originalImage);
    image.onload = () => {
      this.img = image;
      this.stopTimer();
      this.draw.call(this);
    };
  }

  meanBlur() {
    this.startTimer();
    let image = MeanBlur(this.originalImage);
    image.onload = () => {
      this.img = image;
      this.stopTimer();
      this.draw.call(this);
    };
  }

  gaussianBlur() {
    this.startTimer();
    let image = GaussianBlur(this.originalImage);
    image.onload = () => {
      this.img = image;
      this.stopTimer();
      this.draw.call(this);
    };
  }

  meanBlurGrayscale() {
    this.startTimer();
    let image1, image2;
    image1 = Grayscale(this.originalImage);
    image1.onload = () => {
      image2 = MeanBlur(image1);
      image2.onload = () => {
        this.img = image2;
        this.stopTimer();
        this.draw.call(this);
      };
    };
  }

  detectEdges() {
    this.startTimer();
    let image1, image2, image3;
    image1 = Grayscale(this.originalImage);
    image1.onload = () => {
      image2 = MeanBlur(image1);
      image2.onload = () => {
        image3 = DetectEdges(image2);
        image3.onload = () => {
          this.img = image3;
          this.stopTimer();
          this.draw.call(this);
        };
      };
    };
  }

  startTimer() {
    this.timer = {};
    this.timer.start = performance.now();
  }

  stopTimer() {
    this.timer.end = performance.now();
    console.log(`Elapsed time: ${Math.round(this.timer.end - this.timer.start)}ms`);
  }
}

function pick(event) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = ctx.getImageData(x, y, 1, 1);
  var data = pixel.data;
  console.log(`rgb(${data[0]}, ${data[1]}, ${data[2]})`);
}
