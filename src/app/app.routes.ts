import { Routes } from '@angular/router';
import { ReceitaComponent } from './pages/receita/receita';
import { ReceitaFormComponent } from './pages/receita-form/receita-form';

export const routes: Routes = [
  { path: '', component: ReceitaComponent },
  { path: 'receitas', component: ReceitaComponent },
  { path: 'receitas/novo', component: ReceitaFormComponent },
  { path: 'receitas/editar/:id', component: ReceitaFormComponent }, // Rota com parâmetro ID
];
