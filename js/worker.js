(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function Grayscale(imageData) {
  var i = undefined,
      average = undefined;

  for (i = 0; i < imageData.length; i += 4) {
    average = imageData[i] + imageData[i + 1] + imageData[i + 2];
    average = Math.round(average / 3);

    imageData[i] = average;
    imageData[i + 1] = average;
    imageData[i + 2] = average;
  }

  return imageData;
}

function MeanBlur(imageData, height, width) {
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

function GaussianBlur(imageData, height, width) {
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

function DetectEdges(imageData, height, width) {
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

},{}],2:[function(require,module,exports){
'use strict';

var _filters = require('./filters');

onmessage = function (e) {
  switch (e.data[0]) {
    case 'Grayscale':
      postMessage([e.data[0], (0, _filters.Grayscale)(e.data[1])]);
      break;
    case 'MeanBlur':
      postMessage([e.data[0], (0, _filters.MeanBlur)(e.data[1], e.data[2], e.data[3])]);
      break;
    case 'DetectEdges':
      postMessage([e.data[0], (0, _filters.DetectEdges)(e.data[1], e.data[2], e.data[3])]);
      break;
  }
};

},{"./filters":1}]},{},[2]);
