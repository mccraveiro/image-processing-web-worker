import {Grayscale, MeanBlur, DetectEdges, GaussianBlur} from './filters';

onmessage = function(e) {
  switch (e.data[0]) {
    case 'Grayscale':
      postMessage([e.data[0], Grayscale(e.data[1])]);
      break;
    case 'MeanBlur':
      postMessage([e.data[0], MeanBlur(e.data[1], e.data[2], e.data[3])]);
      break;
    case 'DetectEdges':
      postMessage([e.data[0], DetectEdges(e.data[1], e.data[2], e.data[3])]);
      break;
  }
}
