import Link from "next/link";

export const metadata = {
  title: "Terms of Service | DRIVEN Streetwear",
  description: "Terms and conditions governing purchases, limited edition drops, and website usage for DRIVEN.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-8 mb-12 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-3">
          LEGAL FRAMEWORK
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-widest text-black uppercase">
          Terms of Service
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          Governing Usage of DRIVEN Storefront & Collectibles
        </p>
      </div>

      <div className="space-y-10 text-xs text-gray-700 tracking-wider uppercase leading-relaxed font-sans">
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing DRIVEN (the "Site") or purchasing our garments and accessories, you acknowledge and agree to be bound by these Terms of Service. If you disagree with any part of these terms, please refrain from using the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            2. Limited Edition Drops & Availability
          </h2>
          <p>
            DRIVEN operates on conceptual, limited-inventory releases. Items placed in your digital shopping bag are not reserved until checkout is completed and confirmed. We reserve the right to restrict purchase quantities per individual customer or IP address to prevent commercial scalping.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            3. Pricing & Currency
          </h2>
          <p>
            All listed prices are denominated in Indian Rupees (INR ₹) and are inclusive of Goods and Services Tax (GST) unless explicitly noted. We reserve the right to correct typographical pricing discrepancies prior to fulfillment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            4. Intellectual Property & Brand Ownership
          </h2>
          <p>
            All graphics, high-density print designs, typography, brand marks, lookbook photography, and code belonging to DRIVEN are protected under copyright and trademark laws. Any unauthorized commercial reproduction or counterfeit manufacturing will be subject to legal prosecution.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            5. Governing Law & Jurisdiction
          </h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the Republic of India. Any legal disputes arising in relation to purchases shall fall under the exclusive jurisdiction of the competent courts in India.
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
