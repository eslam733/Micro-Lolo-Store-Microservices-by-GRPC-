export type Product = {
  id: string;
  name: string;
  price: number;
};

export const products: Product[] = [
  { id: '1', name: 'Golden Retriever', price: 1200.0 },
  { id: '2', name: 'French Bulldog', price: 2500.0 },
  { id: '3', name: 'Husky', price: 1500.0 },
];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function listProducts(): Product[] {
  return products;
}
