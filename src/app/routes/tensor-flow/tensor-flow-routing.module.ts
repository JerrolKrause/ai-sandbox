import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TensorFlowComponent } from './tensor-flow.component';
import { TensorFlowModule } from './tensor-flow.module';

const routes: Routes = [
  {
    path: '',
    component: TensorFlowComponent,
    data: { title: 'TensorFlow' },
  },
];

export const TensorFlowRouting: ModuleWithProviders<TensorFlowModule> = RouterModule.forChild(routes);
