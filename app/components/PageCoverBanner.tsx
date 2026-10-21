import type { CSSProperties } from "react";

type PageCoverBannerProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
};

export function PageCoverBanner({
  eyebrow,
  title,
  description,
  image,
  imagePosition = "center",
  imageFit = "cover",
}: PageCoverBannerProps) {
  const coverStyle = {
    "--route-cover-image": `url("${image}")`,
    "--route-cover-position": imagePosition,
  } as CSSProperties;

  return (
    <section
      className={`route-cover${imageFit === "contain" ? " route-cover--contain" : ""}`}
      style={coverStyle}
      aria-label={`${title}页面封面`}
    >
      <div className="route-cover__artwork" aria-hidden="true" />
      <div className="route-cover__shade" aria-hidden="true" />
      <div className="route-cover__card">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <i aria-hidden="true" />
      </div>
    </section>
  );
}
