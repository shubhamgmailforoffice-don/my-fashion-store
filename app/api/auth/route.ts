import { NextResponse } from "next/server";
import { getDB, saveDB, User } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, identifier, password, name } = body;
    const db = getDB();

    // 1. UNIFIED LOGIN (Email OR Mobile + Compulsory Password)
    if (action === "login") {
      if (!identifier || !identifier.trim()) {
        return NextResponse.json(
          { success: false, error: "Email or mobile number is required" },
          { status: 400 }
        );
      }

      if (!password || !password.trim()) {
        return NextResponse.json(
          { success: false, error: "Password is compulsory. Please enter your password." },
          { status: 400 }
        );
      }

      const rawId = identifier.trim();
      const isEmail = rawId.includes("@");
      const cleanPhone = rawId.replace(/\D/g, "");

      // Fast Admin Check
      if (
        (rawId.toLowerCase() === "admin@fashionstore.com" ||
          rawId.toLowerCase() === "admin" ||
          cleanPhone === "9999999999") &&
        password === "admin123"
      ) {
        return NextResponse.json({
          success: true,
          user: {
            id: "admin-1",
            name: "Head of Operations",
            email: "admin@fashionstore.com",
            phone: "9999999999",
            role: "admin",
            createdAt: "2026-09-01",
          },
        });
      }

      // 1A. Try Cloud PostgreSQL first
      if (process.env.DATABASE_URL) {
        try {
          const { prisma } = await import("@/lib/prisma");
          let user = await prisma.user.findFirst({
            where: isEmail
              ? { email: { equals: rawId, mode: "insensitive" } }
              : { phone: cleanPhone.slice(-10) },
          });

          if (user) {
            // Check compulsory password
            if (user.password && user.password !== password) {
              return NextResponse.json(
                { success: false, error: "Incorrect password. Please verify and try again." },
                { status: 401 }
              );
            }

            // If user existed without password previously, set it now
            if (!user.password) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { password },
              });
            }

            return NextResponse.json({
              success: true,
              user: {
                id: user.id,
                name: user.name,
                email: user.email || undefined,
                phone: user.phone || undefined,
                role: user.role as "customer" | "admin",
                createdAt: user.createdAt,
              },
            });
          }
        } catch (e) {
          console.error("Prisma auth lookup error:", e);
        }
      }

      // 1B. Fallback to local db.json
      const user = db.users.find((u) =>
        isEmail
          ? u.email?.toLowerCase() === rawId.toLowerCase()
          : u.phone?.replace(/\D/g, "").endsWith(cleanPhone.slice(-10))
      );

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "No account found with this email or mobile number. Please switch to 'Create Account' below.",
          },
          { status: 404 }
        );
      }

      if (user.password && user.password !== password) {
        return NextResponse.json(
          { success: false, error: "Incorrect password. Please verify and try again." },
          { status: 401 }
        );
      }

      if (!user.password) {
        user.password = password;
        saveDB(db);
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // 2. UNIFIED SIGNUP (Full Name + Email OR Mobile + Compulsory Password)
    if (action === "signup") {
      if (!identifier || !identifier.trim()) {
        return NextResponse.json(
          { success: false, error: "Email or mobile number is required" },
          { status: 400 }
        );
      }

      if (!password || password.trim().length < 4) {
        return NextResponse.json(
          { success: false, error: "Password is compulsory (minimum 4 characters required)" },
          { status: 400 }
        );
      }

      const rawId = identifier.trim();
      const isEmail = rawId.includes("@");
      const cleanPhone = rawId.replace(/\D/g, "");

      if (!isEmail && cleanPhone.length < 10) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid 10-digit Indian mobile number or email address" },
          { status: 400 }
        );
      }

      const finalPhone = !isEmail ? cleanPhone.slice(-10) : undefined;
      const finalEmail = isEmail ? rawId.toLowerCase() : undefined;
      const finalName =
        name && name.trim()
          ? name.trim()
          : isEmail
          ? rawId.split("@")[0].toUpperCase()
          : `MEMBER ${finalPhone?.slice(-4)}`;

      // 2A. Check and save to PostgreSQL
      if (process.env.DATABASE_URL) {
        try {
          const { prisma } = await import("@/lib/prisma");
          const existing = await prisma.user.findFirst({
            where: isEmail
              ? { email: { equals: finalEmail, mode: "insensitive" } }
              : { phone: finalPhone },
          });

          if (existing) {
            return NextResponse.json(
              { success: false, error: "An account with this email/mobile already exists. Please sign in." },
              { status: 400 }
            );
          }

          const newUser = await prisma.user.create({
            data: {
              id: `user-${Date.now()}`,
              name: finalName,
              email: finalEmail || null,
              phone: finalPhone || null,
              password: password,
              role: "customer",
              createdAt: new Date().toISOString().split("T")[0],
            },
          });

          return NextResponse.json({
            success: true,
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email || undefined,
              phone: newUser.phone || undefined,
              role: "customer",
              createdAt: newUser.createdAt,
            },
          });
        } catch (e) {
          console.error("Prisma signup error:", e);
        }
      }

      // 2B. Fallback to db.json
      const existingInDb = db.users.find((u) =>
        isEmail
          ? u.email?.toLowerCase() === finalEmail?.toLowerCase()
          : u.phone?.replace(/\D/g, "").endsWith(finalPhone || "")
      );

      if (existingInDb) {
        return NextResponse.json(
          { success: false, error: "An account with this email/mobile already exists. Please sign in." },
          { status: 400 }
        );
      }

      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        password: password,
        role: "customer",
        createdAt: new Date().toISOString().split("T")[0],
      };

      db.users.push(fallbackUser);
      saveDB(db);

      return NextResponse.json({ success: true, user: fallbackUser });
    }

    // 3. Fast Demo Admin
    if (action === "admin-demo") {
      return NextResponse.json({
        success: true,
        user: {
          id: "admin-1",
          name: "Head of Operations",
          email: "admin@fashionstore.com",
          phone: "9999999999",
          role: "admin",
          createdAt: "2026-09-01",
        },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
