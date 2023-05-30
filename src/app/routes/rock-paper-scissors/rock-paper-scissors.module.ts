import { MasterPageModule } from '$components';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RockPaperScissorsRouting } from './rock-paper-scissors-routing.module';
import { RockPaperScissorsComponent } from './rock-paper-scissors.component';

@NgModule({
  declarations: [RockPaperScissorsComponent],
  imports: [CommonModule, RockPaperScissorsRouting, MasterPageModule],
})
export class RockPaperScissorsModule {}
