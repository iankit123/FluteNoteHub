import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, displayName: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("fluteNotesUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user", error);
        localStorage.removeItem("fluteNotesUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      console.log("UserContext: Attempting login for", username);
      const res = await apiRequest("POST", "/api/users/login", { username, password });
      
      // Handle Response object directly returned from apiRequest
      if (res instanceof Response) {
        const userData = await res.json();
        console.log("UserContext: Login successful, user data:", userData);
        setUser(userData);
        localStorage.setItem("fluteNotesUser", JSON.stringify(userData));
        return userData;
      } 
      
      // Handle pre-parsed JSON response
      console.log("UserContext: Login successful, user data:", res);
      setUser(res);
      localStorage.setItem("fluteNotesUser", JSON.stringify(res));
      return res;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, displayName: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      console.log("UserContext: Attempting registration for", username);
      const res = await apiRequest("POST", "/api/users/register", { 
        username, 
        displayName, 
        password 
      });
      
      // Handle Response object directly returned from apiRequest
      if (res instanceof Response) {
        const userData = await res.json();
        console.log("UserContext: Registration successful, user data:", userData);
        setUser(userData);
        localStorage.setItem("fluteNotesUser", JSON.stringify(userData));
        return userData;
      }
      
      // Handle pre-parsed JSON response
      console.log("UserContext: Registration successful, user data:", res);
      setUser(res);
      localStorage.setItem("fluteNotesUser", JSON.stringify(res));
      return res;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fluteNotesUser");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
