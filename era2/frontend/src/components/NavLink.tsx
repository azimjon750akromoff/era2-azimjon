import { Link } from "@/shared/routing";
import { cn } from "@/shared/lib/utils";

type NavLinkCompatProps = Omit<React.ComponentProps<typeof Link>, "activeProps"> & {
  activeClassName?: string;
};

function NavLink({ className, activeClassName, to, ref, ...props }: NavLinkCompatProps & { ref?: React.Ref<HTMLAnchorElement> }) {
  return (
    <Link
      ref={ref}
      to={to}
      className={className}
      activeProps={{ className: cn(className, activeClassName) }}
      {...props}
    />
  );
}

NavLink.displayName = "NavLink";

export { NavLink };
