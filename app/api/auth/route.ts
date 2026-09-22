import { NextResponse } from "next/server";
import { getDB, saveDB, User } from "@/lib/store";

// In-memory OTP storage for local development
const otpStore: Record<string, { code: string; expires: number }> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const db = getDB();

    // 1. Send Mobile OTP
    if (action === "send-otp") {
      const { phone } = body;
      if (!phone || phone.length < 10) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid 10-digit mobile number" },
          { status: 400 }
        );
      }

      // Generate 4-digit OTP code
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      otpStore[phone] = {
        code: generatedOtp,
        expires: Date.now() + 5 * 60 * 1000, // 5 mins
      };

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to +91 ${phone}`,
        otp: generatedOtp, // Returned for simulated local testing
      });
    }

    // 2. Verify Mobile OTP
    if (action === "verify-otp") {
      const { phone, otp, name } = body;
      const record = otpStore[phone];

      // Accept the exact OTP or master demo code "1234"
      const isValid = (record && record.code === otp) || otp === "1234";

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired OTP. Use demo OTP: 1234" },
          { status: 400 }
        );
      }

      delete otpStore[phone];

      // Check if user exists
      let user = db.users.find((u) => u.phone === phone);
      if (!user) {
        user = {
          id: `user-${Date.now()}`,
          name: name || `Customer ${phone.slice(-4)}`,
          phone: phone,
          role: phone === "9999999999" ? "admin" : "customer",
          createdAt: new Date().toISOString().split("T")[0],
        };
        db.users.push(user);
        saveDB(db);
      }

      return NextResponse.json({ success: true, user });
    }

    // 3. Email & Password Login
    if (action === "login-email") {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: "Email and password are required" },
          { status: 400 }
        );
      }

      // Admin check
      if (email.toLowerCase() === "admin@fashionstore.com" && password === "admin123") {
        return NextResponse.json({
          success: true,
          user: {
            id: "admin-1",
            name: "Head of Operations",
            email: "admin@fashionstore.com",
            role: "admin",
            createdAt: "2026-09-01",
          },
        });
      }

      let user = db.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!user) {
        // Auto register friendly mock customer
        user = {
          id: `user-${Date.now()}`,
          name: email.split("@")[0].toUpperCase(),
          email: email,
          role: "customer",
          createdAt: new Date().toISOString().split("T")[0],
        };
        db.users.push(user);
        saveDB(db);
      }

      return NextResponse.json({ success: true, user });
    }

    // 4. Email Signup
    if (action === "signup-email") {
      const { name, email, password } = body;
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: "Email and password are required" },
          { status: 400 }
        );
      }

      const existing = db.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists" },
          { status: 400 }
        );
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name || email.split("@")[0],
        email: email,
        role: "customer",
        createdAt: new Date().toISOString().split("T")[0],
      };

      db.users.push(newUser);
      saveDB(db);

      return NextResponse.json({ success: true, user: newUser });
    }

    // 5. Admin Fast Login
    if (action === "admin-demo") {
      return NextResponse.json({
        success: true,
        user: {
          id: "admin-1",
          name: "Fashion Store Admin",
          email: "admin@fashionstore.com",
          role: "admin",
          createdAt: "2026-09-01",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
