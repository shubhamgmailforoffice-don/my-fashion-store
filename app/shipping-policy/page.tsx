import Link from "next/link";

export const metadata = {
  title: "Shipping Policy | DRIIVN Streetwear",
  description: "Official domestic and international shipping policy, delivery timelines, and transit guidelines for DRIIVN garments.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-8 mb-12 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-3">
          LOGISTICS & TRANSIT
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-widest text-black uppercase">
          Shipping Policy
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          Effective Date: September 2026 • Verified for Domestic & Global Deliveries
        </p>
      </div>

      <div className="space-y-10 text-xs text-gray-700 tracking-wider uppercase leading-relaxed font-sans">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            1. Order Processing Time
          </h2>
          <p>
            All standard orders placed at DRIIVN are processed and dispatched within <strong>24 to 48 business hours</strong> (excluding Sundays and national gazetted holidays).
          </p>
          <p>
            Limited edition drops, pre-orders, and serialized archive pieces will adhere to the specific timeline listed on the individual product lookbook page.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            2. Domestic Shipping & Delivery Timelines (India)
          </h2>
          <div className="bg-zinc-50 border border-gray-200 p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold text-black">Standard Express Transit</span>
              <span className="text-orange-600 font-black">3 – 5 Business Days</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold text-black">Metro Cities (Delhi NCR, Mumbai, Bengaluru)</span>
              <span className="text-black font-bold">2 – 3 Business Days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-black">Complimentary Express Shipping</span>
              <span className="text-emerald-700 font-bold">Orders Above ₹5,000</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500">
            For orders under ₹5,000, a nominal flat express shipping fee of ₹150 is applied at checkout.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            3. Courier Partners & Real-Time Tracking
          </h2>
          <p>
            We partner exclusively with tier-1 priority couriers including <strong>Delhivery Express, Blue Dart, and DTDC Air</strong>. 
          </p>
          <p>
            Once your garment is dispatched from our fulfillment center, an Air Waybill (AWB) tracking number is assigned to your order. You can track transit progress 24/7 on your <Link href="/account" className="text-orange-600 font-bold underline">Member Dashboard</Link>.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            4. Cash on Delivery (COD) Guidelines
          </h2>
          <p>
            COD is offered across 18,000+ pin codes in India. Please ensure the exact cash amount or UPI QR payment is ready when the delivery executive arrives at your address. An automated phone/SMS verification may precede high-value COD shipments.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            5. Damaged or Tampered Parcels
          </h2>
          <p>
            Our packaging utilizes high-security tamper-evident polybags and custom security seals. If the package appears visibly opened, damaged, or torn upon arrival, <strong>do not accept the package</strong>. Immediately record a photo/video and notify our concierge within 24 hours at <span className="font-bold text-black">support@driivnstore.in</span>.
          </p>
        </section>
      </div>

      <div className="mt-14 pt-8 border-t border-gray-200 text-center">
        <Link
          href="/shop"
          className="inline-block bg-black text-white hover:bg-orange-600 px-8 py-3.5 text-xs font-black tracking-widest uppercase transition-colors"
        >
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
