import { PaymentStatus } from './enums/payment-status.enum';

export interface Invoice {
  id?: number;
  invoiceNumber?: string;
  orderId: number;
  issuedDate?: Date;
  dueDate?: Date;
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  total: number;
  paymentStatus: PaymentStatus;
  notes?: string;
}