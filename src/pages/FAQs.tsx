
import { HelpCircle } from "lucide-react";

const FAQs = () => (
  <div className="py-16 px-4 container mx-auto max-w-2xl animate-fade-in">
    <div className="flex items-center gap-3 mb-6">
      <HelpCircle className="text-solar-blue" size={30} />
      <h1 className="text-3xl font-bold text-solar-blue">Frequently Asked Questions</h1>
    </div>
    <div>
      <h2 className="font-semibold text-lg mb-2">Do you ship internationally?</h2>
      <p className="mb-4 text-gray-700">Yes! We offer international shipping to many countries. Please check our shipping policy for current destinations.</p>
      <h2 className="font-semibold text-lg mb-2">How long does delivery take?</h2>
      <p className="mb-4 text-gray-700">Most orders are delivered within 3-7 business days domestically. International shipments may take 7-21 days depending on customs.</p>
      <h2 className="font-semibold text-lg mb-2">Do you offer installation services?</h2>
      <p className="mb-4 text-gray-700">We provide expert advice and guidance. Partner installation services are available in select locations—please contact us for details.</p>
      <h2 className="font-semibold text-lg mb-2">What payment methods do you accept?</h2>
      <p className="mb-4 text-gray-700">We accept all major credit cards, PayPal, and green energy financing options at checkout.</p>
      <h2 className="font-semibold text-lg mb-2">How do I return an item?</h2>
      <p className="mb-4 text-gray-700">Simply contact our customer support within 30 days of delivery. Visit our Returns &amp; Refund page for details.</p>
    </div>
  </div>
);

export default FAQs;
