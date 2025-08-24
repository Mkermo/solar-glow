
import { Shield } from "lucide-react";

const ReturnRefund = () => (
  <div className="py-16 px-4 container mx-auto max-w-2xl animate-fade-in">
    <div className="flex items-center gap-3 mb-6">
      <Shield className="text-solar-blue" size={30} />
      <h1 className="text-3xl font-bold text-solar-blue">Returns &amp; Refund Policy</h1>
    </div>
    <h2 className="text-xl font-semibold mb-3">Your Satisfaction, Guaranteed</h2>
    <p className="mb-4 text-gray-700">
      If for any reason you are unsatisfied with your purchase, we offer a straightforward return and refund process within 30 days of delivery.
    </p>
    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
      <li><span className="font-semibold">Eligibility:</span> Items must be unused and in original packaging.</li>
      <li><span className="font-semibold">Initiate Return:</span> Contact our support team with your order details.</li>
      <li><span className="font-semibold">Refund Process:</span> Once your return is received and inspected, we’ll send you an email notification regarding your refund status. Refunds are processed to your original payment method within 7 business days.</li>
      <li><span className="font-semibold">Non-returnable items:</span> Custom installations, special orders, and gift cards.</li>
    </ul>
    <p className="text-gray-600">
      Have questions or need help? Please contact us and we’ll be happy to assist!
    </p>
  </div>
);

export default ReturnRefund;
