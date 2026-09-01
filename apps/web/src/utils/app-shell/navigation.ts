export function isActiveNavigationPath(path: string, href: string): boolean {
  return path === href || path.startsWith(`${href}/`);
}
