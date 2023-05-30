import { Injectable } from '@angular/core';
import { NtsStateManagementService } from '@ntersol/state-management';
import { BehaviorSubject, Observable, filter, fromEvent, map, take, tap } from 'rxjs';
import { Passenger } from '../models';

@Injectable({ providedIn: 'root' })
export class TitanicService {
  /** Web worker used to train neural nets */
  private worker = new Worker('/assets/workers/train-neural-net.js');

  /** Listen to the web worker to receive trained models */
  public nnModelReceived$ = fromEvent<MessageEvent>(this.worker, 'message').pipe(filter(x => !!x && x.origin === ''));

  /** Passengers on the titanic */
  public passengers = this.sm.createEntityStore<Passenger>({ uniqueId: 'PassengerId', apiUrl: '/assets/datasets/titanic.json' });

  constructor(private sm: NtsStateManagementService) {}

  /**
   * Train a neural net with the provided dataset
   * @param trainingData
   * @param modelId
   * @returns
   */
  public trainNeuralNet$(trainingData: any, modelId?: string): Observable<{ data: any; timeStamp: number }> {
    if (modelId && localStorage.getItem('modelId')) {
      const model = JSON.parse(localStorage.getItem('modelId') || '{}');
      return new BehaviorSubject({
        data: model,
        timeStamp: 0,
      }).pipe(take(1));
    }
    this.worker.postMessage(trainingData); // send data to the worker
    return this.nnModelReceived$.pipe(
      tap(model => {
        if (modelId) {
          localStorage.setItem('modelId', JSON.stringify(model.data));
        }
      }),
      map(response => ({
        data: response.data,
        timeStamp: response.timeStamp,
      })),

      take(1),
    );
  }
}
