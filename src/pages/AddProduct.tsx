import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();

  // Translations
  const translations = {
    en: {
      title: "Add New Product",
      category: "Category",
      productName: "Product Name",
      description: "Description",
      price: "Price",
      stockQuantity: "Stock Quantity",
      addButton: "Add Product",
      adding: "Adding...",
      success: "Product added successfully",
      error: "Error adding product",
      selectCategory: "Select category",
      categories: {
        panels: "Solar Panels",
        inverters: "Inverters",
        batteries: "Batteries",
        accessories: "Accessories"
      }
    },
    ar: {
      title: "إضافة منتج جديد",
      category: "الفئة",
      productName: "اسم المنتج",
      description: "الوصف",
      price: "السعر",
      stockQuantity: "الكمية المتوفرة",
      addButton: "إضافة المنتج",
      adding: "جاري الإضافة...",
      success: "تمت إضافة المنتج بنجاح",
      selectCategory: "اختر الفئة",
      categories: {
        panels: "ألواح شمسية",
        inverters: "محولات",
        batteries: "بطاريات",
        accessories: "ملحقات"
      }
    }
  };

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Testing Supabase connection...");
      const testQuery = await supabase.from('products').select('count()');
      console.log("Connection test result:", testQuery);
      
      const formData = new FormData(e.currentTarget);
      const category = formData.get('category') as string;
      
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const id = `${category.substring(0, 2)}-${timestamp}-${randomNum}`;

      const productData = {
        id,
        name: formData.get('name'),
        name_ar: formData.get('name_ar'),
        description: formData.get('description'),
        description_ar: formData.get('description_ar'),
        price: parseFloat(formData.get('price') as string),
        category: category,
        image_url: '/placeholder.svg',
        stock_quantity: parseInt(formData.get('stock_quantity') as string),
        specifications: {},
        specifications_ar: {},
        sold_quantity: 0,
        is_hidden: false,
        is_on_sale: false
      };

      console.log("Submitting product data:", productData);

      const { error, data } = await supabase
        .from('products')
        .insert([productData])
        .select();

      console.log("Insert result:", { error, data });

      if (error) throw error;

      toast({
        title: t("success"),
        description: `Product "${productData.name}" added successfully with ID: ${id}`,
      });

      // Redirect to the dashboard to see the new product
      navigate('/dashboard');
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl" dir={lang === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("category")}</label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder={t("selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="panels">{t("categories.panels")}</SelectItem>
              <SelectItem value="inverters">{t("categories.inverters")}</SelectItem>
              <SelectItem value="batteries">{t("categories.batteries")}</SelectItem>
              <SelectItem value="accessories">{t("categories.accessories")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("productName")}</label>
          <Input name="name" required className="mb-2" placeholder={lang === "en" ? "English name" : "الاسم بالإنجليزية"} />
          <Input name="name_ar" required placeholder={lang === "en" ? "Arabic name" : "الاسم بالعربية"} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("description")}</label>
          <Textarea name="description" required className="mb-2" placeholder={lang === "en" ? "English description" : "الوصف بالإنجليزية"} />
          <Textarea name="description_ar" required placeholder={lang === "en" ? "Arabic description" : "الوصف بالعربية"} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("price")}</label>
          <Input type="number" step="0.01" name="price" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("stockQuantity")}</label>
          <Input type="number" name="stock_quantity" required />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? t("adding") : t("addButton")}
        </Button>
      </form>
    </div>
  );
}