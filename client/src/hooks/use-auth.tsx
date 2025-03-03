import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Authentication context type definition
 * @interface AuthContextType
 * @property {SelectUser|null} user - The currently authenticated user or null if not authenticated
 * @property {boolean} isLoading - Whether authentication state is being loaded
 * @property {Error|null} error - Any error that occurred during authentication
 * @property {UseMutationResult} loginMutation - Mutation for logging in users
 * @property {UseMutationResult} logoutMutation - Mutation for logging out users
 * @property {UseMutationResult} registerMutation - Mutation for registering new users
 */
type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

/**
 * Login data type for authentication
 * @typedef {Object} LoginData
 * @property {string} username - User's username
 * @property {string} password - User's password
 */
type LoginData = Pick<InsertUser, "username" | "password">;

/**
 * Context for providing authentication state and functions throughout the application
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Authentication provider component that manages user authentication state
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to be wrapped by the provider
 * @returns {JSX.Element} Authentication provider component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Query to fetch the current authenticated user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  /**
   * Mutation for logging in a user
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Mutation for registering a new user
   */
  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Mutation for logging out the current user
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook for accessing authentication state and functions
 * 
 * @returns {AuthContextType} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 * @example
 * const { user, loginMutation } = useAuth();
 * 
 * // Login user
 * loginMutation.mutate({ username: 'user', password: 'pass' });
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
