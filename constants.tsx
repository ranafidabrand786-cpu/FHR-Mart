
import { Product, Category } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Stealth Pro Wireless Headphones',
    price: 14999,
    originalPrice: 19999,
    category: Category.ELECTRONICS,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    rating: 4.8,
    reviews: 1250,
    description: 'Active noise cancelling headphones with 40h battery life and spatial audio. Experience studio-quality sound in Pakistan.',
    tag: 'Best Seller',
    specs: { "Driver": "40mm Dynamic", "Battery": "40 Hours", "ANC": "Hybrid Pro" },
    seller: { name: "FHR Official Store", rating: "98%", followers: "125k" },
    userReviews: [{ user: "Alex J.", comment: "Best audio I've ever heard in this price range.", stars: 5, date: "2 days ago" }]
  },
  {
    id: '2',
    name: 'Cyber Edition Mechanical Keyboard',
    price: 8500,
    originalPrice: 12000,
    category: Category.GADGETS,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=600&auto=format&fit=crop',
    rating: 4.9,
    reviews: 840,
    description: 'Ultra-responsive mechanical switches with customizable RGB lighting and hot-swappable keys.',
    tag: 'Hot',
    specs: { "Switches": "Blue Tactile", "Lights": "RGB Per-Key", "Mode": "Wired/Wireless" },
    seller: { name: "TechNova FHR", rating: "94%", followers: "45k" }
  },
  {
    id: '3',
    name: 'Titanium Smart Watch Series X',
    price: 24999,
    originalPrice: 35000,
    category: Category.ELECTRONICS,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
    rating: 4.7,
    reviews: 2100,
    description: 'Aerospace-grade titanium body with advanced health monitoring and LTE connectivity.',
    tag: 'Premium',
    specs: { "Case": "Grade 5 Titanium", "Display": "OLED Sapphire", "Depth": "50m Water Resistant" },
    seller: { name: "FHR Flagship", rating: "99%", followers: "300k" }
  },
  {
    id: '4',
    name: 'Urban Explorer Waterproof Backpack',
    price: 4500,
    originalPrice: 6000,
    category: Category.FASHION,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
    rating: 4.5,
    reviews: 430,
    description: 'Minimalist design meets extreme durability. Features hidden anti-theft pockets.',
    specs: { "Material": "1680D Ballistic Nylon", "Capacity": "24L", "Laptop": "Up to 16-inch" },
    seller: { name: "StreetWear Elite", rating: "92%", followers: "12k" }
  },
  {
    id: '5',
    name: 'Limited Edition Walnut Desk Lamp',
    price: 6500,
    originalPrice: 8500,
    category: Category.HOME,
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=600&auto=format&fit=crop',
    rating: 4.9,
    reviews: 320,
    description: 'Handcrafted walnut wood lamp with touch control and integrated wireless Qi charging.',
    seller: { name: "NatureHome FHR", rating: "96%", followers: "8k" }
  },
  {
    id: '6',
    name: 'Professional 8K Cinematic Drone',
    price: 185000,
    originalPrice: 220000,
    category: Category.GADGETS,
    image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=600&auto=format&fit=crop',
    rating: 4.8,
    reviews: 156,
    description: 'Unmatched 8K resolution with 45-minute flight time and omnidirectional obstacle avoidance.',
    tag: 'New',
    specs: { "Video": "8K @ 60fps", "Range": "15km", "Sensors": "360° Vision" },
    seller: { name: "SkyHigh Official", rating: "97%", followers: "56k" }
  }
];

export const APP_CONFIG = {
  appName: "FHR Mart",
  ownerName: "Fida HussaiN Rana",
  primaryColor: "#3b82f6",
  accentColor: "#8b5cf6",
  currency: "Rs."
};
