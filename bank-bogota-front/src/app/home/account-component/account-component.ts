import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AccountService } from '../../domain/service/account-service';
import { CustomerService } from '../../domain/service/customer-service';
import { AccountDTO } from '../../domain/dto/account-dto';
import { CustomerDTO } from '../../domain/dto/customer-dto';
import { AddAccount } from './add-account/add-account';
import { EAccount } from '../../domain/enums/e-account';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-account-component',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    TooltipModule,
    MatDialogModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './account-component.html',
  styleUrl: './account-component.css',
})
export class AccountComponent implements OnInit {
  accounts: AccountDTO[] = [];
  customers: CustomerDTO[] = [];
  loading: boolean = false;

  constructor(
    private accountService: AccountService,
    private customerService: CustomerService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadAccounts();
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.data;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
          life: 5000
        });
      }
    });
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (response) => {
        this.accounts = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al Cargar',
          detail: error.message,
          life: 5000
        });
      }
    });
  }

  openAddAccountModal(): void {
    const dialogRef = this.dialog.open(AddAccount, {
      width: '600px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: { customers: this.customers }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createAccount(result);
      }
    });
  }

  createAccount(accountData: AccountDTO): void {
    this.loading = true;
    this.accountService.createAccount(accountData).subscribe({
      next: (response) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Cuenta Registrada',
          detail: response.message,
          life: 3000
        });
        this.loadAccounts();
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al Registrar',
          detail: error.message,
          life: 5000
        });
      }
    });
  }

  deleteAccount(account: AccountDTO): void {
    const customerName = this.getCustomerName(account.customerId);
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar la cuenta ${account.accountNumber} del cliente ${customerName}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.loading = true;
        this.accountService.deleteAccount(account.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Cuenta Eliminada',
              detail: 'La cuenta ha sido eliminada exitosamente.',
              life: 3000
            });
            this.loadAccounts();
          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error al Eliminar',
              detail: error.message,
              life: 5000
            });
          }
        });
      }
    });
  }

  getStatusLabel(status: EAccount): string {
    const labels: Partial<Record<EAccount, string>> = {
      [EAccount.ACTIVE]: 'Activa',
      [EAccount.INACTIVE]: 'Inactiva',
    };
    return labels[status] || status;
  }

  getStatusClass(status: EAccount): string {
    const classes: Partial<Record<EAccount, string>> = {
      [EAccount.ACTIVE]: 'status-active',
      [EAccount.INACTIVE]: 'status-inactive',
    };
    return classes[status] || '';
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.fullName : 'N/A';
  }
}
