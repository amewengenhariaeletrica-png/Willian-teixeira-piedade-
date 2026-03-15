export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt: any;
}

export interface FeaturedItem {
  id: string;
  title?: string;
  imageUrl: string;
  category: 'enel' | 'sabesp';
  createdAt: any;
}

export interface ProjectPrice {
  id: string;
  name: string;
  basePrice: number;
  unitName: string;
  description: string;
  createdAt: any;
}
