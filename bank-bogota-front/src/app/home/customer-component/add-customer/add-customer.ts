import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CustomerDTO } from '../../../domain/dto/customer-dto';
import { DocumentType } from '../../../domain/enums/document-type.enum';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CustomerService } from '../../../domain/service/customer-service';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.css',
})
export class AddCustomer implements OnInit {
  customerForm!: FormGroup;
  documentTypes = Object.values(DocumentType);
  isSubmitting = false;
  loading: boolean = false;
  isEditMode: boolean = false;
  customerId?: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCustomer>,
    private messageService: MessageService,
    private customerService: CustomerService,
    @Inject(MAT_DIALOG_DATA) public data?: CustomerDTO
  ) {
    if (data) {
      this.isEditMode = true;
      this.customerId = data.id;
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditMode && this.data) {
      this.loadCustomerData();
    }
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      documentType: [DocumentType.CC, Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]]
    });
  }

  loadCustomerData(): void {
    if (this.data) {
      this.customerForm.patchValue({
        documentType: this.data.documentType,
        documentNumber: this.data.documentNumber,
        fullName: this.data.fullName,
        email: this.data.email
      });
    }
  }

  onSubmit(): void {
    if (this.customerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      try {
        const formValue = this.customerForm.value;
        const customer = new CustomerDTO(
          this.customerId || '',
          formValue.documentType,
          formValue.documentNumber,
          formValue.fullName,
          formValue.email
        );
        
        if (this.isEditMode && this.customerId) {
          this.updateCustomer(customer);
        } else {
          this.createCustomer(customer);
        }
      } catch (error) {
        console.error('Error al procesar el cliente:', error);
        this.isSubmitting = false;
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getDocumentTypeLabel(type: DocumentType): string {
    const labels: Record<DocumentType, string> = {
      [DocumentType.CC]: 'Cédula de Ciudadanía',
      [DocumentType.CE]: 'Cédula de Extranjería',
      [DocumentType.NIT]: 'NIT',
      [DocumentType.TI]: 'Tarjeta de Identidad',
      [DocumentType.PASAPORTE]: 'Pasaporte'
    };
    return labels[type];
  }

  createCustomer(customerData: CustomerDTO): void {
    this.loading = true;
    this.customerService.createCustomer(customerData).subscribe({
      next: (response) => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al Registrar',
          detail: error.message,
          life: 5000
        });
      }
    });
  }

  updateCustomer(customerData: CustomerDTO): void {
    this.loading = true;
    this.customerService.updateCustomer(this.customerId!, customerData).subscribe({
      next: (response) => {
        this.dialogRef.close({ updated: true });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al Actualizar',
          detail: error.message,
          life: 5000
        });
      }
    });
  }
}
