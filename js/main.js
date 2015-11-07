(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Grayscale = Grayscale;
exports.MeanBlur = MeanBlur;
exports.GaussianBlur = GaussianBlur;
exports.DetectEdges = DetectEdges;
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');

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
  var imageData = context.getImageData(0, 0, image.width, image.height);
  return imageData.data;
}

function ArrayToImage(data, height, width) {
  var image = new Image();
  var imgdata = new ImageData(data, width, height);
  canvas.height = height;
  canvas.width = width;
  context.putImageData(imgdata, 0, 0);
  image.src = canvas.toDataURL();
  return image;
}

function Grayscale(image) {
  var i = undefined,
      imageData = undefined,
      average = undefined;
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

function MeanBlur(image) {
  var imageData = ImageToArray(image);
  var length = imageData.length;
  var result = new Uint8ClampedArray(length);
  var i = undefined,
      average = undefined;

  for (i = 0; i < length; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += imageData[wrap(i - (image.width + 1) * 4, length)];
    average += imageData[wrap(i - image.width * 4, length)];
    average += imageData[wrap(i - (image.width - 1) * 4, length)];
    average += imageData[wrap(i - 4, length)];
    average += imageData[wrap(i, length)];
    average += imageData[wrap(i + 4, length)];
    average += imageData[wrap(i + (image.width - 1) * 4, length)];
    average += imageData[wrap(i + image.width * 4, length)];
    average += imageData[wrap(i + (image.width + 1) * 4, length)];

    average = Math.round(average / 9);

    result[i] = average;
  }

  return ArrayToImage(result, image.height, image.width);
}

function GaussianBlur(image) {
  var imageData = ImageToArray(image);
  var length = imageData.length;
  var result = new Uint8ClampedArray(length);
  var i = undefined,
      average = undefined;

  var kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];

  for (i = 0; i < length; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += kernel[0] * imageData[wrap(i - (image.width + 1) * 4, length)];
    average += kernel[1] * imageData[wrap(i - image.width * 4, length)];
    average += kernel[2] * imageData[wrap(i - (image.width - 1) * 4, length)];
    average += kernel[3] * imageData[wrap(i - 4, length)];
    average += kernel[4] * imageData[wrap(i, length)];
    average += kernel[5] * imageData[wrap(i + 4, length)];
    average += kernel[6] * imageData[wrap(i + (image.width - 1) * 4, length)];
    average += kernel[7] * imageData[wrap(i + image.width * 4, length)];
    average += kernel[8] * imageData[wrap(i + (image.width + 1) * 4, length)];

    average = Math.round(average / 16);

    result[i] = average;
  }

  return ArrayToImage(result, image.height, image.width);
}

function DetectEdges(image) {
  var imageData = ImageToArray(image);
  var length = imageData.length;
  var resultHorizontal = new Uint8ClampedArray(length);
  var resultVertical = new Uint8ClampedArray(length);
  var result = new Uint8ClampedArray(length);
  var i = undefined,
      average = undefined;

  var horizontalKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  var verticalKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (i = 0; i < length; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += horizontalKernel[0] * imageData[wrap(i - (image.width + 1) * 4, length)];
    average += horizontalKernel[1] * imageData[wrap(i - image.width * 4, length)];
    average += horizontalKernel[2] * imageData[wrap(i - (image.width - 1) * 4, length)];
    average += horizontalKernel[3] * imageData[wrap(i - 4, length)];
    average += horizontalKernel[4] * imageData[wrap(i, length)];
    average += horizontalKernel[5] * imageData[wrap(i + 4, length)];
    average += horizontalKernel[6] * imageData[wrap(i + (image.width - 1) * 4, length)];
    average += horizontalKernel[7] * imageData[wrap(i + image.width * 4, length)];
    average += horizontalKernel[8] * imageData[wrap(i + (image.width + 1) * 4, length)];
    resultHorizontal[i] = average;

    average = 0;
    average += verticalKernel[0] * imageData[wrap(i - (image.width + 1) * 4, length)];
    average += verticalKernel[1] * imageData[wrap(i - image.width * 4, length)];
    average += verticalKernel[2] * imageData[wrap(i - (image.width - 1) * 4, length)];
    average += verticalKernel[3] * imageData[wrap(i - 4, length)];
    average += verticalKernel[4] * imageData[wrap(i, length)];
    average += verticalKernel[5] * imageData[wrap(i + 4, length)];
    average += verticalKernel[6] * imageData[wrap(i + (image.width - 1) * 4, length)];
    average += verticalKernel[7] * imageData[wrap(i + image.width * 4, length)];
    average += verticalKernel[8] * imageData[wrap(i + (image.width + 1) * 4, length)];
    resultVertical[i] = average;

    result[i] = Math.sqrt(resultHorizontal[i] * resultHorizontal[i] + resultVertical[i] * resultVertical[i]);
  }

  return ArrayToImage(result, image.height, image.width);
}

},{}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _filters = require('./filters');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultImage = 'https://upload.wikimedia.org/wikipedia/en/2/24/Lenna.png';
var events = [['original', 'reset'], ['grayscale', 'toGrayscale'], ['meanBlur', 'meanBlur'], ['gaussianBlur', 'gaussianBlur'], ['meanBlurGrayscale', 'meanBlurGrayscale'], ['edges', 'detectEdges']];

var fileInput = undefined,
    canvas = undefined,
    ctx = undefined,
    currentImage = undefined;

window.onload = function () {
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
  document.getElementById(event[0]).addEventListener('click', function () {
    currentImage[event[1]].call(currentImage);
  });
}

function loadImage(e) {
  new BaseImage(fileInput.files[0], imageLoaded);
}

function imageLoaded(image) {
  currentImage = image;
  image.draw();
  console.log('Image Dimensions: ' + image.height + 'px x ' + image.width + 'px');
}

var BaseImage = (function () {
  function BaseImage(file, callback) {
    var _this = this;

    _classCallCheck(this, BaseImage);

    this.originalImage = new Image();
    this.img = new Image();
    this.onload = callback;
    var imageType = /image.*/;
    var reader = new FileReader();

    if (!file) {
      this.originalImage.crossOrigin = '';
      this.originalImage.src = defaultImage;
      this.img.onload = this.onload.bind(this, this);
      this.img.crossOrigin = '';
      this.img.src = defaultImage;
    } else if (!file.type.match(imageType)) {
      console.error("File not supported!");
    } else {
      reader.onload = function (e) {
        _this.originalImage.src = reader.result;
        _this.img.onload = _this.onload.bind(_this, _this);
        _this.img.src = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }

  _createClass(BaseImage, [{
    key: 'draw',
    value: function draw() {
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this.img, 0, 0);
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.img = this.originalImage;
      this.draw();
    }
  }, {
    key: 'toGrayscale',
    value: function toGrayscale() {
      var _this2 = this;

      this.startTimer();
      var image = (0, _filters.Grayscale)(this.originalImage);
      image.onload = function () {
        _this2.img = image;
        _this2.stopTimer();
        _this2.draw.call(_this2);
      };
    }
  }, {
    key: 'meanBlur',
    value: function meanBlur() {
      var _this3 = this;

      this.startTimer();
      var image = (0, _filters.MeanBlur)(this.originalImage);
      image.onload = function () {
        _this3.img = image;
        _this3.stopTimer();
        _this3.draw.call(_this3);
      };
    }
  }, {
    key: 'gaussianBlur',
    value: function gaussianBlur() {
      var _this4 = this;

      this.startTimer();
      var image = (0, _filters.GaussianBlur)(this.originalImage);
      image.onload = function () {
        _this4.img = image;
        _this4.stopTimer();
        _this4.draw.call(_this4);
      };
    }
  }, {
    key: 'meanBlurGrayscale',
    value: function meanBlurGrayscale() {
      var _this5 = this;

      this.startTimer();
      var image1 = undefined,
          image2 = undefined;
      image1 = (0, _filters.Grayscale)(this.originalImage);
      image1.onload = function () {
        image2 = (0, _filters.MeanBlur)(image1);
        image2.onload = function () {
          _this5.img = image2;
          _this5.stopTimer();
          _this5.draw.call(_this5);
        };
      };
    }
  }, {
    key: 'detectEdges',
    value: function detectEdges() {
      var _this6 = this;

      this.startTimer();
      var image1 = undefined,
          image2 = undefined,
          image3 = undefined;
      image1 = (0, _filters.Grayscale)(this.originalImage);
      image1.onload = function () {
        image2 = (0, _filters.MeanBlur)(image1);
        image2.onload = function () {
          image3 = (0, _filters.DetectEdges)(image2);
          image3.onload = function () {
            _this6.img = image3;
            _this6.stopTimer();
            _this6.draw.call(_this6);
          };
        };
      };
    }
  }, {
    key: 'startTimer',
    value: function startTimer() {
      this.timer = {};
      this.timer.start = performance.now();
    }
  }, {
    key: 'stopTimer',
    value: function stopTimer() {
      this.timer.end = performance.now();
      console.log('Elapsed time: ' + Math.round(this.timer.end - this.timer.start) + 'ms');
    }
  }, {
    key: 'height',
    get: function get() {
      return this.img.height;
    }
  }, {
    key: 'width',
    get: function get() {
      return this.img.width;
    }
  }]);

  return BaseImage;
})();

function pick(event) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = ctx.getImageData(x, y, 1, 1);
  var data = pixel.data;
  console.log('rgb(' + data[0] + ', ' + data[1] + ', ' + data[2] + ')');
}

},{"./filters":1}]},{},[2,1]);
