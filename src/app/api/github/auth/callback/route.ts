import { NextRequest, NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code provided" },
      { status: 400 }
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
        }),
      }
    );

    const data = await tokenResponse.json();

    if (data.error) {
      console.error("GitHub OAuth error:", data);
      return NextResponse.json(
        { error: data.error_description || "GitHub authentication failed" },
        { status: 400 }
      );
    }

    const accessToken = data.access_token;

    if (!accessToken) {
      console.error("No access token received:", data);
      return NextResponse.json(
        { error: "No access token received" },
        { status: 400 }
      );
    }

    // Create response with success message
    const response = NextResponse.redirect(new URL("/", request.url));

    // Set the access token in an HTTP-only cookie
    response.cookies.set({
      name: "github_access_token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during GitHub OAuth:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
