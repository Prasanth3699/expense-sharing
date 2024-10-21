import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa"; // User icon

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Track dropdown state

  // Toggle the dropdown menu
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  return (
    <nav className="bg-gray-900 text-white py-4 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Brand Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-wider text-white hover:text-blue-400 transition duration-300"
          style={{ fontFamily: "'Poppins', sans-serif" }} // Brand font change
        >
          Daily Expenses
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {user ? (
            <div className="relative">
              {/* User Name with Icon */}
              <button
                className="flex items-center space-x-2 text-lg font-semibold capitalize hover:text-blue-400 transition duration-300"
                onClick={toggleDropdown}
              >
                <FaUserCircle className="text-2xl" />
                <span>{user.username}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-lg">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition duration-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Login and Register Links */}
              <Link
                to="/login"
                className="text-lg hover:text-blue-400 transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-lg hover:text-blue-400 transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
