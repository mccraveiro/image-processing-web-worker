"use strict";

import BaseImage from './base-image';
const defaultImage = 'https://upload.wikimedia.org/wikipedia/en/2/24/Lenna.png';
let fileInput, timer, imageInfo;

function onload() {
  timer = document.getElementById('timer');
  imageInfo = document.getElementById('image-info');
  fileInput = document.getElementById('file');
  fileInput.addEventListener('change', function (e) {
    new BaseImage(fileInput.files[0], runBenchmark);
  });
  // Load default image
  new BaseImage(defaultImage, runBenchmark);
}

function runBenchmark(image) {
  draw(image, 'original-image');
  imageInfo.textContent = `Image Dimensions: ${image.height}px x ${image.width}px`;
  image.startTimer();
  image.detectEdges(function () {
    let elapsedTime = image.stopTimer();
    timer.textContent = `Elapsed time: ${elapsedTime}ms`;
    draw(image, 'result');
  });
}

function draw(image, canvasID) {
  let canvas = document.getElementById(canvasID);
  let ctx = canvas.getContext('2d');
  canvas.height = image.height;
  canvas.width = image.width;
  ctx.drawImage(image.img, 0, 0);
}

window.onload = onload;
