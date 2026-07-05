export interface Product {
  id: number;
  name: string;
  description?: string;
  ingredients?: string;
  shelfLife?: string;
  storageInstructions?: string;
  deliveryTime?: string;
  weightOptions?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  galleryImages?: string[];
  featured?: boolean;
  bestSeller?: boolean;
  active?: boolean;
  rating?: number;
  reviewCount?: number;
  categoryName?: string;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedWeight?: string;
  cartKey?: string;
}

export interface BannerItem {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
}

export interface TestimonialItem {
  id: number;
  customerName: string;
  location?: string;
  message: string;
  rating: number;
}

export interface ContactInfo {
  shopName?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  hours?: string;
  mapUrl?: string;
}
