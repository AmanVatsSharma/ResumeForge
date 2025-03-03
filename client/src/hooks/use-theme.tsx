import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Theme = "dark" | "light";

type ThemeData = {
  appearance: Theme;
  variant: string;
  primary: string;
  radius: number;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  isLoading: true,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "resume-forge-theme",
  ...props
}: ThemeProviderProps) {
  const queryClient = useQueryClient();
  
  // Fetch theme from API
  const { data: themeData, isLoading } = useQuery<ThemeData>({
    queryKey: ["/api/theme"],
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Update theme mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (newTheme: { appearance: Theme }) => {
      const response = await fetch("/api/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTheme),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update theme");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme"] });
    },
  });

  // Use local storage as fallback
  const [localTheme, setLocalTheme] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // Determine the current theme
  const theme = themeData?.appearance || localTheme;

  // Update the document class when theme changes
  React.useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Save theme to local storage when it changes
  React.useEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        setLocalTheme(newTheme);
        updateThemeMutation.mutate({ appearance: newTheme });
      },
      isLoading,
    }),
    [theme, updateThemeMutation, isLoading]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}; 