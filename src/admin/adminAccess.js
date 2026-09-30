const ADMIN_EMAIL = "papa@gmail.com";
export function isConfiguredAdmin(user) {
  const normalizedEmail = user?.email?.trim().toLowerCase();
  return normalizedEmail === ADMIN_EMAIL || normalizedEmail === "deksiman721@gmail.com";
}
