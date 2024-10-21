import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { TiDelete } from "react-icons/ti";

const AddExpense = ({ onExpenseAdded }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    total_amount: "",
    split_type: "EQUAL", // Default split type
  });

  const [participantUsernames, setParticipantUsernames] = useState([""]);
  const [participantAmounts, setParticipantAmounts] = useState([]); // For EXACT split
  const [participantPercentages, setParticipantPercentages] = useState([]); // For PERCENTAGE split
  const [errors, setErrors] = useState({
    form: {},
    participants: [],
  });
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({
      ...errors,
      form: { ...errors.form, [e.target.name]: "" },
    });

    // Reset participant-related fields when split type changes
    if (e.target.name === "split_type") {
      setParticipantAmounts([]);
      setParticipantPercentages([]);
    }
  };

  const handleParticipantChange = (index, value) => {
    const newParticipants = [...participantUsernames];
    newParticipants[index] = value;
    setParticipantUsernames(newParticipants);

    // Clear specific participant error when user changes input
    const newParticipantErrors = [...errors.participants];
    if (newParticipantErrors[index]) {
      newParticipantErrors[index].username = "";
    }
    setErrors({ ...errors, participants: newParticipantErrors });
  };

  const handleAmountChange = (index, value) => {
    const newAmounts = [...participantAmounts];
    newAmounts[index] = value;
    setParticipantAmounts(newAmounts);

    // Clear specific participant error when user changes input
    const newParticipantErrors = [...errors.participants];
    if (newParticipantErrors[index]) {
      newParticipantErrors[index].amount = "";
    }
    setErrors({ ...errors, participants: newParticipantErrors });
  };

  const handlePercentageChange = (index, value) => {
    const newPercentages = [...participantPercentages];
    newPercentages[index] = value;
    setParticipantPercentages(newPercentages);

    // Clear specific participant error when user changes input
    const newParticipantErrors = [...errors.participants];
    if (newParticipantErrors[index]) {
      newParticipantErrors[index].percentage = "";
    }
    setErrors({ ...errors, participants: newParticipantErrors });
  };

  const addParticipant = () => {
    setParticipantUsernames([...participantUsernames, ""]);
    setParticipantAmounts([...participantAmounts, ""]);
    setParticipantPercentages([...participantPercentages, ""]);
    setErrors({
      ...errors,
      participants: [...errors.participants, {}],
    });
  };

  const removeParticipant = (index) => {
    const newParticipants = [...participantUsernames];
    newParticipants.splice(index, 1);
    setParticipantUsernames(newParticipants);

    const newAmounts = [...participantAmounts];
    newAmounts.splice(index, 1);
    setParticipantAmounts(newAmounts);

    const newPercentages = [...participantPercentages];
    newPercentages.splice(index, 1);
    setParticipantPercentages(newPercentages);

    const newParticipantErrors = [...errors.participants];
    newParticipantErrors.splice(index, 1);
    setErrors({ ...errors, participants: newParticipantErrors });
  };

  const validateForm = () => {
    const newErrors = { form: {}, participants: [] };
    let isValid = true;

    // Validate form fields
    if (!formData.name.trim()) {
      newErrors.form.name = "Expense name is required.";
      isValid = false;
    }

    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      newErrors.form.total_amount = "Total amount must be greater than zero.";
      isValid = false;
    }

    // Validate participants
    participantUsernames.forEach((username, index) => {
      newErrors.participants[index] = {};

      if (!username.trim()) {
        newErrors.participants[index].username = "Username is required.";
        isValid = false;
      }

      if (formData.split_type === "EXACT") {
        const amount = participantAmounts[index];
        if (!amount || parseFloat(amount) <= 0) {
          newErrors.participants[index].amount =
            "Amount must be greater than zero.";
          isValid = false;
        }
      }

      if (formData.split_type === "PERCENTAGE") {
        const percentage = participantPercentages[index];
        if (
          percentage === "" ||
          isNaN(percentage) ||
          parseFloat(percentage) < 0 ||
          parseFloat(percentage) > 100
        ) {
          newErrors.participants[index].percentage =
            "Percentage must be between 0 and 100.";
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ form: {}, participants: [] });
    setSuccess("");

    // Client-side validation
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      const userIds = [];
      const participantErrors = [...errors.participants];

      // Fetch user IDs for each participant
      await Promise.all(
        participantUsernames.map(async (username, index) => {
          try {
            const response = await api.get("/users/by-username/", {
              params: { username },
            });
            if (response.data && response.data.id) {
              userIds[index] = response.data.id;
            } else {
              participantErrors[index] = {
                ...participantErrors[index],
                username: `User "${username}" not found.`,
              };
            }
          } catch (err) {
            participantErrors[index] = {
              ...participantErrors[index],
              username: `Error fetching user "${username}".`,
            };
          }
        })
      );

      // Check if there are any participant errors
      const hasParticipantErrors = participantErrors.some(
        (error) => error.username || error.amount || error.percentage
      );

      if (hasParticipantErrors) {
        setErrors({ ...errors, participants: participantErrors });
        toast.error("Please fix the errors related to participants.");
        return;
      }

      let participantsData = [];
      if (formData.split_type === "EXACT") {
        participantsData = userIds.map((uid, index) => ({
          user_id: uid,
          amount_owed: parseFloat(participantAmounts[index] || 0),
        }));
      } else if (formData.split_type === "PERCENTAGE") {
        participantsData = userIds.map((uid, index) => ({
          user_id: uid,
          percentage_owed: parseFloat(participantPercentages[index] || 0),
        }));
      } else {
        participantsData = userIds.map((uid) => ({
          user_id: uid,
        }));
      }

      const payload = {
        name: formData.name,
        created_by: user.userId,
        total_amount: parseFloat(formData.total_amount),
        split_type: formData.split_type,
        participants: participantsData,
      };

      const response = await api.post("/expenses/add/", payload);

      if (response.status === 201) {
        setSuccess("Expense added successfully.");
        toast.success("Expense added successfully.");

        // Reset form
        setFormData({ name: "", total_amount: "", split_type: "EQUAL" });
        setParticipantUsernames([""]);
        setParticipantAmounts([]);
        setParticipantPercentages([]);
        setErrors({ form: {}, participants: [] });

        onExpenseAdded(); // Trigger refresh of expense list
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.non_field_errors?.[0] ||
        error.message ||
        "Failed to add expense.";
      setErrors({ ...errors, form: { api: errorMessage } });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 lg:p-10 rounded-lg shadow-lg max-w-3xl mx-auto my-6">
      <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6 text-center">
        Add Expense
      </h2>

      {success && (
        <div className="text-green-600 bg-green-100 p-3 rounded mb-4">
          {success}
        </div>
      )}
      {errors.form.api && (
        <div className="text-red-600 bg-red-100 p-3 rounded mb-4">
          {errors.form.api}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Expense Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Expense Name
          </label>
          <input
            type="text"
            name="name"
            className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 ${
              errors.form.name ? "border-red-500" : ""
            }`}
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter expense name"
          />
          {errors.form.name && (
            <p className="text-red-500 text-sm mt-1">{errors.form.name}</p>
          )}
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Total Amount
          </label>
          <input
            type="number"
            name="total_amount"
            className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 ${
              errors.form.total_amount ? "border-red-500" : ""
            }`}
            value={formData.total_amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="Enter total amount"
          />
          {errors.form.total_amount && (
            <p className="text-red-500 text-sm mt-1">
              {errors.form.total_amount}
            </p>
          )}
        </div>

        {/* Split Type */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Split Type
          </label>
          <select
            name="split_type"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            value={formData.split_type}
            onChange={handleChange}
          >
            <option value="EQUAL">Equal</option>
            <option value="EXACT">Exact</option>
            <option value="PERCENTAGE">Percentage</option>
          </select>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Participants
          </label>
          {participantUsernames.map((username, index) => (
            <div key={index} className="mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                {/* Username Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 ${
                      errors.participants[index]?.username
                        ? "border-red-500"
                        : ""
                    }`}
                    value={username}
                    onChange={(e) =>
                      handleParticipantChange(index, e.target.value)
                    }
                    placeholder="Username"
                    required
                  />
                  {errors.participants[index]?.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.participants[index].username}
                    </p>
                  )}
                </div>

                {/* Amount or Percentage Input */}
                {formData.split_type === "EXACT" && (
                  <div className="flex-1 mt-2 md:mt-0">
                    <input
                      type="number"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 ${
                        errors.participants[index]?.amount
                          ? "border-red-500"
                          : ""
                      }`}
                      value={participantAmounts[index]}
                      onChange={(e) =>
                        handleAmountChange(index, e.target.value)
                      }
                      placeholder="Amount"
                      required
                      min="0"
                      step="0.01"
                    />
                    {errors.participants[index]?.amount && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.participants[index].amount}
                      </p>
                    )}
                  </div>
                )}
                {formData.split_type === "PERCENTAGE" && (
                  <div className="flex-1 mt-2 md:mt-0">
                    <input
                      type="number"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 ${
                        errors.participants[index]?.percentage
                          ? "border-red-500"
                          : ""
                      }`}
                      value={participantPercentages[index]}
                      onChange={(e) =>
                        handlePercentageChange(index, e.target.value)
                      }
                      placeholder="%"
                      required
                      min="0"
                      max="100"
                    />
                    {errors.participants[index]?.percentage && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.participants[index].percentage}
                      </p>
                    )}
                  </div>
                )}

                {/* Remove Participant Button */}
                <div className="mt-2 md:mt-0">
                  <button
                    type="button"
                    className="text-red-500 text-2xl"
                    onClick={() => removeParticipant(index)}
                    aria-label={`Remove participant ${index + 1}`}
                  >
                    <TiDelete />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Participant Button */}
          <button
            type="button"
            className="text-blue-500 mt-2 flex items-center"
            onClick={addParticipant}
          >
            + Add Participant
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
