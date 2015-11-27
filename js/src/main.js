"use strict";

import BaseImage from './base-image';
import {ImageToArray} from './base-image';
let fileInput, timer, imageInfo;

function onload() {
  timer = document.getElementById('timer');
  imageInfo = document.getElementById('image-info');
  fileInput = document.getElementById('file');
  let example = document.getElementById('use-example');

  fileInput.addEventListener('change', function (e) {
    fileInput.disabled = true;
    new BaseImage(fileInput.files[0], run);
  });

  example.addEventListener('click', function (e) {
    e.preventDefault();
    fileInput.disabled = true;
    new BaseImage('http://lh3.ggpht.com/-1VePI47ZHss/USzP3SPR42I/AAAAAAAABb0/7ID_koq3c3I/DSC06850.JPG?imgmax=800', run);
  });
}

function run(image) {
  runBenchmark(image)
  .then(runBenchmarkOnWorker.bind(this, image, 1))
  .then(runBenchmarkOnWorker.bind(this, image, 2))
  .then(runBenchmarkOnWorker.bind(this, image, 4))
  .then(runBenchmarkOnWorker.bind(this, image, 6))
  .then(runBenchmarkOnWorker.bind(this, image, 8))
  .then(runBenchmarkOnWorker.bind(this, image, 10))
  .then(runBenchmarkOnWorker.bind(this, image, 12))
  .then(() => {
    fileInput.disabled = false;
  });
}

function runBenchmark(image) {
  return new Promise(function(resolve, reject) {
    draw(image, 'original-image');
    imageInfo.textContent = `Image Dimensions: ${image.height}px x ${image.width}px`;
    image.startTimer();
    image.detectEdges(function () {
      let elapsedTime = image.stopTimer();
      timer.innerHTML = `Elapsed time: ${elapsedTime}ms`;
      draw(image, 'result');
      resolve();
    });
  });
}

function runBenchmarkOnWorker(image, numberOfWorkers = 1) {
  return new Promise(function(resolve, reject) {
    image.startTimer();
    image.detectEdgesOnWorker(function () {
      let elapsedTime = image.stopTimer();
      timer.innerHTML = timer.innerHTML + `<br/>Elapsed time (${numberOfWorkers} workers): ${elapsedTime}ms`;
      draw(image, 'result2');
      resolve();
    }, numberOfWorkers);
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
