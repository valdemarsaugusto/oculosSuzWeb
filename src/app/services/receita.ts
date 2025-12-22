import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../models/responseModel';
import { ReceitaModel } from '../models/receitaModel';
import { ReceitaCreateDto } from '../models/receitaCreateDto';
import { ReceitaUpdateDto } from '../models/receitaUpdateDto';

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  
  ApiUrl = environment.ApiUrl;

  constructor(private http: HttpClient){}

  BuscarReceita() : Observable<Response<ReceitaModel[]>> {
    return this.http.get<Response<ReceitaModel[]>>(`${this.ApiUrl}/Receita`)
  }

  BuscarReceitaPorId(id: number) : Observable<Response<ReceitaModel[]>> {
    return this.http.get<Response<ReceitaModel[]>>(`${this.ApiUrl}/Receita/${id}`)
  }

  RemoverReceita(id: number):Observable<Response<ReceitaModel>>{
    return this.http.delete<Response<ReceitaModel>>(`${this.ApiUrl}/Receita/${id}`)
  }

  CriarReceita(receitaCreateDto: ReceitaCreateDto): Observable<Response<ReceitaCreateDto>> {
    return this.http.post<Response<ReceitaCreateDto>>(`${this.ApiUrl}/Receita`, receitaCreateDto);
  }

  AtualizarReceita(id: number, receitaUpdateDto: ReceitaUpdateDto): Observable<Response<ReceitaUpdateDto>> {
    receitaUpdateDto.id = id;
    return this.http.put<Response<ReceitaUpdateDto>>(`${this.ApiUrl}/Receita`, receitaUpdateDto);
  }
}
