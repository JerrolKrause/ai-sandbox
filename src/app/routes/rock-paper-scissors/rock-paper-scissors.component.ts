import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
// Import the library
// const brain = require('brain.js');
declare var brain: any;

enum RPS {
  rock,
  paper,
  scissors,
}

@Component({
  selector: 'app-rock-paper-scissors',
  templateUrl: './rock-paper-scissors.component.html',
  styleUrls: ['./rock-paper-scissors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RockPaperScissorsComponent implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit() {
    // Create a new neural network instance
    const net = new brain.NeuralNetwork();

    // Train the network
    net.train([
      { input: [RPS.paper, RPS.rock], output: [RPS.paper] },
      { input: [RPS.paper, RPS.scissors], output: [RPS.scissors] },
      { input: [RPS.scissors, RPS.rock], output: [RPS.rock] },
    ]);

    console.log(net.run([RPS.paper, RPS.rock]));
    console.log(net.run([RPS.rock, RPS.paper]));
    console.log(net.run([RPS.scissors, RPS.rock]));

    const output = net.run([RPS.scissors, RPS.rock]);
    console.warn(output.indexOf(Math.max(...output)));

    // Predict the output for a given input
    // const output1 = net.run([0, 1]); // should be approximately 1
    // const output2 = net.run([1, 1]); // should be approximately 0

    //console.log('Output for [0, 1]:', output1);
    // console.log('Output for [1, 1]:', output2);
  }

  ngOnDestroy() {}
}
