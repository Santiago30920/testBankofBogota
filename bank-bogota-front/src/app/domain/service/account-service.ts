import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AccountDTO } from '../dto/account-dto';
import { ApiResponseDTO } from '../dto/api-response-dto';
import { environment } from '../../../environments/environment';
import { EAccount } from '../enums/e-account';
import { UtilitieService } from './utilitie-service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
      private readonly apiUrl: string = `${environment.host}`+EAccount.API_ACCOUNT;

    constructor(private http: HttpClient, private utilitieService: UtilitieService) {}

    createAccount(account: AccountDTO): Observable<ApiResponseDTO<AccountDTO>> {
        return this.http.post<ApiResponseDTO<AccountDTO>>(this.apiUrl, account)
            .pipe(catchError(this.utilitieService.handleError));
    }

    getAccountsByCustomerId(customerId: string): Observable<ApiResponseDTO<AccountDTO>> {
        const params = new HttpParams().set('customerId', customerId);
        return this.http.get<ApiResponseDTO<AccountDTO>>(this.apiUrl, { params })
            .pipe(catchError(this.utilitieService.handleError));
    }

    getAllAccounts(): Observable<ApiResponseDTO<AccountDTO>> {
        return this.http.get<ApiResponseDTO<AccountDTO>>(this.apiUrl)
            .pipe(catchError(this.utilitieService.handleError));
    }

    deleteAccount(id: string): Observable<ApiResponseDTO<void>> {
        return this.http.delete<ApiResponseDTO<void>>(`${this.apiUrl}/${id}`)
            .pipe(catchError(this.utilitieService.handleError));
    }
}
