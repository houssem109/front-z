export interface OrderItem {
  id?: number;
  productId: number;
  productName?: string;
  productSku?: string;
  price?: number;
  quantity: number;
  totalPrice?: number;
}