export interface CartItem {
  productId: string;
  variantId: number;
  title: string;
  variantTitle: string;
  price: number; // cents
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
}
