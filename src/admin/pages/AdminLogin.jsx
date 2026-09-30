import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase.js";
import landingLogo from "../../assets/877d674005f4.png";

function readableError(error) {
  if (error?.code === "auth/invalid-credential" || error?.code === "auth/wrong-password" || error?.code === "auth/user-not-found") {
    return "Firebase could not sign in. Confirm the Email/Password account papa@gmail.com exists and that you are entering its current password.";
  }
  if (error?.code === "auth/operation-not-allowed") return "Enable Email/Password under Firebase Authentication → Sign-in method.";
  if (error?.code === "auth/user-disabled") return "This Firebase Authentication account is disabled. Enable it in the Firebase Console.";
  if (error?.code === "auth/invalid-api-key") return "Firebase rejected this app's API key. Check the Firebase project configuration.";
  if (error?.code === "auth/too-many-requests") return "Too many sign-in attempts. Wait a moment and try again.";
  if (error?.code === "auth/network-request-failed") return "Could not reach Firebase. Check your connection and retry.";
  return "Administrator sign-in failed. Check the account and Firebase Authentication settings.";
}

export default function AdminLogin({ message = "" }) {
  const [phone, setPhone] = useState("0960625242");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const signInEmail = phone.trim().toLowerCase();

      let resolvedEmail = signInEmail;
      if (!resolvedEmail.includes("@")) {
        const digits = signInEmail.replace(/\D/g, "");
        const localNumber = digits.startsWith("251") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits;
        if (localNumber !== "960625242") {
          setError("Enter the configured phone number or administrator email.");
          return;
        }
        resolvedEmail = "papa@gmail.com";
      }
      // Firebase password authentication is email-based. This approved phone
      // alias signs into the configured admin Auth account without exposing a password.
      await signInWithEmailAndPassword(auth, resolvedEmail.trim().toLowerCase(), password);
    } catch (signInError) {
      setError(readableError(signInError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-brand"><img src={landingLogo} alt="" /><span>E-LMIS <small>ADMIN</small></span></div>
        <p className="admin-eyebrow">SECURE WORKSPACE</p>
        <h1>Administrator sign in</h1>
        <p className="admin-login-copy">Review applicant submissions and manage their approval status.</p>
        {(message || error) && <p className="admin-alert" role="alert">{error || message}</p>}
        <label className="admin-form-field">Phone number or email
          <input autoComplete="username" inputMode={phone.includes("@") ? "email" : "tel"} type="text" value={phone} onChange={(event) => setPhone(event.target.value)} required />
        </label>
        <label className="admin-form-field">Password
          <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="admin-primary-button admin-login-submit" type="submit" disabled={busy}>
          {busy ? <><span className="admin-button-spinner" /> Signing in…</> : "Sign in securely"}
        </button>
        <p className="admin-login-footnote">Admin access is managed by the Firebase project administrator.</p>
      </form>
    </main>
  );
}
