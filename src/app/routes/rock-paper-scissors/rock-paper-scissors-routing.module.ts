import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RockPaperScissorsComponent } from './rock-paper-scissors.component';
import { RockPaperScissorsModule } from './rock-paper-scissors.module';

const routes: Routes = [
  {
    path: '',
    component: RockPaperScissorsComponent,
    data: { title: 'RockPaperScissors' },
  },
];

export const RockPaperScissorsRouting: ModuleWithProviders<RockPaperScissorsModule> = RouterModule.forChild(routes);
