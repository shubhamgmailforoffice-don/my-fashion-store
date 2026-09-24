import Link from "next/link";

export const metadata = {
  title: "Returns & Exchanges | DRIIVN Streetwear",
  description: "Official 7-day hassle-free return and exchange policy for DRIIVN luxury streetwear garments.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 pb-8 mb-12 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-3">
          SATISFACTION GUARANTEE
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-widest text-black uppercase">
          Returns & Exchanges
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
          Transparent 7-Day Doorstep Exchange & Refund Protocol
        </p>
      </div>

      <div className="space-y-10 text-xs text-gray-700 tracking-wider uppercase leading-relaxed font-sans">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            1. 7-Day Return & Exchange Window
          </h2>
          <p>
            At DRIIVN, we take immense pride in our heavyweight fabrics and silhouette engineering. However, if a size does not fit as desired or you are not completely satisfied, we accept returns and size exchanges within <strong>7 days of verified delivery</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            2. Garment Condition Criteria
          </h2>
          <div className="bg-zinc-50 border border-gray-200 p-5 space-y-2">
            <p className="font-bold text-black">To qualify for a full exchange or return:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>The garment must be unworn, unwashed, and scent-free (no perfumes or deodorants).</li>
              <li>Original DRIIVN garment tags, neck seals, and brand packaging must remain intact.</li>
              <li>Free promotional gifts or dustbags must be included with the returned package.</li>
            </ul>
          </div>
          <p className="text-[11px] text-orange-600 font-bold">
            Note: "Blind Box" mystery drops and personalized customized garments are archive collectors items and are Final Sale.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            3. Reverse Pickup & Exchange Process
          </h2>
          <p>
            Initiating an exchange is straightforward:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Visit your <Link href="/account" className="text-orange-600 font-bold underline">Member Account</Link> or contact concierge at <span className="font-bold text-black">returns@driivnstore.in</span> with your Order ID.</li>
            <li>Our courier partner will arrange a doorstep reverse pickup within 48 to 72 hours.</li>
            <li>Upon quality inspection at our warehouse, your requested replacement size will be dispatched immediately.</li>
          </ol>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-black tracking-widest uppercase border-b border-gray-100 pb-2">
            4. Refund Timelines
          </h2>
          <p>
            Refunds are credited directly to your original payment method:
          </p>
          <div className="bg-zinc-50 border border-gray-200 p-5 space-y-2">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold text-black">Prepaid (UPI / Cards / Net Banking)</span>
              <span className="text-black font-bold">3 – 5 Business Days to Source Account</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-black">Cash on Delivery (COD)</span>
              <span className="text-black font-bold">Direct UPI / Bank Transfer within 48 Hours</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-14 pt-8 border-t border-gray-200 text-center">
        <Link
          href="/account"
          className="inline-block bg-black text-white hover:bg-orange-600 px-8 py-3.5 text-xs font-black tracking-widest uppercase transition-colors"
        >
          Manage Orders in Dashboard &rarr;
        </Link>
      </div>
    </div>
  );
}
