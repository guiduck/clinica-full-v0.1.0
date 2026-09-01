import Link from "next/link";
import { Wallet } from "lucide-react";
import { APP_NAVIGATION_ITEMS } from "@/constants/app-shell";
import { cn } from "@/lib/utils";
import { isActiveNavigationPath } from "@/utils/app-shell/navigation";

const BOTTOM_NAVIGATION_ITEMS = [
  ...APP_NAVIGATION_ITEMS,
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
] as const;

export function BottomNavigation({ path }: { path: string }) {
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t bg-surface lg:hidden"
    >
      {BOTTOM_NAVIGATION_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground",
            isActiveNavigationPath(path, item.href) && "text-primary",
          )}
        >
          <item.icon aria-hidden="true" className="size-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
