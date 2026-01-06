
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  tag?: string;
  specs?: Record<string, string>;
  seller?: {
    name: string;
    rating: string;
    followers: string;
  };
  userReviews?: {
    user: string;
    comment: string;
    stars: number;
    date: string;
  }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  vouchers: string[];
}

export enum Category {
  ALL = 'All',
  ELECTRONICS = 'Electronics',
  FASHION = 'Fashion',
  HOME = 'Home',
  BEAUTY = 'Beauty',
  GADGETS = 'Gadgets',
  GROCERY = 'Grocery',
  SPORTS = 'Sports'
}
