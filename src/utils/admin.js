// بسيط ومرن: أدمن إذا كان role==='admin' أو isAdmin=true
export function isAdmin(user) {
  if (!user) return false;
  return user.role === "admin" || user.isAdmin === true;
}
