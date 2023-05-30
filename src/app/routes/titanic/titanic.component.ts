import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, debounceTime, take } from 'rxjs';
import { Memoize } from '../../shared';

declare var brain: any;

type Nillable<T> = {
  [P in keyof T]?: T[P] | null | undefined;
};

interface State {
  loading: boolean;
  survivalOdds: number | null;
}

interface Passenger {
  PassengerId: number;
  Survived: number;
  Pclass: number;
  Name: string;
  Sex: string;
  Age: number;
  SibSp: number;
  Parch: number;
  Ticket: number;
  Fare: number;
  Cabin: string;
  Embarked: string;
}

interface PassengerNormalized {
  PassengerId: number;
  Survived?: number;
  Pclass: number;
  Sex: number;
  Age: number;
  SibSp: number;
  Parch: number;
  Fare: number;
}

@Component({
  selector: 'app-titanic',
  templateUrl: './titanic.component.html',
  styleUrls: ['./titanic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitanicComponent implements OnInit, OnDestroy {
  public state$ = new BehaviorSubject<State>({ loading: true, survivalOdds: null });

  public passengerForm = this.fb.group<PassengerNormalized>({
    PassengerId: 0,
    Pclass: 0,
    Sex: 0,
    Age: 0,
    SibSp: 0,
    Parch: 0,
    Fare: 0,
  });

  public sexOptions = [
    { label: 'Male', value: 1 },
    { label: 'Female', value: 0 },
  ];

  public siblingOptions = [
    { label: 0, value: this.normalizeNumberRange(0, 0, 8) },
    { label: 1, value: this.normalizeNumberRange(1, 0, 8) },
    { label: 2, value: this.normalizeNumberRange(2, 0, 8) },
    { label: 3, value: this.normalizeNumberRange(3, 0, 8) },
    { label: 4, value: this.normalizeNumberRange(4, 0, 8) },
    { label: 5, value: this.normalizeNumberRange(5, 0, 8) },
    { label: 6, value: this.normalizeNumberRange(6, 0, 8) },
    { label: 7, value: this.normalizeNumberRange(7, 0, 8) },
    { label: 8, value: this.normalizeNumberRange(8, 0, 8) },
  ];

  public classOptions = [
    { label: '1st Class', value: this.normalizeNumberRange(1, 1, 3) },
    { label: '2nd Class', value: this.normalizeNumberRange(2, 1, 3) },
    { label: '3rd Class', value: this.normalizeNumberRange(3, 1, 3) },
  ];

  private net = new brain.NeuralNetworkGPU();

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.passengerForm.reset();
    this.passengerForm.valueChanges.pipe(takeUntilDestroyed(), debounceTime(250)).subscribe(passenger => this.formChange(passenger));
  }

  ngOnInit() {
    this.http.get<Passenger[]>('assets/datasets/titanic.json').subscribe(dataset => {
      // dataset.length = 5;
      // console.log('1-0', this.normalizePassengers(dataset));
      // const passengers = dataset.map(this.normalizePassenger);
      const passengers = this.normalizePassengers(dataset);

      console.time('Training NN took');
      // Create a new neural network instance
      // const net = new brain.NeuralNetworkGPU();
      this.net.train(passengers);
      console.timeEnd('Training NN took');
      this.stateChange({ loading: false });
    });
  }

  /**
   * Change route state
   * @param state
   */
  private stateChange(state: Partial<State>) {
    this.state$.pipe(take(1)).subscribe(stateOld => this.state$.next({ ...stateOld, ...state }));
  }

  private formChange(passenger: Nillable<PassengerNormalized>) {
    const result = this.net.run(passenger);
    this.stateChange({ survivalOdds: Math.floor(result.Survived * 100) });
  }

  /**
   * Normalizes a number to a range between 0 and 1.
   *
   * @param {number} value - The number to be normalized.
   * @param {number} min - The minimum value in the range of the input.
   * @param {number} max - The maximum value in the range of the input.
   * @returns {number} - The normalized number, now within a range of 0 to 1.
   *
   * @private
   */
  private normalizeNumberRange(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  /**
   * Denormalizes a number from a range of 0 to 1 back to its original range.
   *
   * @param {number} value - The number to be denormalized (expected to be in the range [0,1]).
   * @param {number} min - The minimum value of the original range.
   * @param {number} max - The maximum value of the original range.
   * @returns {number} - The denormalized number, now within the range defined by `min` and `max`.
   *
   * @private
   */
  private denormalizeNumberRange(value: number, min: number, max: number): number {
    return value * (max - min) + min;
  }

  /**
   *
   * @param passengers
   * @returns
   */
  @Memoize()
  private determineValidRanges(passengers: Passenger[]) {
    // First, we calculate the range of each field
    const ranges = passengers.reduce(
      (acc, passenger) => {
        return {
          PassengerId: [Math.min(acc.PassengerId[0], passenger.PassengerId), Math.max(acc.PassengerId[1], passenger.PassengerId)],
          Survived: [Math.min(acc.Survived[0], passenger.Survived), Math.max(acc.Survived[1], passenger.Survived)],
          Pclass: [Math.min(acc.Pclass[0], passenger.Pclass), Math.max(acc.Pclass[1], passenger.Pclass)],
          Age: [Math.min(acc.Age[0], passenger.Age), Math.max(acc.Age[1], passenger.Age)],
          SibSp: [Math.min(acc.SibSp[0], passenger.SibSp), Math.max(acc.SibSp[1], passenger.SibSp)],
          Parch: [Math.min(acc.Parch[0], passenger.Parch), Math.max(acc.Parch[1], passenger.Parch)],
          Fare: [Math.min(acc.Fare[0], passenger.Fare), Math.max(acc.Fare[1], passenger.Fare)],
        };
      },
      {
        PassengerId: [Infinity, -Infinity],
        Survived: [Infinity, -Infinity],
        Pclass: [Infinity, -Infinity],
        Age: [Infinity, -Infinity],
        SibSp: [Infinity, -Infinity],
        Parch: [Infinity, -Infinity],
        Fare: [Infinity, -Infinity],
      },
    );
    return ranges;
  }

  private normalizePassenger(passenger: Passenger) {
    // const ranges = this.determineValidRanges(passengers);
    return;
  }

  normalizePassengers(passengers: Passenger[]) {
    const ranges = this.determineValidRanges(passengers);
    // Then, we normalize each passenger
    return passengers.map(passenger => {
      return {
        input: {
          PassengerId: (passenger.PassengerId - ranges.PassengerId[0]) / (ranges.PassengerId[1] - ranges.PassengerId[0]),
          Survived: (passenger.Survived - ranges.Survived[0]) / (ranges.Survived[1] - ranges.Survived[0]),
          Pclass: (passenger.Pclass - ranges.Pclass[0]) / (ranges.Pclass[1] - ranges.Pclass[0]),
          Sex: passenger.Sex === 'male' ? 1 : 0, // We treat 'Sex' as a categorical variable
          Age: (passenger.Age - ranges.Age[0]) / (ranges.Age[1] - ranges.Age[0]),
          SibSp: (passenger.SibSp - ranges.SibSp[0]) / (ranges.SibSp[1] - ranges.SibSp[0]),
          Parch: (passenger.Parch - ranges.Parch[0]) / (ranges.Parch[1] - ranges.Parch[0]),
          // Ticket: passenger.Ticket, // 'Ticket' is a unique string identifier and cannot be meaningfully normalized
          Fare: (passenger.Fare - ranges.Fare[0]) / (ranges.Fare[1] - ranges.Fare[0]),
          // Cabin: passenger.Cabin, // 'Cabin' is a categorical variable and cannot be meaningfully normalized
          // Embarked: passenger.Embarked, // 'Embarked' is a categorical variable and cannot be meaningfully normalized
        },
        // output: [passenger.Survived],
        /** */
        output: {
          Survived: passenger.Survived,
        },
      };
    });
  }

  ngOnDestroy() {}
}
