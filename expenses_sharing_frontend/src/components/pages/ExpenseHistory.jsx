import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // For notifications
import api from "../../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../../utils/formatCurrency";

const ExpenseHistory = () => {
  const { user } = useAuth(); // Get user data from AuthContext
  const [expenses, setExpenses] = useState([]); // Store expenses
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state
  const [selectedExpenses, setSelectedExpenses] = useState([]); // Track selected expenses

  // Fetch all expenses for the current user
  const fetchExpenses = async () => {
    if (!user) return; // Ensure user is available

    setLoading(true); // Start loading
    setError(""); // Reset error state

    try {
      const response = await api.get(`/expenses/user/${user.userId}/`);
      setExpenses(response.data.reverse()); // Reverse to show latest first
    } catch (err) {
      console.log(err);

      setError("Failed to load expenses.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch expenses only when `user` is available
  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]); // Fetch whenever `user` changes

  // Handle checkbox selection
  const handleCheckboxChange = (expenseId) => {
    setSelectedExpenses((prevSelected) =>
      prevSelected.includes(expenseId)
        ? prevSelected.filter((id) => id !== expenseId)
        : [...prevSelected, expenseId]
    );
  };

  // Handle download of selected expenses
  const handleDownload = async () => {
    if (selectedExpenses.length === 0) {
      toast.warn("Please select at least one expense to download.");
      return;
    }

    try {
      const response = await api.get(
        `/expenses/balance-sheet/?expense_ids=${selectedExpenses.join(",")}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `selected_expenses.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log(err);

      setError("Failed to download expenses.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={fetchExpenses}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-10">
          Expense History
        </h1>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleDownload}
            className={`bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300 ${
              selectedExpenses.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={selectedExpenses.length === 0}
          >
            Download Selected Expenses
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="text-center text-gray-600">No expenses found.</p>
        ) : (
          <ul className="space-y-6">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700">
                      {expense.name}
                    </h2>
                    <p className="text-gray-600">
                      Total:{" "}
                      <span className="font-medium">
                        {formatCurrency(expense.total_amount)}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Split Type:{" "}
                      <span className="font-light">{expense.split_type}</span>
                    </p>
                    <p className="text-gray-600">
                      Created At:{" "}
                      {new Date(expense.created_at).toLocaleString()}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    className="w-6 h-6 cursor-pointer"
                    checked={selectedExpenses.includes(expense.id)}
                    onChange={() => handleCheckboxChange(expense.id)}
                  />
                </div>

                <div className="mt-4">
                  <strong className="block text-gray-800 mb-2">
                    Participants:
                  </strong>
                  <ul className="list-disc list-inside space-y-1">
                    {expense.participants.map((participant, index) => (
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExpenseHistory;
