import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TitanicComponent } from './titanic.component';
import { TitanicModule } from './titanic.module';

const routes: Routes = [
  {
    path: '',
    component: TitanicComponent,
    data: { title: 'Titanic' },
  },
];

export const TitanicRouting: ModuleWithProviders<TitanicModule> = RouterModule.forChild(routes);
