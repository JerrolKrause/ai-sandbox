import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
// import * as tf from '@tensorflow/tfjs-node-gpu';
// import * as tf from '@tensorflow/tfjs';
import { scriptLoad$ } from '@ntersol/utils';
import { switchMap } from 'rxjs';

declare var mobilenet: any;

@Component({
  selector: 'app-tensor-flow',
  templateUrl: './tensor-flow.component.html',
  styleUrls: ['./tensor-flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TensorFlowComponent implements OnInit, OnDestroy {
  constructor() {}
  ngOnInit() {
    // Single request
    scriptLoad$(['https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.1'])
      .pipe(switchMap(() => scriptLoad$(['https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@1.0.0'])))
      .subscribe(() => {
        console.log(mobilenet);
        // Load the model.
        mobilenet.load().then((model: any) => {
          const img = document.getElementById('image');

          /** */
          // Classify the image.
          model.classify(img).then((predictions: any) => {
            console.log('Predictions: ');
            console.log(predictions);
          });
        });
      });

    /**
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
 */
  }

  ngOnDestroy() {}
}
