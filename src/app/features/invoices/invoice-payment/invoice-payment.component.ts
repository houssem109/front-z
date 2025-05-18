// src/app/features/invoices/invoice-payment/invoice-payment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../core/models/invoice.model';
import { PaymentStatus } from '../../../core/models/enums/payment-status.enum';

@Component({
  selector: 'app-invoice-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './invoice-payment.component.html',
  styleUrls: ['./invoice-payment.component.scss']
})
export class InvoicePaymentComponent implements OnInit {
  invoice: Invoice | null = null;
  paymentForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  
  // Payment method options
  paymentMethods = [
    { id: 'credit-card', name: 'Credit Card' },
    { id: 'bank-transfer', name: 'Bank Transfer' },
    { id: 'paypal', name: 'PayPal' },
    { id: 'cash', name: 'Cash' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadInvoice(+id);
      } else {
        this.errorMessage = 'Invoice ID is missing';
        this.isLoading = false;
      }
    });
  }

  initializeForm(): void {
    this.paymentForm = this.fb.group({
      paymentMethod: ['credit-card', Validators.required],
      cardNumber: ['', [Validators.pattern(/^\d{16}$/)]],
      cardExpiry: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cardCvv: ['', [Validators.pattern(/^\d{3,4}$/)]],
      accountNumber: [''],
      routingNumber: [''],
      paypalEmail: ['', [Validators.email]],
      notes: ['']
    });
  }

  loadInvoice(id: number): void {
    this.isLoading = true;
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.isLoading = false;
        
        // If invoice is already paid, redirect to detail page
        if (invoice.paymentStatus === PaymentStatus.PAID) {
          this.router.navigate(['/invoices', invoice.id]);
        }
      },
      error: (error) => {
        console.error('Error loading invoice', error);
        this.errorMessage = 'Error loading invoice. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onPaymentMethodChange(method: string): void {
    // Reset the validation on form controls based on selected payment method
    const cardControls = ['cardNumber', 'cardExpiry', 'cardCvv'];
    const bankControls = ['accountNumber', 'routingNumber'];
    const paypalControls = ['paypalEmail'];
    
    // Reset all controls first
    [...cardControls, ...bankControls, ...paypalControls].forEach(control => {
      this.paymentForm.get(control)?.clearValidators();
      this.paymentForm.get(control)?.updateValueAndValidity();
    });
    
    // Set validators based on selected method
    if (method === 'credit-card') {
      this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      this.paymentForm.get('cardExpiry')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      this.paymentForm.get('cardCvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else if (method === 'bank-transfer') {
      this.paymentForm.get('accountNumber')?.setValidators([Validators.required]);
      this.paymentForm.get('routingNumber')?.setValidators([Validators.required]);
    } else if (method === 'paypal') {
      this.paymentForm.get('paypalEmail')?.setValidators([Validators.required, Validators.email]);
    }
    
    // Update validation status
    [...cardControls, ...bankControls, ...paypalControls].forEach(control => {
      this.paymentForm.get(control)?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.invoice || !this.invoice.id) return;
    
    this.isSubmitting = true;
    
    // In a real app, you would process the payment here
    // For this demo, we'll just mark the invoice as paid
    this.invoiceService.updateInvoicePaymentStatus(this.invoice.id, PaymentStatus.PAID).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/invoices', this.invoice?.id]);
      },
      error: (error) => {
        console.error('Error processing payment', error);
        this.errorMessage = 'Error processing payment. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  isInvoiceOverdue(invoice: Invoice): boolean {
    if (!invoice.dueDate || invoice.paymentStatus === PaymentStatus.PAID) {
      return false;
    }
    
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    return dueDate < today;
  }
}