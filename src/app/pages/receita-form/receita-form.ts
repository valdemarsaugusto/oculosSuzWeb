import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReceitaService } from '../../services/receita';

@Component({
  selector: 'app-receita-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './receita-form.html'
})
export class ReceitaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private receitaService = inject(ReceitaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  // Signals para gerenciar o estado da tela
  isLoading = signal(false);
  isEdit = signal(false);
  idEdicao = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    odEsf: ['', Validators.required],
    odCil: ['', Validators.required],
    odEixo: ['', Validators.required],
    odDnp: ['', Validators.required],
    oeEsf: ['', Validators.required],
    oeCil: ['', Validators.required],
    oeEixo: ['', Validators.required],
    oeDnp: ['', Validators.required],
  });

  totalNaBase = signal<number>(0);

  ngOnInit(): void {
    this.obterContagem(); // Busca o total ao abrir a tela

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.idEdicao.set(Number(id));
      this.carregarDados(Number(id));
    }
  }

  private carregarDados(id: number): void {
    this.isLoading.set(true);
    this.receitaService.BuscarReceitaPorId(id).subscribe({
      next: (res) => {
        this.form.patchValue(res.dados);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Erro ao carregar dados da receita');
        this.cancelar();
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.toastr.warning('Preencha todos os campos obrigatórios.');
      return;
    }

    this.isLoading.set(true);
    const dados = this.form.value;

    if (this.isEdit()) {
      // LÓGICA DE EDIÇÃO: Continua voltando para a lista após salvar
      this.receitaService.AtualizarReceita(this.idEdicao()!, dados).subscribe({
        next: () => {
          this.toastr.success('Receita atualizada com sucesso!');
          this.cancelar(); // Volta para a listagem
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error('Erro ao atualizar receita.');
        }
      });
    } else {
      // LÓGICA DE CADASTRO: Limpa o form e permanece na tela
      this.receitaService.CriarReceita(dados).subscribe({
        next: () => {
          //this.toastr.success('Receita cadastrada com sucesso!');
        // 1. Aumenta o contador na tela sem precisar recarregar do banco
          this.totalNaBase.update(total => total + 1);
        // 2. Limpa o formulário para o próximo
          this.form.reset();
        // 3. Para o loading
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error('Erro ao cadastrar receita.');
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/receitas']);
  }

  private obterContagem(): void {
    this.receitaService.BuscarReceita().subscribe({
      next: (res) => {
        // Pega o tamanho do array que vem da base
        console.log(res.dados);
        const total = res.dados?.length ?? 0;
        this.totalNaBase.set(total);
      }
    });
  }
}