import { Routes } from "@angular/router";
import { DiarioComponent } from "../diario/diario.component";
import { LoginComponent } from "../login/login.component";
import { CadastroComponent } from "../Cadastro/cadastro.component";
import { HistoricoComponent } from "../diario/consulta/historico.component";
import { AuthGuard } from "./auth.guard";
import { EmBreveGuard } from "./em-breve.guard";
import { ConteudoEducacionalComponent } from "../conteudo-educacional/conteudo-educacional.component";
import { DashboardComponent } from "../dashboard/dashboard.component";

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "diario", component: DiarioComponent, canActivate: [AuthGuard] },
  {
    path: "conteudo-educacional",
    component: ConteudoEducacionalComponent,
    canActivate: [AuthGuard],
  },
  { path: "login", component: LoginComponent },
  { path: "cadastro", component: CadastroComponent },
  {
    path: "historico",
    component: HistoricoComponent,
    canActivate: [AuthGuard],
  },
  { path: "home", canActivate: [EmBreveGuard], component: LoginComponent },
  { path: "**", redirectTo: "dashboard" },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
];
