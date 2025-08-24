
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  EyeOff, 
  Eye, 
  DollarSign, 
  Percent, 
  Edit, 
  PackagePlus, 
  PackageX, 
  Archive,
  ArchiveX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { products, getProductById } from "@/data/products";
import { Product } from "@/contexts/CartContext";

const SecretAdmin = () => {
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<number | null>(null);
  const [salePercentage, setSalePercentage] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize product list from data
    setProductList(products);
  }, []);

  // Filter products based on search query
  const filteredProducts = productList.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogin = () => {
    // Simple password check - in a real app, use proper authentication
    if (adminPassword === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "You now have access to product management",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Please try again",
      });
    }
  };

  const toggleVisibility = (product: Product) => {
    const updatedProducts = productList.map(p => {
      if (p.id === product.id) {
        // Add or toggle the visibility property
        return { 
          ...p, 
          hidden: p.hidden ? !p.hidden : true 
        };
      }
      return p;
    });
    
    setProductList(updatedProducts);
    toast({
      title: product.hidden ? "Product Shown" : "Product Hidden",
      description: `${product.name} is now ${product.hidden ? "visible" : "hidden"} to customers`,
    });
  };

  const toggleStock = (product: Product) => {
    const updatedProducts = productList.map(p => {
      if (p.id === product.id) {
        return { 
          ...p, 
          outOfStock: p.outOfStock ? !p.outOfStock : true 
        };
      }
      return p;
    });
    
    setProductList(updatedProducts);
    toast({
      title: product.outOfStock ? "Product Back in Stock" : "Product Marked Out of Stock",
      description: `${product.name} is now ${product.outOfStock ? "available for purchase" : "marked as out of stock"}`,
    });
  };

  const handleEditPrice = (product: Product) => {
    if (editPrice !== null) {
      const updatedProducts = productList.map(p => {
        if (p.id === product.id) {
          return { 
            ...p, 
            originalPrice: p.originalPrice || p.price, // Store original price if not already stored
            price: editPrice 
          };
        }
        return p;
      });
      
      setProductList(updatedProducts);
      setSelectedProduct(null);
      setEditPrice(null);
      toast({
        title: "Price Updated",
        description: `${product.name} price updated to $${editPrice.toFixed(2)}`,
      });
    }
  };

  const applySaleToProduct = (product: Product) => {
    if (salePercentage > 0 && salePercentage < 100) {
      const originalPrice = product.originalPrice || product.price;
      const salePrice = originalPrice * (1 - salePercentage/100);
      
      const updatedProducts = productList.map(p => {
        if (p.id === product.id) {
          return { 
            ...p, 
            originalPrice: p.originalPrice || p.price,
            price: parseFloat(salePrice.toFixed(2)),
            onSale: true,
            salePercentage: salePercentage
          };
        }
        return p;
      });
      
      setProductList(updatedProducts);
      setSelectedProduct(null);
      setSalePercentage(0);
      toast({
        title: "Sale Applied",
        description: `${product.name} is now on sale: ${salePercentage}% off`,
      });
    }
  };

  const removeSale = (product: Product) => {
    if (product.originalPrice) {
      const updatedProducts = productList.map(p => {
        if (p.id === product.id) {
          return { 
            ...p, 
            price: p.originalPrice || p.price,
            originalPrice: undefined,
            onSale: false,
            salePercentage: undefined
          };
        }
        return p;
      });
      
      setProductList(updatedProducts);
      toast({
        title: "Sale Removed",
        description: `${product.name} is no longer on sale`,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto py-20">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter password to manage products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleLogin}>Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Secret Product Management</h1>
        <Button 
          variant="ghost"
          onClick={() => navigate('/')}
        >
          Exit Admin
        </Button>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Product Inventory ({filteredProducts.length})</CardTitle>
          <CardDescription>Manage your product inventory, prices and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className={product.hidden ? "opacity-50" : ""}>
                    <TableCell className="font-mono text-sm">{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">
                      {product.originalPrice ? (
                        <div>
                          <span className="text-red-600 font-medium">${product.price.toFixed(2)}</span>
                          {" "}
                          <span className="line-through text-sm text-muted-foreground">${product.originalPrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        `$${product.price.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      {product.outOfStock ? (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                          Out of stock
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          In stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => toggleVisibility(product)}
                          title={product.hidden ? "Show product" : "Hide product"}
                        >
                          {product.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => toggleStock(product)}
                          title={product.outOfStock ? "Mark as in stock" : "Mark as out of stock"}
                        >
                          {product.outOfStock ? <ArchiveX className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                        </Button>
                        
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedProduct(product);
                            setEditPrice(product.price);
                          }}
                          title="Edit price"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        
                        {product.originalPrice ? (
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => removeSale(product)}
                            title="Remove sale"
                            className="bg-red-50"
                          >
                            <Percent className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedProduct(product);
                              setSalePercentage(10); // Default 10% sale
                            }}
                            title="Apply sale"
                          >
                            <Percent className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Price Modal */}
      {selectedProduct && editPrice !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Edit Price</CardTitle>
              <CardDescription>{selectedProduct.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    value={editPrice} 
                    onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>Cancel</Button>
                  <Button onClick={() => handleEditPrice(selectedProduct)}>Save Price</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Apply Sale Modal */}
      {selectedProduct && editPrice === null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Apply Sale</CardTitle>
              <CardDescription>{selectedProduct.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sale">Discount Percentage (%)</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="sale" 
                      type="number" 
                      min="1" 
                      max="99" 
                      value={salePercentage} 
                      onChange={(e) => setSalePercentage(parseFloat(e.target.value))}
                    />
                    <span className="text-xl">%</span>
                  </div>
                  
                  <div className="text-sm mt-2">
                    Original price: ${selectedProduct.originalPrice || selectedProduct.price}
                    <br />
                    Sale price: ${((selectedProduct.originalPrice || selectedProduct.price) * (1 - salePercentage/100)).toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>Cancel</Button>
                  <Button onClick={() => applySaleToProduct(selectedProduct)}>Apply Sale</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SecretAdmin;
