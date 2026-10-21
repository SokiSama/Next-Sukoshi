"use client";

import { useEffect, useSyncExternalStore, type MouseEvent } from "react";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";
import styles from "./ThemeModeControl.module.css";
import { transitionTheme } from "../lib/themeTransition";

type ThemeMode = "light" | "system" | "dark";
const storageKey = "journal-theme-mode";
const changeEvent = "journal-theme-mode-change";
let fallbackMode: ThemeMode = "system";

function readMode(): ThemeMode {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch {
    return fallbackMode;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

const modes = [
  { value: "light", label: "浅色模式", icon: Sun },
  { value: "system", label: "跟随系统", icon: Desktop },
  { value: "dark", label: "深色模式", icon: Moon },
] as const;

function selectMode(next: ThemeMode, origin: { x: number; y: number }) {
  const theme = next === "dark" || (next === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  fallbackMode = next;
  try { localStorage.setItem(storageKey, next); } catch { /* Keep the choice for this session. */ }
  transitionTheme(theme, () => {
    window.dispatchEvent(new Event(changeEvent));
  }, origin);
}

function subscribeSystem(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function ThemeModeControl({ compact = false, subtle = false }: { compact?: boolean; subtle?: boolean }) {
  const mode = useSyncExternalStore(subscribe, readMode, () => "system" as const);
  const systemDark = useSyncExternalStore(subscribeSystem, () => window.matchMedia("(prefers-color-scheme: dark)").matches, () => false);
  const dark = mode === "dark" || (mode === "system" && systemDark);
  const choose = (value: ThemeMode, event: MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    selectMode(value, event.detail ? { x: event.clientX, y: event.clientY } : { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const theme = mode === "dark" || (mode === "system" && media.matches) ? "dark" : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode]);

  if (compact) return <button className={styles.compact} type="button" aria-label={dark ? "切换到浅色模式" : "切换到深色模式"} title={dark ? "浅色模式" : "深色模式"} onClick={event => choose(dark ? "light" : "dark", event)}>{dark ? <Sun size={21} /> : <Moon size={21} />}</button>;

  return <div className={`${styles.control}${subtle ? ` ${styles.subtle}` : ""}`} role="group" aria-label="显示模式">
    {modes.map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-label={label} aria-pressed={mode === value} data-tooltip={label} onClick={event => choose(value, event)}>
      <Icon size={19} aria-hidden="true" />
    </button>)}
  </div>;
}
