import { Component, computed, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { ReceitaService } from '../../services/receita';
import { ReceitaModel } from '../../models/receitaModel';
import { RouterLink } from '@angular/router';
import * as XLSX from 'xlsx'; // Importação da biblioteca

@Component({
  selector: 'app-receita',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './receita.html',
  styleUrl: './receita.css',
})
export class ReceitaComponent implements OnInit {
  // 1. Injeção de dependência moderna (opcional, mas recomendada)
  private receitaService = inject(ReceitaService);
  private toastr = inject(ToastrService);

  // 2. Signals de estado necessários
  receitasGeral = signal<ReceitaModel[]>([]);

  isLoading: WritableSignal<boolean> = signal<boolean>(false);
  termoBusca = signal('');

  receitasFiltradas: WritableSignal<ReceitaModel[]> = signal<ReceitaModel[]>([]);
  // 3. O 'computed' substitui a necessidade da variável 'receitas' e da função 'pesquisar'

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.isLoading.set(true);
    this.receitaService.BuscarReceita().subscribe({
      next: (response) => {
        const dados = response.dados ?? [];
        this.receitasGeral.set(dados);      // Guarda a lista completa (referência)
        this.receitasFiltradas.set(dados); // Mostra a lista completa na tabela
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error('Erro ao carregar receitas.');
      }
    });
  }

  remover(id: number): void {
    const ok = confirm('Deseja remover esta receita?');
    if (!ok) return;

    this.receitaService.RemoverReceita(id).subscribe({
      next: () => {
        // 1. Atualiza a lista que a tabela está exibindo no momento
        this.receitasFiltradas.update(lista => lista.filter(r => r.id !== id));
        
        // 2. Atualiza a lista geral para manter a consistência em futuras buscas
        this.receitasGeral.update(lista => lista.filter(r => r.id !== id));

        this.toastr.success('Receita removida com sucesso.');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Não foi possível remover a receita.');
      }
    });
  }

  // Esta função agora apenas atualiza o termo, o 'computed' faz o resto
  atualizarBusca(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = input.value.toLowerCase().trim(); // Remove espaços e ignora maiúsculas

    if (valor.length > 0) {
      // Filtra localmente sem ir ao servidor (muito mais rápido)
      const filtrados = this.receitasGeral().filter(receita => 
        receita.ordemServico.toLowerCase().includes(valor) || 
        receita.nomeCliente.toLowerCase().includes(valor)
      );
      this.receitasFiltradas.set(filtrados);
    } else {
      // Se o campo for limpo, restaura a lista original instantaneamente
      this.receitasFiltradas.set(this.receitasGeral());
    }
  }

  buscarReceitaNoServidor(valor: string) {
    this.isLoading.set(true);

    this.receitaService.BuscarReceita().subscribe({
      next: (resultado) => {
        // Se resultado.dados for null, salvamos [] para não quebrar o .length no HTML
        const dadosGarantidos = resultado.dados ?? []; 
        this.receitasFiltradas.set(dadosGarantidos);
        this.isLoading.set(false);
      },
      error: () => {
        this.receitasFiltradas.set([]); // Garante array vazio no erro
        this.isLoading.set(false);
      }
    });
  }

  listarTodasReceitas() {
    this.isLoading.set(true);
    this.receitaService.BuscarReceita().subscribe({
      next: (resultado) => {
        console.log(resultado);
        if (resultado && resultado.dados) {
          this.receitasFiltradas.set(resultado.dados);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.receitasFiltradas.set([]);
      }
    });
  }

  exportarExcel(): void {
    // 1. Selecionamos os dados. Usamos o receitasFiltradas() para exportar o que está na tela
    const dados = this.receitasFiltradas();

    if (dados.length === 0) {
      this.toastr.warning('Não há dados para exportar.');
      return;
    }

    // 2. Formatamos os dados para que o Excel tenha cabeçalhos bonitos
    const dadosFormatados = dados.map(r => ({
      'OS': r.ordemServico,
      'Nome Cliente:': r.nomeCliente,
      'OD Esf': r.odEsf,
      'OD Cil': r.odCil,
      'OD Eixo': r.odEixo,
      'OD DNP': r.odDnp,
      'OE Esf': r.oeEsf,
      'OE Cil': r.oeCil,
      'OE Eixo': r.oeEixo,
      'OE DNP': r.oeDnp
    }));

    // 3. Criamos a planilha
    const planilha = XLSX.utils.json_to_sheet(dadosFormatados);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, 'Receitas');

    // 4. Geramos o arquivo e iniciamos o download
    XLSX.writeFile(livro, `Relatorio_Receitas_${new Date().toLocaleDateString()}.xlsx`);
    
    this.toastr.info('Planilha gerada com sucesso!');
  }
}