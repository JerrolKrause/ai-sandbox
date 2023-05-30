import { Injectable } from '@angular/core';
import { NtsStateManagementService } from '@ntersol/state-management';
import { filter, fromEvent, take } from 'rxjs';
import { Passenger } from '../models';

@Injectable({ providedIn: 'root' })
export class TitanicService {
  /** Web worker used to train neural nets */
  private worker = new Worker('/assets/workers/train-neural-net.js');

  /** Listen to the web worker to receive trained models */
  public nnModelReceived$ = fromEvent<MessageEvent>(this.worker, 'message').pipe(filter(x => !!x && x.origin === ''));

  public passengers = this.sm.createEntityStore<Passenger>({ uniqueId: 'PassengerId', apiUrl: '/assets/datasets/titanic.json' });

  constructor(private sm: NtsStateManagementService) {}

  public trainNeuralNet$(trainingData: any) {
    this.worker.postMessage(trainingData); // send data to the worker
    return this.nnModelReceived$.pipe(take(1));
  }
}
