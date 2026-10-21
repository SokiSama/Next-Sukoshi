import { GithubLogo, TwitterLogo, SteamLogo } from "@phosphor-icons/react/dist/ssr";
import { EmailBrandIcon, TelegramBrandIcon } from "./BrandSocialIcons";
import { siteConfig } from "../../site.config";
import styles from "./HomePage.module.css";
const links = [
  { icon: GithubLogo, name: "GitHub", href: siteConfig.social.github },
  { icon: TwitterLogo, name: "Twitter", href: siteConfig.social.twitter },
  { icon: TelegramBrandIcon, name: "Telegram", href: siteConfig.social.telegram },
  { icon: SteamLogo, name: "Steam", href: siteConfig.social.steam },
  { icon: EmailBrandIcon, name: "邮件", href: siteConfig.social.email ? `mailto:${siteConfig.social.email}` : "" },
].filter(link => link.href);
export function ProfileSocialLinks({ id }: { id?: string }) {
  if (!links.length) return null;
  return <div className={styles.socials} id={id} aria-label="个人主页链接">{links.map(({ icon: Icon, name, href }) =>
    <a key={name} className={styles.socialLink} href={href} aria-label={name} title={name} target={href.startsWith("https:") ? "_blank" : undefined} rel={href.startsWith("https:") ? "noreferrer" : undefined}><Icon size={24} weight="fill" aria-hidden="true" /></a>
  )}</div>;
}
