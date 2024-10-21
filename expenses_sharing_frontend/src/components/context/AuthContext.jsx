import { createContext, useContext, useState, useEffect } from "react";
import api from "../../services/api"; // Adjust path based on your folder structure
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Create Auth Context
const AuthContext = createContext();

// AuthProvider Component to provide AuthContext to child components
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user details from local storage on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    const username = localStorage.getItem("username");

    if (token && userId && username) {
      setUser({ username, userId });
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/token/", {
        username,
        password,
      });

      const {
        access,
        refresh,
        user_id,
        username: fetchedUsername,
      } = response.data;

      if (!user_id) {
        toast.error("Login failed: User ID is missing.");
        return {
          success: false,
          error: { general: "User ID is missing in response" },
        };
      }

      // Store tokens and user info in localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("username", fetchedUsername);

      setUser({ username: fetchedUsername, userId: user_id });

      toast.success("Logged in successfully!");
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.detail || "Login failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (username, email, password, mobile_number) => {
    try {
      const response = await api.post("/users/register/", {
        username,
        email,
        password,
        mobile_number,
      });

      toast.success("Registration successful!");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMessage = error.response?.data || "Registration failed.";
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    setUser(null);
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  // Provide values to the context
  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to access AuthContext
export const useAuth = () => useContext(AuthContext);
