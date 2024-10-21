/* eslint-disable react/prop-types */

const ExpenseList = ({ expenses }) => {
  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-light text-gray-500">No expenses found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-extrabold text-blue-600 mb-8 text-center">
        Your Expenses
      </h2>
      <ul className="space-y-6">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header: Expense Name and Total */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {expense.name}
              </h3>
              <span className="text-lg font-medium text-gray-700">
                Total:{" "}
                <span className="font-bold">${expense.total_amount}</span>
              </span>
            </div>

            {/* Split Type */}
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Split Type:</span>{" "}
              <span className="font-light">{expense.split_type}</span>
            </div>

            {/* Created At */}
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Created At:</span>{" "}
              <span className="font-light">
                {new Date(expense.created_at).toLocaleString()}
              </span>
            </div>

            {/* Participants */}
            <div className="text-gray-800">
              <strong className="block mb-2 text-lg font-semibold">
                Participants
              </strong>
              <ul className="list-disc list-inside space-y-1">
                {expense.participants.map((participant, index) => (
                  <li
                    key={`${expense.id}-${participant.user_id || index}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="font-medium">{participant.username}</span>
                    <span className="text-gray-700">
                      {participant.amount_owed
                        ? `$${participant.amount_owed}`
                        : `${participant.percentage_owed}%`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;
