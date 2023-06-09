import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
// import * as tf from '@tensorflow/tfjs-node-gpu';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-tensor-flow',
  templateUrl: './tensor-flow.component.html',
  styleUrls: ['./tensor-flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TensorFlowComponent implements OnInit, OnDestroy {
  name = 'tensorFlow';
  constructor() {} // public uiState: UiStateService, // Global UI state // private domainState: DomainService, // Global domain state

  ngOnInit() {
    // Single request
    // scriptLoad$('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js').subscribe(() => {});

    // Define a model for linear regression. The script tag makes `tf` available
    // as a global variable.
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    // Prepare the model for training: Specify the loss and the optimizer.
    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

    // Generate some synthetic data for training.
    const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
    const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

    // Train the model using the data.
    model.fit(xs, ys).then(() => {
      // Use the model to do inference on a data point the model hasn't seen before:
      // Open the browser devtools to see the output
      (model.predict(tf.tensor2d([5], [1, 1])) as any).print();
      (model.predict(tf.tensor2d([10], [1, 1])) as any).print();
    });

    // Script loaded successfully
  }

  ngOnDestroy() {}
}
