import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { licenseKey } = await req.json();

  if (!licenseKey) {
    return NextResponse.json({ valid: false, error: "No license key provided" }, { status: 400 });
  }

  const productId = process.env.GUMROAD_PRODUCT_ID;
  if (!productId) {
    return NextResponse.json({ valid: false, error: "License verification is not configured." }, { status: 500 });
  }

  const params = new URLSearchParams({
    product_id: productId,
    license_key: licenseKey.trim(),
    increment_uses_count: "true",
  });

  const res = await fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();

  if (data.success) {
    if (data.uses > 1) {
      return NextResponse.json({ valid: false, error: "This license key has already been used on another account." });
    }
    return NextResponse.json({ valid: true, email: data.purchase?.email });
  }

  return NextResponse.json({ valid: false, error: data.message || "Invalid license key" });
}
