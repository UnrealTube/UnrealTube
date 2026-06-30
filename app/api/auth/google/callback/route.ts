import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:13000";
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code || !CLIENT_ID) {
    return new NextResponse("Auth error", { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("No access token");

    // Get user profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    const user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.picture,
      googleLinked: true,
    };

    // Post user back to opener and close popup
    const html = `<!DOCTYPE html><html><body><script>
window.opener.postMessage({type:"google-auth-success",user:${JSON.stringify(user)}},"${APP_URL}");
window.close();
</script></body></html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  } catch {
    return new NextResponse("Auth failed", { status: 500 });
  }
}
