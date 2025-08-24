
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Truck, CheckCircle } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { useCart } from "@/contexts/CartContext";

type CheckoutStep = "information" | "shipping" | "payment" | "confirmation";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("information");
  const [orderId, setOrderId] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    shippingMethod: "standard",
    paymentMethod: "credit",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    saveInformation: false,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      saveInformation: checked,
    }));
  };
  
  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmitInformation = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("shipping");
    window.scrollTo(0, 0);
  };
  
  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("payment");
    window.scrollTo(0, 0);
  };
  
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a random order ID
    const newOrderId = `SG-${Math.floor(Math.random() * 1000000).toString().padStart(6, "0")}`;
    setOrderId(newOrderId);
    setCurrentStep("confirmation");
    // In a real app, you'd process the payment here
    clearCart();
    window.scrollTo(0, 0);
  };

  const subtotal = getCartTotal();
  const shipping = formData.shippingMethod === "express" ? 75 : (subtotal >= 1000 ? 0 : 50);
  const total = subtotal + shipping;
  
  if (cartItems.length === 0 && currentStep !== "confirmation") {
    navigate("/cart");
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container py-8 max-w-5xl">
        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 flex items-center ${currentStep === "information" ? "text-primary" : "text-gray-400"}`}>
              <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center mr-2">
                1
              </div>
              <span className="font-medium">Information</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200"></div>
            <div className={`flex-1 flex items-center ${currentStep === "shipping" ? "text-primary" : "text-gray-400"}`}>
              <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center mr-2">
                2
              </div>
              <span className="font-medium">Shipping</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200"></div>
            <div className={`flex-1 flex items-center ${currentStep === "payment" ? "text-primary" : "text-gray-400"}`}>
              <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center mr-2">
                3
              </div>
              <span className="font-medium">Payment</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200"></div>
            <div className={`flex-1 flex items-center ${currentStep === "confirmation" ? "text-primary" : "text-gray-400"}`}>
              <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center mr-2">
                4
              </div>
              <span className="font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form section */}
          <div className="lg:col-span-2">
            {currentStep === "information" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Contact Information</h1>
                <form onSubmit={handleSubmitInformation}>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">Zip/Postal Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveInformation"
                        checked={formData.saveInformation}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label htmlFor="saveInformation">
                        Save this information for next time
                      </Label>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" type="button" asChild>
                        <Link to="/cart">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Return to Cart
                        </Link>
                      </Button>
                      <Button type="submit">Continue to Shipping</Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {currentStep === "shipping" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Shipping Method</h1>
                <form onSubmit={handleSubmitShipping}>
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <RadioGroup 
                          value={formData.shippingMethod}
                          onValueChange={(value) => handleRadioChange("shippingMethod", value)}
                        >
                          <div className="flex items-center space-x-2 mb-4">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard" className="flex-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Truck className="h-5 w-5 mr-3" />
                                  <div>
                                    <div className="font-medium">Standard Shipping</div>
                                    <div className="text-sm text-gray-500">Delivery in 3-5 business days</div>
                                  </div>
                                </div>
                                <div className="font-medium">
                                  {subtotal >= 1000 ? "Free" : "$50.00"}
                                </div>
                              </div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="express" id="express" />
                            <Label htmlFor="express" className="flex-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Truck className="h-5 w-5 mr-3" />
                                  <div>
                                    <div className="font-medium">Express Shipping</div>
                                    <div className="text-sm text-gray-500">Delivery in 1-2 business days</div>
                                  </div>
                                </div>
                                <div className="font-medium">$75.00</div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => setCurrentStep("information")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Information
                      </Button>
                      <Button type="submit">Continue to Payment</Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {currentStep === "payment" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Payment Method</h1>
                <form onSubmit={handleSubmitPayment}>
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <RadioGroup 
                          value={formData.paymentMethod}
                          onValueChange={(value) => handleRadioChange("paymentMethod", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="credit" id="credit" />
                            <Label htmlFor="credit" className="flex-1">
                              <div className="flex items-center">
                                <CreditCard className="h-5 w-5 mr-3" />
                                <div className="font-medium">Credit / Debit Card</div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                        
                        <div className="mt-6 space-y-4">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleChange}
                              placeholder="1234 5678 9012 3456"
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="cardExpiry">Expiry Date</Label>
                              <Input
                                id="cardExpiry"
                                name="cardExpiry"
                                value={formData.cardExpiry}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cardCvc">CVC/CVV</Label>
                              <Input
                                id="cardCvc"
                                name="cardCvc"
                                value={formData.cardCvc}
                                onChange={handleChange}
                                placeholder="123"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => setCurrentStep("shipping")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Shipping
                      </Button>
                      <Button type="submit">Complete Order</Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {currentStep === "confirmation" && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 mb-6">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
                <p className="text-lg text-gray-600 mb-6">
                  Thank you for your purchase. Your order has been confirmed.
                </p>
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <p className="font-medium">Order ID: {orderId}</p>
                  <p className="text-sm text-gray-500">Please save this for your reference.</p>
                </div>
                <div className="space-y-4">
                  <Button asChild className="w-full sm:w-auto">
                    <Link to="/orders/tracking">
                      Track Your Order
                    </Link>
                  </Button>
                  <div>
                    <Button asChild variant="outline">
                      <Link to="/">
                        Continue Shopping
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Order summary */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {(currentStep !== "confirmation" ? cartItems : []).map((item) => (
                  <div key={item.product.id} className="flex items-center">
                    <div className="relative mr-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-contain bg-white rounded-md border"
                      />
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        ${item.product.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      "Free"
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {currentStep === "confirmation" && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-green-800 text-sm font-medium">
                    An email confirmation has been sent to {formData.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
