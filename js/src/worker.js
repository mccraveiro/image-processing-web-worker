import {Grayscale, MeanBlur, DetectEdges, GaussianBlur} from './filters';

var settings = {};

onmessage = function(e) {
  switch (e.data[0]) {
    case 'Setup':
      settings = {
        height: e.data[1],
        width: e.data[2],
        initialIndex: e.data[3],
        maxIndex: e.data[4]
      };
      postMessage([e.data[0]]);
      break;
    case 'Grayscale':
      postMessage([
        e.data[0],
        Grayscale(e.data[1], settings.initialIndex, settings.maxIndex),
        settings.initialIndex,
        settings.maxIndex
      ]);
      break;
    case 'MeanBlur':
      postMessage([
        e.data[0],
        MeanBlur(e.data[1], settings.height, settings.width, settings.initialIndex, settings.maxIndex),
        settings.initialIndex,
        settings.maxIndex
      ]);
      break;
    case 'DetectEdges':
      postMessage([
        e.data[0],
        DetectEdges(e.data[1], settings.height, settings.width, settings.initialIndex, settings.maxIndex),
        settings.initialIndex,
        settings.maxIndex
      ]);
      break;
  }
}
