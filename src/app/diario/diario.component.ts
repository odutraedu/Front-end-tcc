import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para usar [(ngModel)]
import { DiaryService } from '../services/diary.service'; // Serviço para integração com o back-end
import { Router } from '@angular/router'; // Importando o Router para navegação
import { DetalheModalComponent } from '../shared/detalhe-modal.component';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';


@Component({
  selector: 'app-diario',
  standalone: true,
  imports: [MenuComponent, CommonModule, FormsModule, DetalheModalComponent, NgChartsModule],
  templateUrl: './diario.component.html',
  styleUrls: ['./diario.component.css'],
})
export class DiarioComponent implements OnInit {
  // Propriedades para capturar os dados do formulário
  // Inicializa a data com a data local correta (yyyy-MM-dd)
  data: string = (() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  })();
  emocao: string = '';
  descricao: string = '';
  pesquisa: string = '';
  entradas: any[] = [];

  reasons = [
    { id: 1, nome: 'Trabalho' },
    { id: 2, nome: 'Família' },
    { id: 3, nome: 'Relacionamento' },
    { id: 4, nome: 'Estudos' },
    { id: 5, nome: 'Saúde' },
    { id: 6, nome: 'Financeiro' },
    { id: 7, nome: 'Amizades' },
    { id: 8, nome: 'Outro' },
    // Adicione aqui os motivos reais do seu seed
  ];
  reasonIdSelecionado: number | null = null;

  ansiedadeLareais = [
    {
      id: 1,
      titulo: 'Exercícios rápidos para fazer na mesa de trabalho',
      tipo: 'video',
      conteudo: 'https://www.youtube.com/embed/1nZEdqcGVzo', // Link embed correto
      descricao:
        'Vídeo demonstrando exercícios simples que ajudam a aliviar a tensão e melhorar o bem-estar durante o expediente. Assista e pratique junto!',
      categoria: 'Bem-estar',
      duracao: '7 min',
      icone: 'video',
    },
    {
      id: 2,
      titulo: 'Ansiedade no trabalho',
      tipo: 'texto',
      conteudo:
        'A ansiedade no trabalho é comum e pode ser causada por prazos, cobranças ou reuniões importantes. Técnicas de respiração, pausas curtas e organização das tarefas ajudam a controlar os sintomas. Se persistir, procure apoio profissional.',
      descricao:
        'Dicas práticas para lidar com ansiedade em situações profissionais.',
      categoria: 'Ansiedade',
      duracao: '',
      icone: 'texto',
    },
    {
      id: 3,
      titulo: 'Crise de ansiedade',
      tipo: 'audio',
      conteudo: 'assets/audios/ansiedade-crise.mp3',
      descricao:
        'Áudio de um relato real sobre uma crise de ansiedade e estratégias para superá-la.',
      categoria: 'Ansiedade',
      duracao: '2 min',
      icone: 'audio',
    },
  ];
  detalheSelecionado: any = null;

  // Dados para o gráfico de barras
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Emoções' }],
};
  barChartType: ChartType = 'bar';
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true }, // Exibe a legenda das emoções
      title: { display: true, text: 'Histórico de Emoções' },
      tooltip: {
        callbacks: {
          title: (items) => {
            // Mostra a data no tooltip
            if (items.length > 0) {
              return items[0].label || '';
            }
            return '';
          },
          label: (item) => {
            // Mostra a emoção e o valor
            return `${item.dataset.label}: ${item.formattedValue}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          display: false, // Esconde as datas do eixo X
        },
      },
      y: {
        title: { display: true, text: 'Quantidade' },
      },
    },
  };

  // Insights
  emocaoMaisFrequente: string = '-';
  nivelEnergia: string = '-';
  nivelEstresse: string = '-';
  filtroGrafico: 'semana' | 'mes' | 'ano' = 'semana';

  // Mapa de cores fixas para cada emoção
  private corEmocao: { [emocao: string]: string } = {
    'feliz': '#4caf50',      // verde
    'neutro': '#9e9e9e',    // cinza
    'triste': '#2196f3',    // azul
    'irritado': '#f44336',  // vermelho
    'ansioso': '#ff9800',   // laranja
    'cansado': '#7e57c2',   // roxo
    'raiva': '#f44336',     // vermelho
    'Sem emoção': '#bdbdbd' // cinza claro
  };

  constructor(private diaryService: DiaryService, private router: Router) {}

  ngOnInit(): void {
    // Garantir que o array reasons esteja inicializado corretamente
    this.reasons = [
      { id: 1, nome: 'Trabalho' },
      { id: 2, nome: 'Família' },
      { id: 3, nome: 'Relacionamento' },
      { id: 4, nome: 'Estudos' },
      { id: 5, nome: 'Saúde' },
      { id: 6, nome: 'Financeiro' },
      { id: 7, nome: 'Amizades' },
      { id: 8, nome: 'Outro' },
    ];

    console.log('Array reasons inicializado:', this.reasons);

    this.carregarEntradas();
  }

  onSubmit(): void {
    const novaEntrada = {
      date: this.data,
      emotion: this.emocao,
      description: this.descricao,
      reasonIds: this.reasonIdSelecionado ? [this.reasonIdSelecionado] : [],
    };

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Você precisa estar logado para criar uma entrada.');
      return;
    }

    this.diaryService.createDiaryEntry(novaEntrada, token).subscribe({
      next: () => {
        alert('Entrada criada com sucesso!');
        this.carregarEntradas();
        this.resetarFormulario();
      },
      error: (err) => {
        console.error('Erro ao criar entrada:', err);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Erro ao criar entrada. Tente novamente.';
        alert('Erro ao criar entrada: ' + JSON.stringify(msg));
      },
    });
  }

  carregarEntradas(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para visualizar o diário.');
      return;
    }
    this.diaryService.getDiaryEntries(token).subscribe({
      next: (data) => {
        console.log('Dados recebidos da API:', data); // LOG PARA DEPURAÇÃO
        this.entradas = data;
        this.calcularInsights();
        this.atualizarGraficoEmocoes();
      },
      error: (err) => {
        console.error('Erro ao carregar entradas:', err);
        alert('Erro ao carregar entradas. Tente novamente.');
      },
    });
  }

  calcularInsights() {
    if (!this.entradas || this.entradas.length === 0) {
      this.emocaoMaisFrequente = '-';
      this.nivelEnergia = '-';
      this.nivelEstresse = '-';
      return;
    }
    // Contar emoções
    const contagem: { [emocao: string]: number } = {};
    let energiaTotal = 0;
    let estresseTotal = 0;
    for (const entrada of this.entradas) {
      const emocao = entrada.emotion || 'Sem emoção';
      contagem[emocao] = (contagem[emocao] || 0) + 1;
      // Energia: feliz=2, neutro=1, triste/ansioso/irritado=0
      if (emocao === 'feliz') energiaTotal += 2;
      else if (emocao === 'neutro') energiaTotal += 1;
      // Estresse: ansioso/irritado contam como 1
      if (emocao === 'ansioso' || emocao === 'irritado') estresseTotal += 1;
    }
    // Emoção mais frequente
    this.emocaoMaisFrequente = Object.keys(contagem).reduce((a, b) => contagem[a] > contagem[b] ? a : b);
    // Nível de energia
    const mediaEnergia = energiaTotal / this.entradas.length;
    if (mediaEnergia >= 1.5) this.nivelEnergia = 'Alta';
    else if (mediaEnergia >= 1) this.nivelEnergia = 'Média';
    else this.nivelEnergia = 'Baixa';
    // Nível de estresse
    const percEstresse = estresseTotal / this.entradas.length;
    if (percEstresse >= 0.6) this.nivelEstresse = 'Alto';
    else if (percEstresse >= 0.3) this.nivelEstresse = 'Médio';
    else this.nivelEstresse = 'Baixo';
  }

  atualizarGraficoEmocoes() {
    let entradasFiltradas = this.entradas;
    let labels: string[] = [];
    let agrupado: { [label: string]: { [emocao: string]: number } } = {};
    if (this.filtroGrafico === 'semana') {
      const hoje = new Date();
      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(hoje.getDate() - 6);
      entradasFiltradas = this.entradas.filter((entrada) => {
        if (!entrada.date) return false;
        const data = new Date(entrada.date.split('T')[0]);
        return data >= umaSemanaAtras && data <= hoje;
      });
      // Agrupar por dia
      for (const entrada of entradasFiltradas) {
        const data = entrada.date ? entrada.date.split('T')[0] : 'Sem data';
        const emocao = entrada.emotion || 'Sem emoção';
        if (!agrupado[data]) agrupado[data] = {};
        agrupado[data][emocao] = (agrupado[data][emocao] || 0) + 1;
      }
      labels = Object.keys(agrupado).sort();
    } else if (this.filtroGrafico === 'mes') {
      // Filtrar apenas o mês atual
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      entradasFiltradas = this.entradas.filter((entrada) => {
        if (!entrada.date) return false;
        const [ano, mes] = entrada.date.split('T')[0].split('-').map(Number);
        return ano === anoAtual && mes === mesAtual;
      });
      // Agrupar por dia do mês atual
      for (const entrada of entradasFiltradas) {
        const data = entrada.date ? entrada.date.split('T')[0] : 'Sem data';
        const emocao = entrada.emotion || 'Sem emoção';
        if (!agrupado[data]) agrupado[data] = {};
        agrupado[data][emocao] = (agrupado[data][emocao] || 0) + 1;
      }
      labels = Object.keys(agrupado).sort();
    } else if (this.filtroGrafico === 'ano') {
      // Agrupar por ano (YYYY)
      for (const entrada of this.entradas) {
        if (!entrada.date) continue;
        const ano = entrada.date.split('T')[0].split('-')[0];
        const emocao = entrada.emotion || 'Sem emoção';
        if (!agrupado[ano]) agrupado[ano] = {};
        agrupado[ano][emocao] = (agrupado[ano][emocao] || 0) + 1;
      }
      labels = Object.keys(agrupado).sort();
    }
    // Obter todas as emoções únicas
    const emocoesSet = new Set<string>();
    labels.forEach((label) => {
      Object.keys(agrupado[label]).forEach((e) => emocoesSet.add(e));
    });
    const emocoes = Array.from(emocoesSet);
    // Montar datasets para cada emoção
    const datasets = emocoes.map((emocao) => ({
      label: emocao,
      data: labels.map((label) => agrupado[label][emocao] || 0),
      backgroundColor: this.corEmocao[emocao] || '#bdbdbd',
      borderColor: this.corEmocao[emocao] || '#bdbdbd',
      borderWidth: 1,
    }));
    this.barChartData = {
      labels: labels,
      datasets: datasets,
    };
  }

  selecionarFiltroGrafico(filtro: 'semana' | 'mes' | 'ano') {
    this.filtroGrafico = filtro;
    this.atualizarGraficoEmocoes();
  }

  resetarFormulario(): void {
    // Sempre define a data como a data atual no formato yyyy-MM-dd
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    this.data = `${ano}-${mes}-${dia}`;
    this.emocao = '';
    this.descricao = '';
  }

  navegarHistorico(): void {
    this.router.navigate(['/historico']);
  }

  navegarHome(): void {
    this.router.navigate(['/home']);
  }

  sair(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  abrirDetalhe(item: any) {
    this.detalheSelecionado = item;
  }

  fecharDetalhe() {
    this.detalheSelecionado = null;
  }
}
