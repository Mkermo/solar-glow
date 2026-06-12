export interface Category {
  id: number;
  slug: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  products_count?: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  sale_price: number | null;
  effective_price: number;
  image_url: string | null;
  stock_quantity: number;
  in_stock: boolean;
  is_featured: boolean;
  specifications: Record<string, string> | null;
  specifications_ar: Record<string, string> | null;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Faq {
  id: number;
  question: string;
  question_ar: string | null;
  answer: string;
  answer_ar: string | null;
}

export interface Testimonial {
  id: number;
  author: string;
  role: string | null;
  quote: string;
  rating: number;
}

export interface OrderItem {
  product_id: number | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  reference: string;
  status: { slug: string; name: string; name_ar: string | null };
  customer_name: string;
  city: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  placed_at: string;
}

export interface CheckoutPayload {
  customer_name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  notes?: string;
  items: { product_id: number; quantity: number }[];
}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}
