import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { publicRoutes } from "@/lib/seo/public-routes";
import { cn } from "@/lib/utils";

type LegalLinksProps = {
  className?: string;
  compact?: boolean;
};

export function LegalLinks({ className, compact = false }: LegalLinksProps) {
  return (
    <nav
      aria-label="Links legais"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground",
        compact && "justify-center text-xs",
        className
      )}
    >
      <span className="inline-flex items-center gap-2 font-medium text-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
        LGPD e privacidade
      </span>
      <Link className="hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href={publicRoutes.terms}>
        Termos de uso
      </Link>
      <Link className="hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href={publicRoutes.privacy}>
        Politica de privacidade
      </Link>
    </nav>
  );
}
