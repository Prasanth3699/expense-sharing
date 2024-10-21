import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./components/pages/RegisterPage";
import LoginPage from "./components/pages/LoginPage";
import Dashboard from "./components/pages/Dashboard";
import ExpenseHistory from "./components/pages/ExpenseHistory";
import NotFound from "./components/pages/NotFound";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import { AuthProvider } from "./components/context/AuthContext";
import PrivateRoute from "./components/Layout/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      {" "}
      {/* Router should wrap the entire tree */}
      <AuthProvider>
        {" "}
        {/* AuthProvider inside Router */}
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow container mx-auto p-4">
            <Routes>
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/expenses/history" element={<ExpenseHistory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;
