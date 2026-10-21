import { Archive, Books, House, Link, UserCircle } from "@phosphor-icons/react";

const navItems = [
  { key: "home", label: "首页", href: "/", icon: House },
  { key: "collection", label: "品鉴", href: "/collection", icon: Books },
  { key: "friends", label: "友链", href: "/friends", icon: Link },
  { key: "archive", label: "归档", href: "/archive", icon: Archive },
  { key: "about", label: "关于", href: "/about", icon: UserCircle },
];

export function PrimaryNav({ active, className = "primary-nav", onNavigate }: { active?: string; className?: string; onNavigate?: () => void }) {
  return (
    <nav className={className} aria-label="主导航">
      {navItems.map((item) => {
        const Icon = item.icon;
        return <a className={active === item.key ? "active" : undefined} href={item.href} key={item.key} aria-current={active === item.key ? "page" : undefined} onClick={onNavigate}>
          <Icon aria-hidden="true" weight="regular" />
          <span>{item.label}</span>
        </a>;
      })}
    </nav>
  );
}
