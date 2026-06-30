import { NextResponse } from "next/server";

/**
 * Google OAuth entry point.
 * Redirects to Google's consent page.
 * After consent, Google calls back to /api/auth/google/callback.
 *
 * Env vars needed (optional — without them we show a demo page):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   NEXT_PUBLIC_APP_URL   e.g. https://yourdomain.com
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:13000"}/api/auth/google/callback`;

export async function GET() {
  if (!CLIENT_ID) {
    // No credentials configured — return a demo page that posts a mock user
    const html = `<!DOCTYPE html><html><head><title>Sign In</title>
<style>body{font-family:sans-serif;background:#050810;color:#E8EDF5;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:20px;margin:0}
button{background:linear-gradient(135deg,#00D4FF,#8B5CF6);color:#050810;border:none;padding:14px 32px;border-radius:999px;font-size:15px;font-weight:700;cursor:pointer;}
p{color:#7A8BA0;font-size:13px;text-align:center;max-width:320px}</style></head>
<body>
<h2 style="font-family:monospace;letter-spacing:3px">UNREALTUBE</h2>
<p>Google OAuth credentials not configured.<br/>Click below to sign in with a demo account.</p>
<button onclick="signInDemo()">Continue with Google (Demo)</button>
<script>
function signInDemo(){
  const user={id:"demo_001",name:"Demo User",email:"demo@unrealtube.app",avatar:"https://ui-avatars.com/api/?name=Demo+User&background=00D4FF&color=050810",googleLinked:true};
  window.opener.postMessage({type:"google-auth-success",user},"*");
  window.close();
}
</script></body></html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
