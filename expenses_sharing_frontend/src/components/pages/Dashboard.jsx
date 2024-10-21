import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AddExpense from "../Expenses/AddExpense";
import ExpenseList from "../Expenses/ExpenseList";
import { formatCurrency } from "../../utils/formatCurrency"; // Import the utility function

const Dashboard = () => {
  const { user } = useAuth(); // Get user data from AuthContext
  const [latestExpense, setLatestExpense] = useState(null); // Store the latest expense
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state
  const navigate = useNavigate(); // Navigation hook

  // Fetch the latest expense
  const fetchLatestExpense = async () => {
    try {
      const response = await api.get(`/expenses/user/${user.userId}/latest/`);
      setLatestExpense(response.data); // Update latest expense state
      setLoading(false);
    } catch (err) {
      console.log(err);

      setError("Failed to load the latest expense.");
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchLatestExpense();
  }, []);

  // Handle download of latest expense
  const downloadLatestExpense = async () => {
    try {
      const response = await api.get(
        `/expenses/user/${user.userId}/latest/download/`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "latest_expense.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download the latest expense.", error);
      alert("Failed to download the latest expense.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Loading latest expense...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Dashboard Header */}
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">
          Dashboard
        </h1>

        {/* Add Expense Section */}
        <div className="mb-8">
          <AddExpense onExpenseAdded={fetchLatestExpense} />
        </div>

        {/* Latest Expense Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Latest Expense
            {/* <ExpenseList /> */}
          </h2>
          {latestExpense ? (
            <div className="border rounded-lg p-6 bg-gray-50 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  {latestExpense.name}
                </h3>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(latestExpense.total_amount)}
                </span>
              </div>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Split Type:</span>{" "}
                {latestExpense.split_type}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Created At:</span>{" "}
                {new Date(latestExpense.created_at).toLocaleString()}
              </p>

              {/* Participants List */}
              <div className="text-gray-700 mb-4">
                <strong>Participants:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {latestExpense.participants.map((participant, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{participant.username}</span>
                      <span>
                        {participant.amount_owed
                          ? formatCurrency(participant.amount_owed)
                          : `${participant.percentage_owed}%`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Download Button */}
              <button
                onClick={downloadLatestExpense}
                className="w-full bg-blue-500 text-white py-2 mt-4 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Download Latest Expense
              </button>
            </div>
          ) : (
            <p className="text-gray-600">No recent expense found.</p>
          )}
        </div>

        {/* View Expense History Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/expenses/history")}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300"
          >
            View Expense History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
