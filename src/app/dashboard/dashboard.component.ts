import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MenuComponent } from "../menu/menu.component";
import { FormsModule } from "@angular/forms";

interface Colaborador {
  id: number;
  nome: string;
  departamento: string;
  bemEstar: number; // 0-10
  risco: boolean;
}

interface DepartamentoAnalise {
  nome: string;
  mediaBemEstar: number;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  colaboradores: Colaborador[] = [];
  departamentos: DepartamentoAnalise[] = [];
  colaboradoresEmRisco: Colaborador[] = [];
  metricas = {
    ativos: 0,
    bemEstarGeral: 0,
    variacaoBemEstar: -0.5,
    altoRisco: 0,
    altoRiscoPercent: 0,
    sessoesTerapia: 0,
    variacaoSessoes: 0.23,
  };
  showIA: boolean = true;
  iaMensagem: string =
    "Olá! Sou sua assistente de IA para análise de bem-estar dos colaboradores. Posso ajudar você a identificar riscos psicossociais, analisar tendências emocionais e sugerir ações para melhorar o clima da equipe.";
  busca: string = "";
  resultadosBusca: Colaborador[] = [];

  ngOnInit() {
    // Simulação de dados. Trocar por chamada ao backend futuramente.
    this.colaboradores = [
      {
        id: 1,
        nome: "João Silva",
        departamento: "Vendas",
        bemEstar: 3,
        risco: true,
      },
      {
        id: 2,
        nome: "Maria Souza",
        departamento: "Marketing",
        bemEstar: 4.3,
        risco: false,
      },
      {
        id: 3,
        nome: "Carlos Lima",
        departamento: "TI",
        bemEstar: 8,
        risco: false,
      },
      {
        id: 4,
        nome: "Ana Paula",
        departamento: "Vendas",
        bemEstar: 2.5,
        risco: true,
      },
      {
        id: 5,
        nome: "Fernanda Alves",
        departamento: "Marketing",
        bemEstar: 5,
        risco: false,
      },
    ];
    this.metricas.ativos = this.colaboradores.length;
    this.metricas.bemEstarGeral = this.mediaBemEstarGeral();
    this.colaboradoresEmRisco = this.colaboradores.filter((c) => c.risco);
    this.metricas.altoRisco = this.colaboradoresEmRisco.length;
    this.metricas.altoRiscoPercent = Math.round(
      (this.metricas.altoRisco / this.metricas.ativos) * 100
    );
    this.metricas.sessoesTerapia = 127;
    this.departamentos = this.analisePorDepartamento();
  }

  mediaBemEstarGeral(): number {
    if (!this.colaboradores.length) return 0;
    const soma = this.colaboradores.reduce((acc, c) => acc + c.bemEstar, 0);
    return +(soma / this.colaboradores.length).toFixed(1);
  }

  analisePorDepartamento(): DepartamentoAnalise[] {
    const map = new Map<string, number[]>();
    this.colaboradores.forEach((c) => {
      if (!map.has(c.departamento)) map.set(c.departamento, []);
      map.get(c.departamento)!.push(c.bemEstar);
    });
    return Array.from(map.entries()).map(([nome, arr]) => ({
      nome,
      mediaBemEstar: +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1),
    }));
  }

  buscarColaborador() {
    const termo = this.busca.trim().toLowerCase();
    if (!termo) {
      this.resultadosBusca = [];
      return;
    }
    this.resultadosBusca = this.colaboradores.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.departamento.toLowerCase().includes(termo)
    );
  }

  // Simulação de ações recomendadas pela IA
  get acoesRecomendadas() {
    return [
      { texto: "Conversa urgente com João Silva", cor: "#F44336" },
      { texto: "Revisar metas do time de Vendas", cor: "#FF9800" },
      { texto: "Enviar convite para sessão de terapia", cor: "#2196F3" },
    ];
  }
}
