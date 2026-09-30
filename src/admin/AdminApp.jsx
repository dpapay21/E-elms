import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase.js";
import { isConfiguredAdmin } from "./adminAccess.js";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import "./styles/admin.css";

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminReady, setAdminReady] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (authReady && !user) window.location.replace("/login");
  }, [authReady, user]);

  useEffect(() => onAuthStateChanged(auth, async (account) => {
    setUser(account);
    setAuthReady(true);
    setAdminReady(false);
    if (!account) {
      setCheckingAdmin(false);
      return;
    }

    setCheckingAdmin(true);
    if (isConfiguredAdmin(account)) {
      setAdminReady(true);
    } else {
      await signOut(auth);
    }
    setCheckingAdmin(false);
  }), []);

  async function handleSignOut() {
    await signOut(auth);
    setAdminReady(false);
  }

  if (!authReady || (user && checkingAdmin)) {
    return <div className="admin-loading" role="status"><span className="admin-spinner" />Checking administrator access…</div>;
  }

  if (user && adminReady) return <AdminDashboard user={user} onSignOut={handleSignOut} />;
  return <div className="admin-loading" role="status"><span className="admin-spinner" />Opening login…</div>;
}
