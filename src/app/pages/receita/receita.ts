import { Component, computed, OnInit, signal, inject } from '@angular/core';
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
  isLoading = signal<boolean>(true);
  termoBusca = signal('');

  // 3. O 'computed' substitui a necessidade da variável 'receitas' e da função 'pesquisar'
  receitasFiltradas = computed(() => {
    const termo = this.termoBusca().toLowerCase();
    const listaCompleta = this.receitasGeral();

    if (!termo) return listaCompleta;

    return listaCompleta.filter(r => 
      r.id.toString().toLowerCase().includes(termo)
    );
  });

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.isLoading.set(true);

    this.receitaService.BuscarReceita().subscribe({
      next: (response) => {
        const dados = response.dados ?? [];
        this.receitasGeral.set(dados);
        this.isLoading.set(false);
        this.toastr.success('Receitas carregadas com sucesso.');
      },
      error: (err) => {
        console.error(err);
        this.receitasGeral.set([]);
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
        // Ao atualizar o 'receitasGeral', o 'receitasFiltradas' atualiza a tela na hora!
        this.receitasGeral.update(prev => prev.filter(r => r.id !== id));
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
    const valor = (event.target as HTMLInputElement).value;
    this.termoBusca.set(valor);
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
      'ID': r.id,
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