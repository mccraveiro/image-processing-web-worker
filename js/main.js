(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageToArray = ImageToArray;
exports.ArrayToImage = ArrayToImage;

var _filters = require('./filters');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var workers = [];

for (var i = 0; i < 12; i++) {
  workers[i] = new Worker('js/worker.js');
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

    if (typeof file === 'string') {
      this.originalImage.crossOrigin = '';
      this.originalImage.src = file;
      this.img.crossOrigin = '';
      this.img.src = file;
    } else if (!file.type.match(imageType)) {
      console.error("File not supported!");
    } else {
      reader.onload = function (e) {
        _this.originalImage.src = reader.result;
        _this.img.src = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }

  _createClass(BaseImage, [{
    key: 'detectEdges',
    value: function detectEdges(callback) {
      var imageData = ImageToArray(this.originalImage);
      imageData = (0, _filters.Grayscale)(imageData);
      imageData = (0, _filters.MeanBlur)(imageData, this.height, this.width);
      imageData = (0, _filters.DetectEdges)(imageData, this.height, this.width);
      this.img = ArrayToImage(imageData, this.height, this.width);
      this.img.onload = callback;
    }
  }, {
    key: 'detectEdgesOnWorker',
    value: function detectEdgesOnWorker(callback) {
      var numberOfWorkers = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      var that = this;
      var imageData = ImageToArray(this.originalImage);
      if (numberOfWorkers > 12) numberOfWorkers = 12;

      setupWorkers(imageData, that.height, that.width, numberOfWorkers).then(executeOnWorkers.bind(this, numberOfWorkers, 'Grayscale')).then(executeOnWorkers.bind(this, numberOfWorkers, 'MeanBlur')).then(executeOnWorkers.bind(this, numberOfWorkers, 'DetectEdges')).then(function (result) {
        that.img = ArrayToImage(result, that.height, that.width);
        that.img.onload = callback;
      });
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
      return Math.round(this.timer.end - this.timer.start);
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
  }, {
    key: 'onload',
    set: function set(callback) {
      this.img.onload = callback.bind(this, this);
    }
  }]);

  return BaseImage;
})();

exports.default = BaseImage;

function setupWorkers(imageData, height, width, numberOfWorkers) {
  return new Promise(function (resolve, reject) {
    var currentLength = 0;
    var eachLength = Math.ceil(imageData.length / 4 / numberOfWorkers) * 4;
    var finishedWorkers = 0;

    for (var i = 0; i < numberOfWorkers; i++) {
      workers[i].onmessage = function (e) {
        if (e.data[0] !== 'Setup') {
          return;
        }

        finishedWorkers++;

        if (finishedWorkers === numberOfWorkers) {
          resolve(imageData);
        }
      };

      workers[i].postMessage(['Setup', height, width, currentLength, currentLength + eachLength]);
      currentLength += eachLength;
    }
  });
}

function executeOnWorkers(numberOfWorkers, filter, imageData) {
  return new Promise(function (resolve, reject) {
    var finishedWorkers = 0;
    var resultImage = imageData;

    for (var i = 0; i < numberOfWorkers; i++) {
      workers[i].onmessage = function (e) {
        if (e.data[0] !== filter) {
          return;
        }

        resultImage = combineImage(resultImage, e.data[1], e.data[2], e.data[3]);
        finishedWorkers++;

        if (finishedWorkers === numberOfWorkers) {
          resolve(resultImage);
        }
      };

      workers[i].postMessage([filter, imageData]);
    }
  });
}

function ImageToArray(image) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = image.height;
  canvas.width = image.width;
  context.drawImage(image, 0, 0);
  var imageData = context.getImageData(0, 0, image.width, image.height);
  return imageData.data;
}

function ArrayToImage(data, height, width) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var image = new Image();
  var imgdata = new ImageData(data, width, height);
  canvas.height = height;
  canvas.width = width;
  context.putImageData(imgdata, 0, 0);
  image.src = canvas.toDataURL();
  return image;
}

function combineImage(result, data, initialIndex, maxIndex) {
  for (var i = initialIndex; i < maxIndex; i++) {
    result[i] = data[i];
  }

  return result;
}

},{"./filters":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Grayscale = Grayscale;
exports.MeanBlur = MeanBlur;
exports.GaussianBlur = GaussianBlur;
exports.DetectEdges = DetectEdges;
function wrap(value, max) {
  if (value < 0) {
    return value + max;
  } else if (value >= max) {
    return value - max;
  }
  return value;
}

function Grayscale(imageData, initialIndex, maxIndex) {
  var i = undefined,
      average = undefined;
  initialIndex = initialIndex || 0;
  maxIndex = maxIndex || imageData.length;

  for (i = initialIndex; i < maxIndex; i += 4) {
    average = imageData[i] + imageData[i + 1] + imageData[i + 2];
    average = Math.round(average / 3);

    imageData[i] = average;
    imageData[i + 1] = average;
    imageData[i + 2] = average;
  }

  return imageData;
}

function MeanBlur(imageData, height, width, initialIndex, maxIndex) {
  var length = imageData.length;
  var result = new Uint8ClampedArray(length);
  var i = undefined,
      average = undefined;
  initialIndex = initialIndex || 0;
  maxIndex = maxIndex || length;

  for (i = initialIndex; i < maxIndex; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += imageData[wrap(i - (width + 1) * 4, length)];
    average += imageData[wrap(i - width * 4, length)];
    average += imageData[wrap(i - (width - 1) * 4, length)];
    average += imageData[wrap(i - 4, length)];
    average += imageData[wrap(i, length)];
    average += imageData[wrap(i + 4, length)];
    average += imageData[wrap(i + (width - 1) * 4, length)];
    average += imageData[wrap(i + width * 4, length)];
    average += imageData[wrap(i + (width + 1) * 4, length)];

    average = Math.round(average / 9);

    result[i] = average;
  }

  return result;
}

function GaussianBlur(imageData, height, width, initialIndex, maxIndex) {
  var length = imageData.length;
  var result = new Uint8ClampedArray(length);
  var i = undefined,
      average = undefined;
  initialIndex = initialIndex || 0;
  maxIndex = maxIndex || length;

  var kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];

  for (i = initialIndex; i < maxIndex; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += kernel[0] * imageData[wrap(i - (width + 1) * 4, length)];
    average += kernel[1] * imageData[wrap(i - width * 4, length)];
    average += kernel[2] * imageData[wrap(i - (width - 1) * 4, length)];
    average += kernel[3] * imageData[wrap(i - 4, length)];
    average += kernel[4] * imageData[wrap(i, length)];
    average += kernel[5] * imageData[wrap(i + 4, length)];
    average += kernel[6] * imageData[wrap(i + (width - 1) * 4, length)];
    average += kernel[7] * imageData[wrap(i + width * 4, length)];
    average += kernel[8] * imageData[wrap(i + (width + 1) * 4, length)];

    average = Math.round(average / 16);

    result[i] = average;
  }

  return result;
}

function DetectEdges(imageData, height, width, initialIndex, maxIndex) {
  var length = imageData.length;
  var resultHorizontal = new Uint8ClampedArray(length);
  var resultVertical = new Uint8ClampedArray(length);
  var result = new Uint8ClampedArray(length);
  var i = undefined,
      average = undefined;
  initialIndex = initialIndex || 0;
  maxIndex = maxIndex || length;

  var horizontalKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  var verticalKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (i = initialIndex; i < maxIndex; i++) {
    if ((i + 1) % 4 === 0) {
      result[i] = 255;
      continue;
    }

    average = 0;
    average += horizontalKernel[0] * imageData[wrap(i - (width + 1) * 4, length)];
    average += horizontalKernel[1] * imageData[wrap(i - width * 4, length)];
    average += horizontalKernel[2] * imageData[wrap(i - (width - 1) * 4, length)];
    average += horizontalKernel[3] * imageData[wrap(i - 4, length)];
    average += horizontalKernel[4] * imageData[wrap(i, length)];
    average += horizontalKernel[5] * imageData[wrap(i + 4, length)];
    average += horizontalKernel[6] * imageData[wrap(i + (width - 1) * 4, length)];
    average += horizontalKernel[7] * imageData[wrap(i + width * 4, length)];
    average += horizontalKernel[8] * imageData[wrap(i + (width + 1) * 4, length)];
    resultHorizontal[i] = average;

    average = 0;
    average += verticalKernel[0] * imageData[wrap(i - (width + 1) * 4, length)];
    average += verticalKernel[1] * imageData[wrap(i - width * 4, length)];
    average += verticalKernel[2] * imageData[wrap(i - (width - 1) * 4, length)];
    average += verticalKernel[3] * imageData[wrap(i - 4, length)];
    average += verticalKernel[4] * imageData[wrap(i, length)];
    average += verticalKernel[5] * imageData[wrap(i + 4, length)];
    average += verticalKernel[6] * imageData[wrap(i + (width - 1) * 4, length)];
    average += verticalKernel[7] * imageData[wrap(i + width * 4, length)];
    average += verticalKernel[8] * imageData[wrap(i + (width + 1) * 4, length)];
    resultVertical[i] = average;

    result[i] = Math.sqrt(resultHorizontal[i] * resultHorizontal[i] + resultVertical[i] * resultVertical[i]);
  }

  return result;
}

},{}],3:[function(require,module,exports){
"use strict";

var _baseImage = require('./base-image');

var _baseImage2 = _interopRequireDefault(_baseImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fileInput = undefined,
    timer = undefined,
    imageInfo = undefined;

function onload() {
  timer = document.getElementById('timer');
  imageInfo = document.getElementById('image-info');
  fileInput = document.getElementById('file');
  var example = document.getElementById('use-example');

  fileInput.addEventListener('change', function (e) {
    fileInput.disabled = true;
    new _baseImage2.default(fileInput.files[0], run);
  });

  example.addEventListener('click', function (e) {
    e.preventDefault();
    fileInput.disabled = true;
    new _baseImage2.default('http://lh3.ggpht.com/-1VePI47ZHss/USzP3SPR42I/AAAAAAAABb0/7ID_koq3c3I/DSC06850.JPG?imgmax=800', run);
  });
}

function run(image) {
  runBenchmark(image).then(runBenchmarkOnWorker.bind(this, image, 1)).then(runBenchmarkOnWorker.bind(this, image, 2)).then(runBenchmarkOnWorker.bind(this, image, 4)).then(runBenchmarkOnWorker.bind(this, image, 6)).then(runBenchmarkOnWorker.bind(this, image, 8)).then(runBenchmarkOnWorker.bind(this, image, 10)).then(runBenchmarkOnWorker.bind(this, image, 12)).then(function () {
    fileInput.disabled = false;
  });
}

function runBenchmark(image) {
  return new Promise(function (resolve, reject) {
    draw(image, 'original-image');
    imageInfo.textContent = 'Image Dimensions: ' + image.height + 'px x ' + image.width + 'px';
    image.startTimer();
    image.detectEdges(function () {
      var elapsedTime = image.stopTimer();
      timer.innerHTML = 'Elapsed time: ' + elapsedTime + 'ms';
      draw(image, 'result');
      resolve();
    });
  });
}

function runBenchmarkOnWorker(image) {
  var numberOfWorkers = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  return new Promise(function (resolve, reject) {
    image.startTimer();
    image.detectEdgesOnWorker(function () {
      var elapsedTime = image.stopTimer();
      timer.innerHTML = timer.innerHTML + ('<br/>Elapsed time (' + numberOfWorkers + ' workers): ' + elapsedTime + 'ms');
      resolve();
    }, numberOfWorkers);
  });
}

function draw(image, canvasID) {
  var canvas = document.getElementById(canvasID);
  var ctx = canvas.getContext('2d');
  canvas.height = image.height;
  canvas.width = image.width;
  ctx.drawImage(image.img, 0, 0);
}

window.onload = onload;

},{"./base-image":1}]},{},[3]);
