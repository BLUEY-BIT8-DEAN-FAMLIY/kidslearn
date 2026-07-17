// "Sign in with Google" through the family's Supabase project (KIDS LEARN).
// Google blocks its sign-in page inside embedded app windows, so the flow runs
// in the system browser and comes back to this local server:
//
//   1. GET /api/auth/google/start  → build a PKCE authorize URL and open it
//      in the default browser.
//   2. Google → Supabase → redirects to http://localhost:<port>/auth/callback?code=…
//      where we exchange the code for the verified Google identity.
//   3. The login screen polls /api/auth/google/result and receives the same
//      kind of local session token that email+password login produces.
//
// Only the identity (email + name) is taken from Supabase; sessions stay in
// the app's own users.json system. The publishable key below is safe to ship
// in clients by design (it is not the secret service key).
import crypto from 'crypto';

const SUPABASE_URL = 'https://gkodcsmksurhlnxvpiry.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dGqsCHlAHyA-hKeNuvljtg_ZDEyeNw_';
export const GOOGLE_CALLBACK_PATH = '/auth/callback';

// One pending flow at a time — this is a single-family desktop app. Starting
// a new flow simply replaces the previous one.
let flow = null;
const FLOW_TTL_MS = 10 * 60 * 1000;

const b64url = (buf) =>
  buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Begin a PKCE flow; returns the Google authorize URL to open in a browser. */
export function startGoogleFlow(port) {
  const verifier = b64url(crypto.randomBytes(48));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  flow = { verifier, createdAt: Date.now(), result: null };
  const redirectTo = `http://localhost:${port}${GOOGLE_CALLBACK_PATH}`;
  return `${SUPABASE_URL}/auth/v1/authorize?provider=google` +
    `&redirect_to=${encodeURIComponent(redirectTo)}` +
    `&code_challenge=${challenge}&code_challenge_method=s256`;
}

/** Swap the callback code for the Google identity ({email, name}). */
export async function finishGoogleFlow(code) {
  if (!flow || Date.now() - flow.createdAt > FLOW_TTL_MS) {
    throw new Error('ההתחברות פגה — חזרו לאפליקציה ונסו שוב');
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ auth_code: String(code), code_verifier: flow.verifier }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.msg || data.message || data.error_description || 'ההתחברות מול Google נכשלה');
  }
  const user = data.user || {};
  const meta = user.user_metadata || {};
  if (!user.email) throw new Error('חשבון Google ללא כתובת אימייל');
  return { email: user.email, name: meta.full_name || meta.name || '' };
}

/** Store the finished login for the app to collect (it polls /result). */
export function setGoogleResult(result) {
  if (flow) flow.result = result;
}

/** Hand the finished login to the app exactly once. */
export function takeGoogleResult() {
  if (!flow || !flow.result) return null;
  const result = flow.result;
  flow = null;
  return result;
}
