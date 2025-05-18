import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { OrderItem } from './order-item.model';
import { Invoice } from './invoice.model';

export interface Order {
  id?: number;
  customerId: number;
  customerEmail?: string;
  customerName?: string;
  orderDate?: Date;
  status?: OrderStatus;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  totalAmount?: number;
  shippingAddress?: string;
  billingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  notes?: string;
  items: OrderItem[];
  invoice?: Invoice;
}