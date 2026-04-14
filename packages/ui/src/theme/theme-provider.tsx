import {
  createElement,
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { setup, css } from "goober";
import { lightTheme, darkTheme } from "./tokens";
import type { Theme } from "./tokens";

// Initialize goober with React's createElement
setup(createElement);

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  mode: "system",
  resolvedMode: "dark",
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

function useSystemTheme(): "light" | "dark" {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return systemTheme;
}

interface ThemeProviderProps {
  mode?: ThemeMode;
  children: ReactNode;
}

export function DevtoolsThemeProvider({
  mode = "system",
  children,
}: ThemeProviderProps) {
  const systemTheme = useSystemTheme();
  const resolvedMode = mode === "system" ? systemTheme : mode;
  const theme = resolvedMode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, mode, resolvedMode }),
    [theme, mode, resolvedMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className={containerStyles(theme)}>{children}</div>
    </ThemeContext.Provider>
  );
}

const containerStyles = (theme: Theme) =>
  css({
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: "13px",
    color: theme.text.primary,
    backgroundColor: theme.bg.panel,
    lineHeight: "1.5",
    boxSizing: "border-box",
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },
  });
