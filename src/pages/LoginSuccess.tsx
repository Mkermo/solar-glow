import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Login Successful!</h1>
        <p className="text-gray-600">
          Redirecting you to the homepage...
        </p>
      </div>
    </div>
  );
}