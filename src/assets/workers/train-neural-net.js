// worker.js
importScripts('https://unpkg.com/brain.js');

self.onmessage = function (trainingData) {
  console.log('trainingData received by web worker', trainingData);
  // console.time('Training NN took');
  if (!trainingData) {
    console.error('No training data received by web worker');
    return;
  }
  if (!brain) {
    console.error('Error loading Brain.js');
    return;
  }
  const net = new brain.NeuralNetworkGPU();
  net.train(trainingData.data);
  const model = net.toJSON();
  self.postMessage(model);
  // console.timeEnd('Training NN took');
};
