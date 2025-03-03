import { useState, useEffect } from "react";

/**
 * A hook that returns true if the current viewport matches the given media query
 * 
 * @param query Media query string to match against (e.g., "(max-width: 768px)")
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state if window is available
  const getMatches = (): boolean => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  // State to track if the media query matches
  const [matches, setMatches] = useState<boolean>(getMatches());

  // Effect to add event listener for media query changes
  useEffect(() => {
    // Safety check for SSR
    if (typeof window === "undefined") return undefined;

    // Get media query list
    const mediaQuery = window.matchMedia(query);
    
    // Handler function for media query changes
    const handleChange = () => setMatches(mediaQuery.matches);
    
    // Add the listener
    mediaQuery.addEventListener("change", handleChange);
    
    // Initial check
    handleChange();
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
} 