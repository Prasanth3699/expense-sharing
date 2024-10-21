import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Register from "../Auth/Register";

const RegisterPage = () => {
  const { user } = useAuth(); // Access user data from AuthContext
  const navigate = useNavigate(); // Navigation hook

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-6">
          Register
        </h1>
        <Register />
      </div>
    </div>
  );
};

export default RegisterPage;
