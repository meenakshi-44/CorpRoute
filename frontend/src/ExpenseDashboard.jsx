import { useEffect, useState } from "react";

function ExpenseDashboard() {
  const [requests, setRequests] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    travelRequestId: "",
    category: "",
    amount: "",
    expenseDate: "",
    description: "",
  });

  // Fetch travel requests and expenses
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [requestsResponse, expensesResponse] =
        await Promise.all([
          fetch(
            "http://localhost:5000/api/travel-requests"
          ),
          fetch(
            "http://localhost:5000/api/expenses"
          ),
        ]);

      if (
        !requestsResponse.ok ||
        !expensesResponse.ok
      ) {
        throw new Error(
          "Unable to fetch expense information"
        );
      }

      const requestsData =
        await requestsResponse.json();

      const expensesData =
        await expensesResponse.json();

      setRequests(requestsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Fetch error:", error);

      setError(
        "Unable to connect to the backend. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Only approved travel requests
  const approvedRequests = requests.filter(
    (request) => request.status === "Approved"
  );

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Submit expense
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    const selectedRequest =
      approvedRequests.find(
        (request) =>
          request.id ===
          formData.travelRequestId
      );

    if (!selectedRequest) {
      setError(
        "Please select an approved travel request."
      );

      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            travelRequestId:
              selectedRequest.id,

            employeeName:
              selectedRequest.employeeName,

            destination:
              selectedRequest.destination,

            category:
              formData.category,

            amount:
              formData.amount,

            expenseDate:
              formData.expenseDate,

            description:
              formData.description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit expense"
        );
      }

      setMessage(
        "Expense submitted successfully!"
      );

      // Clear form
      setFormData({
        travelRequestId: "",
        category: "",
        amount: "",
        expenseDate: "",
        description: "",
      });

      // Refresh expense list
      await fetchData();
    } catch (error) {
      console.error(
        "Expense submission error:",
        error
      );

      setError(
        error.message ||
          "Unable to submit expense"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Status class
  const getStatusClass = (status) => {
    if (status === "Approved")
      return "status-approved";

    if (status === "Rejected")
      return "status-rejected";

    return "status-pending";
  };

  if (loading) {
    return (
      <div className="manager-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading expense information...
        </p>
      </div>
    );
  }

  return (
    <div className="expense-dashboard">

      {/* ================= HEADER ================= */}

      <div className="dashboard-header">
        <div>
          <h1>
            Expense Management 💰
          </h1>

          <p>
            Submit and track your business travel
            expenses.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchData}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ================= SUCCESS ================= */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* ================= NO APPROVED TRIPS ================= */}

      {approvedRequests.length === 0 ? (
        <div className="empty-state">

          <div className="empty-icon">
            ✈️
          </div>

          <h3>
            No Approved Trips
          </h3>

          <p>
            You can submit expenses only for
            approved travel requests.
          </p>

        </div>
      ) : (
        <>
          {/* ================= EXPENSE FORM ================= */}

          <div className="expense-form-card">

            <div className="expense-form-header">
              <div>
                <h2>
                  Add Travel Expense
                </h2>

                <p>
                  Submit an expense for an
                  approved business trip.
                </p>
              </div>

              <span className="expense-icon">
                💳
              </span>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Travel Request */}

              <div className="form-group">
                <label htmlFor="travelRequestId">
                  Approved Travel Request
                </label>

                <select
                  id="travelRequestId"
                  name="travelRequestId"
                  value={
                    formData.travelRequestId
                  }
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select an approved trip
                  </option>

                  {approvedRequests.map(
                    (request) => (
                      <option
                        key={request.id}
                        value={request.id}
                      >
                        {request.destination} —
                        {" "}
                        {request.employeeName}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Category */}

              <div className="form-group">
                <label htmlFor="category">
                  Expense Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Flight">
                    ✈️ Flight
                  </option>

                  <option value="Hotel">
                    🏨 Hotel
                  </option>

                  <option value="Food">
                    🍴 Food
                  </option>

                  <option value="Transport">
                    🚕 Transport
                  </option>

                  <option value="Other">
                    📦 Other
                  </option>
                </select>
              </div>

              {/* Amount */}

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="amount">
                    Amount (₹)
                  </label>

                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="Enter amount"
                    min="1"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Date */}

                <div className="form-group">
                  <label htmlFor="expenseDate">
                    Expense Date
                  </label>

                  <input
                    type="date"
                    id="expenseDate"
                    name="expenseDate"
                    value={
                      formData.expenseDate
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              {/* Description */}

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the expense..."
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Submit */}

              <button
                type="submit"
                className="primary-button expense-submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "💰 Submit Expense"}
              </button>

            </form>
          </div>
        </>
      )}

      {/* ================= EXPENSE HISTORY ================= */}

      <div className="expense-history">

        <div className="section-heading">
          <div>
            <h2>
              Expense History
            </h2>

            <p>
              Track submitted travel expenses
              and reimbursement status.
            </p>
          </div>

          <span className="request-count">
            {expenses.length} Expense
            {expenses.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="expense-empty">
            <span>💳</span>

            <p>
              No expenses submitted yet.
            </p>
          </div>
        ) : (
          <div className="expense-grid">

            {expenses.map((expense) => (
              <div
                className="expense-card"
                key={expense.id}
              >

                <div className="expense-card-header">

                  <div>
                    <span className="request-label">
                      {expense.category}
                    </span>

                    <h3>
                      {expense.destination}
                    </h3>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      expense.status
                    )}`}
                  >
                    {expense.status}
                  </span>

                </div>

                <div className="expense-details">

                  <div>
                    <small>
                      👤 Employee
                    </small>

                    <strong>
                      {expense.employeeName}
                    </strong>
                  </div>

                  <div>
                    <small>
                      💰 Amount
                    </small>

                    <strong className="expense-amount">
                      ₹
                      {Number(
                        expense.amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <small>
                      📅 Expense Date
                    </small>

                    <strong>
                      {expense.expenseDate}
                    </strong>
                  </div>

                  <div>
                    <small>
                      📝 Description
                    </small>

                    <strong>
                      {expense.description}
                    </strong>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default ExpenseDashboard;