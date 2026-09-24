"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: string[];
  actionLink?: { label: string; url: string; external?: boolean };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    sender: "bot",
    text: "Welcome to DRIVEN Client Services. How can we assist your wardrobe today?",
    timestamp: "Just now",
    options: [
      "Track My Order",
      "Sizing & Fit Guide",
      "Shipping Timelines",
      "Returns & Exchanges",
      "Chat with Human on WhatsApp",
    ],
  },
];

export default function SupportWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "channels">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Official Support Contacts
  const WHATSAPP_NUMBER = "919999999999";
  const SUPPORT_EMAIL = "support@drivenstore.in";
  const SUPPORT_PHONE = "+91 99999 99999";

  // Hide widget inside Admin Control Center
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Process automated concierge response
    setTimeout(async () => {
      const lower = text.toLowerCase();
      let botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // 1. Order Tracking Lookup
      if (lower.includes("track") || lower.includes("fs-") || lower.includes("order")) {
        const orderIdMatch = text.match(/FS-?\d{4}/i);
        if (orderIdMatch) {
          const cleanId = orderIdMatch[0].toUpperCase().replace(/^#/, "");
          try {
            const res = await fetch("/api/orders", { cache: "no-store" });
            const allOrders = await res.json();
            const found = Array.isArray(allOrders)
              ? allOrders.find((o: any) => o.id.toUpperCase() === cleanId)
              : null;

            if (found) {
              const trackingMatch = found.address?.match(/\[Tracking:\s*(.*?)\]/i);
              const trackingInfo = trackingMatch ? trackingMatch[1] : null;

              botResponse.text = `Order #${found.id} Details:\n• Status: ${found.status.toUpperCase()}\n• Date: ${found.date}\n• Total: ₹${found.total.toLocaleString()}\n• Items: ${found.items.map((i: any) => `${i.name} (${i.size})`).join(", ")}${
                trackingInfo ? `\n• Courier / AWB: ${trackingInfo}` : ""
              }`;
              botResponse.options = ["Speak to Stylist on WhatsApp", "Track Another Order"];
              if (trackingInfo) {
                botResponse.actionLink = {
                  label: "Live Courier Tracking",
                  url: `https://www.google.com/search?q=track+${encodeURIComponent(trackingInfo)}`,
                  external: true,
                };
              }
            } else {
              botResponse.text = `We could not find Order #${cleanId}. Please check the ID on your invoice, or verify your email in the Account portal.`;
              botResponse.options = ["Go to Account Dashboard", "Chat on WhatsApp"];
              botResponse.actionLink = { label: "Open Member Account", url: "/account" };
            }
          } catch {
            botResponse.text = `Order lookup is temporarily busy. You can view all your orders anytime in your Member Dashboard.`;
            botResponse.actionLink = { label: "View Orders", url: "/account" };
          }
        } else {
          botResponse.text = "Please enter your 4-digit Order ID (for example: FS-1024 or #FS-1024) and I will look up your live fulfillment status immediately.";
          botResponse.options = ["Check Member Dashboard", "Chat with Agent on WhatsApp"];
        }
      }
      // 2. Sizing & Fit Guide
      else if (lower.includes("size") || lower.includes("fit") || lower.includes("gsm")) {
        botResponse.text = "DRIVEN garments are engineered with relaxed, boxy luxury silhouettes:\n• Tops & Tees: Cut in 280 GSM combed French Terry cotton with dropped shoulders.\n• Hoodies: Heavyweight 420 GSM French Terry for structured drape.\n• We recommend choosing your true size for our signature oversized look, or size down for a standard regular fit.";
        botResponse.options = ["Returns & Exchanges Policy", "Track My Order", "WhatsApp Stylist"];
      }
      // 3. Shipping Timelines
      else if (lower.includes("ship") || lower.includes("deliver") || lower.includes("time") || lower.includes("cod")) {
        botResponse.text = "Shipping & Logistics Overview:\n• Standard Express: 3 to 5 business days across India.\n• Metro Cities (Delhi, Mumbai, Bengaluru): 2 to 3 days.\n• Free Express Shipping: On all orders above ₹5,000.\n• Cash on Delivery (COD): Supported across 18,000+ pin codes.";
        botResponse.options = ["Read Full Shipping Policy", "Track My Order", "Chat on WhatsApp"];
        botResponse.actionLink = { label: "View Shipping Policy", url: "/shipping-policy" };
      }
      // 4. Returns & Exchanges
      else if (lower.includes("return") || lower.includes("exchange") || lower.includes("refund")) {
        botResponse.text = "We offer a 7-day hassle-free doorstep size exchange and return window on unworn garments with original tags attached. Reverse pickup is scheduled within 48 hours.";
        botResponse.options = ["Initiate Return on WhatsApp", "View Returns Policy", "Track My Order"];
        botResponse.actionLink = { label: "View Returns Policy", url: "/returns" };
      }
      // 5. WhatsApp or Human Agent
      else if (lower.includes("human") || lower.includes("whatsapp") || lower.includes("agent") || lower.includes("call")) {
        botResponse.text = "Connecting you with our senior stylist team on WhatsApp. Our concierge is available 10 AM – 9 PM IST.";
        botResponse.actionLink = {
          label: "Open WhatsApp Chat Now 💬",
          url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            "Hi DRIVEN Concierge, I would like assistance with an inquiry."
          )}`,
          external: true,
        };
        botResponse.options = ["Track My Order", "Email Support Desk"];
      }
      // 6. Default Fallback
      else {
        botResponse.text = "Thank you for reaching out to DRIVEN Concierge. You can track orders, check sizing, or chat with a personal stylist directly on WhatsApp.";
        botResponse.options = [
          "Track My Order",
          "Sizing & Fit Guide",
          "Returns & Exchanges",
          "Chat on WhatsApp",
        ];
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  return (
    <>
      {/* Floating Concierge Pill / Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group bg-black hover:bg-orange-600 text-white shadow-2xl border border-neutral-800 px-4 py-3 rounded-full flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Open Concierge Support"
          >
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block ring-4 ring-emerald-500/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute inset-0 animate-ping opacity-75" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                DRIVEN Concierge
              </p>
              <p className="text-[8px] text-neutral-400 group-hover:text-white uppercase tracking-wider mt-0.5">
                WhatsApp • Live Help
              </p>
            </div>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        )}
      </div>

      {/* Floating Concierge Drawer / Card */}
      {isOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-3 lg:right-6 z-50 w-[calc(100vw-24px)] sm:w-[380px] bg-white border border-neutral-300 shadow-2xl rounded-lg overflow-hidden flex flex-col h-[520px] max-h-[80vh] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-black text-white p-4 flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-black text-xs text-white">
                D
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                  DRIVEN Concierge
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                </h3>
                <p className="text-[9px] text-neutral-400 uppercase tracking-wider">
                  Live Response &bull; 10 AM – 9 PM IST
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Close Concierge"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 border-b border-neutral-200 bg-neutral-50 text-[10px] font-black uppercase tracking-wider text-center">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`py-2.5 transition-colors ${
                activeTab === "chat"
                  ? "bg-white text-black border-b-2 border-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Instant Assistant
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("channels")}
              className={`py-2.5 transition-colors ${
                activeTab === "channels"
                  ? "bg-white text-black border-b-2 border-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Direct Contacts
            </button>
          </div>

          {/* TAB 1: INSTANT LIVE CHAT */}
          {activeTab === "chat" && (
            <>
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa] text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-md leading-relaxed whitespace-pre-line ${
                        m.sender === "user"
                          ? "bg-black text-white text-right"
                          : "bg-white border border-neutral-200 text-neutral-900 shadow-xs"
                      }`}
                    >
                      {m.text}

                      {/* Action Link Button */}
                      {m.actionLink && (
                        <div className="mt-2.5 pt-2 border-t border-neutral-100">
                          {m.actionLink.external ? (
                            <a
                              href={m.actionLink.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors"
                            >
                              {m.actionLink.label} &rarr;
                            </a>
                          ) : (
                            <Link
                              href={m.actionLink.url}
                              onClick={() => setIsOpen(false)}
                              className="inline-block bg-black hover:bg-orange-600 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors"
                            >
                              {m.actionLink.label} &rarr;
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Action Options */}
                    {m.options && m.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSendMessage(opt)}
                            className="bg-white hover:bg-neutral-900 hover:text-white border border-neutral-300 text-neutral-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 transition-colors rounded-xs shadow-2xs"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-[8px] text-neutral-400 mt-1 uppercase font-semibold">
                      {m.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 p-3 bg-white border border-neutral-200 rounded-md w-16 text-neutral-400">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="p-3 bg-white border-t border-neutral-200 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question or enter Order ID..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-black uppercase placeholder:normal-case font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-black hover:bg-orange-600 disabled:bg-neutral-300 text-white px-3.5 py-2 text-xs font-black uppercase transition-colors"
                >
                  &rarr;
                </button>
              </form>
            </>
          )}

          {/* TAB 2: DIRECT CHANNELS (WHATSAPP, EMAIL, PHONE) */}
          {activeTab === "channels" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-xs">
              {/* WhatsApp Priority Card */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  "Hello DRIVEN Support Desk, I would like to inquire about my order / product sizing."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="block p-4 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 transition-colors group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
                    <span className="text-base">💬</span> WhatsApp Live Chat
                  </span>
                  <span className="text-[9px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-xs">
                    Fastest
                  </span>
                </div>
                <p className="text-neutral-700 font-medium">
                  Connect immediately with our styling concierge for order questions, sizing advice, and quick returns.
                </p>
                <p className="text-[10px] text-emerald-900 font-mono font-bold mt-2">
                  +91 99999 99999 &rarr;
                </p>
              </a>

              {/* Official Email Desk */}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  "DRIVEN Inquiry - Client Support"
                )}&body=${encodeURIComponent(
                  "Hello DRIVEN Concierge,\n\nMy inquiry details:\n• Order ID (if applicable):\n• Description:\n\nThank you."
                )}`}
                className="block p-4 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-800 flex items-center gap-1.5">
                    <span className="text-base">✉️</span> Email Support Desk
                  </span>
                  <span className="text-[9px] font-bold uppercase text-neutral-500">
                    &lt; 4 Hours
                  </span>
                </div>
                <p className="text-neutral-600 font-medium">
                  For formal inquiries, business collaborations, or detailed order documentation.
                </p>
                <p className="text-[10px] text-neutral-900 font-mono font-bold mt-2">
                  {SUPPORT_EMAIL} &rarr;
                </p>
              </a>

              {/* Phone Desk */}
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
                className="block p-4 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-800 flex items-center gap-1.5">
                    <span className="text-base">📞</span> Tele-Concierge
                  </span>
                  <span className="text-[9px] font-bold uppercase text-neutral-500">
                    10 AM – 9 PM IST
                  </span>
                </div>
                <p className="text-neutral-600 font-medium">
                  Direct telephone support with our headquarter operations manager.
                </p>
                <p className="text-[10px] text-neutral-900 font-mono font-bold mt-2">
                  {SUPPORT_PHONE} &rarr;
                </p>
              </a>

              {/* Flagship Stores Link */}
              <div className="pt-2 text-center">
                <Link
                  href="/stores"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-bold text-orange-600 hover:underline uppercase tracking-wider"
                >
                  Visit Physical Flagship Stores (Delhi &bull; Mumbai &bull; Hyderabad) &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
