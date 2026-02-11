import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AccountDTO } from '../../../domain/dto/account-dto';
import { CustomerDTO } from '../../../domain/dto/customer-dto';
import { EAccount } from '../../../domain/enums/e-account';

@Component({
  selector: 'app-add-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './add-account.html',
  styleUrl: './add-account.css',
})
export class AddAccount implements OnInit {
  accountForm!: FormGroup;
  customers: CustomerDTO[] = [];
  accountStatuses: EAccount[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAccount>,
    @Inject(MAT_DIALOG_DATA) public data: { customers: CustomerDTO[] }
  ) {
    this.customers = data.customers || [];
  }

  ngOnInit(): void {
    this.accountStatuses = Object.values(EAccount).filter(
      value => value !== EAccount.API_ACCOUNT
    );
    this.initForm();
  }

  initForm(): void {
    this.accountForm = this.fb.group({
      customerId: ['', Validators.required],
      status: [EAccount.ACTIVE, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const formValue = this.accountForm.value;
      const account = new AccountDTO(
        '',
        formValue.customerId,
        '',
        formValue.status
      );
      this.dialogRef.close(account);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getStatusLabel(status: EAccount): string {
    const labels: Partial<Record<EAccount, string>> = {
      [EAccount.ACTIVE]: 'Activa',
      [EAccount.INACTIVE]: 'Inactiva',
    };
    return labels[status] || status;
  }
}
