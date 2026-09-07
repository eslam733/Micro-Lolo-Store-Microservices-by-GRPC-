import { getProduct } from './products';

export type Order = {
  id: string;
  status: string;
  total_price: number;
};

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundError';
  }
}

export function createOrder(productId: string, quantity: number): Order {
  const product = getProduct(productId);

  if (!product) {
    throw new ProductNotFoundError(productId);
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new RangeError('Quantity must be a positive number');
  }

  return {
    id: Math.random().toString(36).substring(7),
    status: 'CREATED',
    total_price: product.price * quantity,
  };
}
