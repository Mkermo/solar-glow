
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, SearchIcon, Package, TruckIcon, HomeIcon, CheckCircle2 } from "lucide-react";

interface TrackingStep {
  status: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const OrderTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<{
    orderId: string;
    customerName: string;
    shippingAddress: string;
    orderDate: string;
    estimatedDelivery: string;
    status: string;
    steps: TrackingStep[];
  } | null>(null);
  
  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate tracking lookup
    setTimeout(() => {
      // For this demo, any order ID will show a tracking result
      if (orderId.trim()) {
        // Generate random tracking data for demo
        const currentDate = new Date();
        const orderDate = new Date(currentDate);
        orderDate.setDate(currentDate.getDate() - 3);
        
        const estimatedDate = new Date(currentDate);
        estimatedDate.setDate(currentDate.getDate() + 2);
        
        // Random status
        const statusOptions = ["processing", "shipped", "out_for_delivery", "delivered"];
        const randomStatus = statusOptions[Math.floor(Math.random() * 3)]; // Exclude delivered for demo
        
        const steps: TrackingStep[] = [
          {
            status: "Order Confirmed",
            description: "Your order has been confirmed and is being processed",
            date: formatDate(orderDate),
            icon: <Package className="h-6 w-6" />,
            isActive: true
          },
          {
            status: "Shipped",
            description: "Your order has been shipped",
            date: formatDate(new Date(orderDate.getTime() + 24 * 60 * 60 * 1000)),
            icon: <TruckIcon className="h-6 w-6" />,
            isActive: randomStatus !== "processing"
          },
          {
            status: "Out for Delivery",
            description: "Your package is out for delivery",
            date: formatDate(new Date(orderDate.getTime() + 48 * 60 * 60 * 1000)),
            icon: <TruckIcon className="h-6 w-6" />,
            isActive: randomStatus === "out_for_delivery" || randomStatus === "delivered"
          },
          {
            status: "Delivered",
            description: "Your package has been delivered",
            date: formatDate(estimatedDate),
            icon: <HomeIcon className="h-6 w-6" />,
            isActive: randomStatus === "delivered"
          }
        ];
        
        setTrackingInfo({
          orderId: orderId,
          customerName: "John Doe",
          shippingAddress: "123 Solar Street, Sunshine City, CA 90210",
          orderDate: formatDate(orderDate),
          estimatedDelivery: formatDate(estimatedDate),
          status: randomStatus,
          steps
        });
        
        setIsTracking(true);
      }
    }, 1000);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>
        
        {!isTracking ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Enter your order ID to track the current status of your order.
              </p>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <label htmlFor="order-id" className="font-medium block mb-1">
                    Order ID
                  </label>
                  <div className="relative">
                    <Input
                      id="order-id"
                      placeholder="e.g., SG-123456"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="pl-10"
                    />
                    <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Track Order</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Button 
              variant="outline" 
              onClick={() => setIsTracking(false)} 
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Track Another Order
            </Button>
            
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Order Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{trackingInfo?.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{trackingInfo?.orderDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">{trackingInfo?.estimatedDelivery}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        trackingInfo?.status === "delivered" ? "bg-green-500" :
                        trackingInfo?.status === "out_for_delivery" ? "bg-blue-500" :
                        trackingInfo?.status === "shipped" ? "bg-yellow-500" : "bg-gray-500"
                      }`}></span>
                      <p className="font-medium">
                        {trackingInfo?.status === "processing" && "Processing"}
                        {trackingInfo?.status === "shipped" && "Shipped"}
                        {trackingInfo?.status === "out_for_delivery" && "Out for Delivery"}
                        {trackingInfo?.status === "delivered" && "Delivered"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-6">Tracking History</h2>
                <div className="space-y-6">
                  {trackingInfo?.steps.map((step, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          step.isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                        }`}>
                          {step.icon}
                        </div>
                        {index < trackingInfo.steps.length - 1 && (
                          <div className={`w-0.5 h-16 mx-auto ${
                            step.isActive && trackingInfo.steps[index + 1].isActive
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}></div>
                        )}
                      </div>
                      <div className="pb-12">
                        <div className="flex items-center">
                          <h3 className={`font-medium ${step.isActive ? "text-foreground" : "text-gray-400"}`}>
                            {step.status}
                          </h3>
                          {step.isActive && (
                            <CheckCircle2 className="h-4 w-4 text-primary ml-2" />
                          )}
                        </div>
                        <p className={`text-sm ${step.isActive ? "text-gray-600" : "text-gray-400"}`}>
                          {step.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderTracking;
