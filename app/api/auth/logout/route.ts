import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "تم تسجيل الخروج بنجاح",
  });

  // Clear all auth cookies
  const cookiesToClear = [
    "authToken",
    "adminToken",
    "bearer_token",
    "localAuthSession",
  ];

  for (const name of cookiesToClear) {
    response.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
    });
  }

  return response;
}

export async function GET() {
  return POST();
}
