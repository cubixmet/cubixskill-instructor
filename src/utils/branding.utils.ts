export function getUserInitials(name?: string | null): string {
  if (!name || !name.trim()) return "AU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAcademyInitials(name?: string | null): string {
  if (!name || !name.trim()) return "CS";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getRoleLabel(roleCode?: string | null, assignedRoleName?: string | null): string {
  if (assignedRoleName && assignedRoleName.trim()) {
    return assignedRoleName;
  }
  switch (roleCode) {
    case "ACADEMY_ADMIN":
      return "Academy Admin";
    case "ACADEMY_STAFF":
      return "Academy Staff";
    case "SUPER_ADMIN":
      return "Super Admin";
    case "SUPER_ADMIN_STAFF":
      return "Super Admin Staff";
    case "STUDENT":
      return "Student";
    default:
      return "Academy User";
  }
}

export function updateBrowserFavicon(faviconUrl?: string | null): void {
  if (!faviconUrl || typeof document === "undefined") return;
  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "shortcut icon";
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

export function applyThemeColor(themeColor?: string | null): void {
  if (!themeColor || typeof document === "undefined") return;
  document.documentElement.style.setProperty("--academy-theme-color", themeColor);
}
