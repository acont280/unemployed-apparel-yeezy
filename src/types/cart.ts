export interface CartItem {
  productId: string;
  variantId: number;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string;
  note: string;
}

export interface Cart {
  items: CartItem[];
}
