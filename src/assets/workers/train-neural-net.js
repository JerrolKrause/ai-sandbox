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
  // Hidden layers determine the # of neurons between the input and output
  const net = new brain.NeuralNetworkGPU({ hiddenLayers: [3] });
  const options = {
    // log: error => console.log(error),
    // logPeriod: 100,
    // learningRate: 0.005 // Only learn down to this decimal amount
    // errorThresh: 0.02 // Turn down error threshold to speed up training time
  };
  net.train(trainingData.data, options);
  const model = net.toJSON();
  self.postMessage(model);
  // console.timeEnd('Training NN took');
};
