import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "./client";
import type {
  Category,
  ChatMessage,
  CheckoutPayload,
  ContactPayload,
  Faq,
  Order,
  Paginated,
  Product,
  Testimonial,
} from "./types";

interface ProductFilters {
  category?: string;
  search?: string;
  featured?: boolean;
}

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({
    queryKey: ["products", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);
      if (filters.featured) params.set("featured", "1");
      const query = params.toString();
      return apiGet<Paginated<Product>>(`/products${query ? `?${query}` : ""}`);
    },
  });

export const useProduct = (slug: string | undefined) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiGet<{ data: Product }>(`/products/${slug}`),
    enabled: Boolean(slug),
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<{ data: Category[] }>("/categories"),
    staleTime: 5 * 60 * 1000,
  });

export const useFaqs = () =>
  useQuery({
    queryKey: ["faqs"],
    queryFn: () => apiGet<{ data: Faq[] }>("/faqs"),
    staleTime: 5 * 60 * 1000,
  });

export const useTestimonials = () =>
  useQuery({
    queryKey: ["testimonials"],
    queryFn: () => apiGet<{ data: Testimonial[] }>("/testimonials"),
    staleTime: 5 * 60 * 1000,
  });

export const useOrderTracking = (reference: string | undefined) =>
  useQuery({
    queryKey: ["order", reference],
    queryFn: () => apiGet<{ data: Order }>(`/orders/${reference}`),
    enabled: Boolean(reference),
    retry: false,
  });

export const usePlaceOrder = () =>
  useMutation({
    mutationFn: (payload: CheckoutPayload) => apiPost<{ data: Order }>("/orders", payload),
  });

export const useSendContactMessage = () =>
  useMutation({
    mutationFn: (payload: ContactPayload) => apiPost<{ message: string }>("/contact", payload),
  });

export const useAssistantChat = () =>
  useMutation({
    mutationFn: (messages: ChatMessage[]) =>
      apiPost<{ reply: string }>("/assistant/chat", { messages }),
  });
