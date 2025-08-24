import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight, ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Button asChild>
            <Link to="/products/panels">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.product.id} className="border p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-20 h-20 object-contain"
              />
              <div>
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-gray-500">${item.product.price.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(item.product.id)}
                disabled={isUpdating}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-md ml-auto">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="border-t pt-2 font-bold">
              <div className="flex justify-between">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Link to="/checkout">
            <Button className="w-full">
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
