import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | DRIIVN Streetwear",
  description: "Official customer privacy policy, data security, and encryption compliance for DRIIVN.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-8 mb-12 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-3">
          SECURITY & DATA GOVERNANCE
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-widest text-black uppercase">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          Effective Date: September 2026 • 256-Bit SSL Secured Platform
        </p>
      </div>

      <div className="space-y-10 text-xs text-gray-700 tracking-wider uppercase leading-relaxed font-sans">
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            1. Information We Collect
          </h2>
          <p>
            When you browse, register, or order from DRIIVN, we collect necessary transactional and identity details to fulfill your streetwear purchases:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li><strong>Identity & Contact Details:</strong> Full Name, Email Address, 10-Digit Mobile Number.</li>
            <li><strong>Delivery Information:</strong> Flat / House Number, Street, Landmark, City, State, and PIN Code.</li>
            <li><strong>Order History:</strong> Purchased items, sizes, colors, and transaction records.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            2. How We Protect Your Data
          </h2>
          <p>
            We implement industry-grade 256-bit Secure Socket Layer (SSL) encryption for all database communications and order dispatches. We <strong>never sell, lease, or monetize</strong> your personal phone numbers or contact details to third-party marketing brokers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            3. Payment Data Security
          </h2>
          <p>
            DRIIVN does not directly store, process, or view credit/debit card numbers or UPI PINs on our servers. All digital transactions are processed through RBI-authorized payment processors and encrypted gateways.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            4. Cookies & Anonymous Analytics
          </h2>
          <p>
            We utilize minimal session storage and local cookies to remember your shopping cart items, VIP club perks, and dashboard authentication. You can clear cookies anytime via your browser settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            5. Contacting the Data Protection Officer
          </h2>
          <p>
            For inquiries regarding your stored account data, address removal, or account closure, email our data desk at: <span className="font-bold text-black">privacy@driivnstore.in</span>.
          </p>
        </section>
      </div>

      <div className="mt-14 pt-8 border-t border-gray-200 text-center">
        <Link
          href="/"
          className="inline-block bg-black text-white hover:bg-orange-600 px-8 py-3.5 text-xs font-black tracking-widest uppercase transition-colors"
        >
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
