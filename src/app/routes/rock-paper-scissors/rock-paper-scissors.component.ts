import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-rock-paper-scissors',
  templateUrl: './rock-paper-scissors.component.html',
  styleUrls: ['./rock-paper-scissors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RockPaperScissorsComponent implements OnInit, OnDestroy {
  name = 'rockPaperScissors';
  constructor() {} // public uiState: UiStateService, // Global UI state // private domainState: DomainService, // Global domain state

  ngOnInit() {}

  ngOnDestroy() {}
}
