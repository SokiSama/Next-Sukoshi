type Theme = "light" | "dark";
type Origin = { x: number; y: number };

let activeTransition: ViewTransition | undefined;
let activeAnimation: Animation | undefined;
let generation = 0;

// Reveal the new palette from the clicked control with a soft circular edge.
export function transitionTheme(theme: Theme, commit: () => void, origin: Origin) {
  const root = document.documentElement;
  const id = ++generation;
  const apply = () => {
    if (id !== generation) return;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    commit();
  };
  activeTransition?.skipTransition();
  activeAnimation?.cancel();
  activeTransition = undefined;
  activeAnimation = undefined;
  root.classList.remove("theme-transitioning");

  if (root.dataset.theme === theme || !document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }

  root.classList.add("theme-transitioning");
  const transition = document.startViewTransition(apply);
  activeTransition = transition;
  const clean = () => {
    if (id !== generation) return;
    root.classList.remove("theme-transitioning");
    activeTransition = undefined;
    activeAnimation = undefined;
  };
  void transition.finished.catch(() => {}).finally(clean);
  void transition.ready.then(() => {
    if (id !== generation) return;
    const { x, y } = origin;
    const radius = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) / .7);
    const mask = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="fade"><stop offset="70%" stop-color="black"/><stop offset="100%" stop-color="black" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#fade)"/></svg>')}")`;
    activeAnimation = root.animate({
      maskImage: [mask, mask],
      maskRepeat: ["no-repeat", "no-repeat"],
      maskPosition: [`${x}px ${y}px`, `${x - radius}px ${y - radius}px`],
      maskSize: ["0px 0px", `${radius * 2}px ${radius * 2}px`],
    }, { duration: 500, easing: "ease-in", pseudoElement: "::view-transition-new(root)" });
  }).catch(clean);
}
