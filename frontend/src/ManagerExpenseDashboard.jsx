import { useEffect, useState } from "react";

function ManagerExpenseDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Get all expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/expenses"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();

      setExpenses(data);
    } catch (err) {
      setError(
        "Unable to load expenses. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load expenses when page opens
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Approve or reject expense
  const updateExpenseStatus = async (id, status) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/expenses/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to update expense."
        );
        return;
      }

      setMessage(
        `Expense ${status.toLowerCase()} successfully.`
      );

      fetchExpenses();
    } catch (err) {
      setError("Unable to update expense status.");
    }
  };

  // Search + filter
  const filteredExpenses = expenses.filter((expense) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      expense.employeeName
        .toLowerCase()
        .includes(searchText) ||
      expense.destination
        .toLowerCase()
        .includes(searchText) ||
      expense.category
        .toLowerCase()
        .includes(searchText) ||
      expense.travelRequestId
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      expense.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalAmount = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  const pendingExpenses = expenses.filter(
    (expense) => expense.status === "Pending"
  );

  const approvedExpenses = expenses.filter(
    (expense) => expense.status === "Approved"
  );

  const rejectedExpenses = expenses.filter(
    (expense) => expense.status === "Rejected"
  );

  const pendingAmount = pendingExpenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  const approvedAmount = approvedExpenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  const rejectedAmount = rejectedExpenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  return (
    <div className="manager-expense-page">

      {/* HEADER */}
      <div className="page-header">

        <div>
          <span className="page-label">
            MANAGER
          </span>

          <h1>Expense Approval</h1>

          <p>
            Review employee expenses and approve or
            reject reimbursement requests.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchExpenses}
        >
          🔄 Refresh
        </button>

      </div>

      {/* STATISTICS */}
      <div className="expense-stats">

        <div className="expense-stat-card">
          <div className="stat-icon">💰</div>

          <div>
            <span>Total Expenses</span>
            <h2>
              ₹{totalAmount.toLocaleString()}
            </h2>
            <small>
              {expenses.length} requests
            </small>
          </div>
        </div>

        <div className="expense-stat-card">
          <div className="stat-icon">⏳</div>

          <div>
            <span>Pending</span>
            <h2>
              ₹{pendingAmount.toLocaleString()}
            </h2>
            <small>
              {pendingExpenses.length} requests
            </small>
          </div>
        </div>

        <div className="expense-stat-card">
          <div className="stat-icon">✅</div>

          <div>
            <span>Approved</span>
            <h2>
              ₹{approvedAmount.toLocaleString()}
            </h2>
            <small>
              {approvedExpenses.length} requests
            </small>
          </div>
        </div>

        <div className="expense-stat-card">
          <div className="stat-icon">❌</div>

          <div>
            <span>Rejected</span>
            <h2>
              ₹{rejectedAmount.toLocaleString()}
            </h2>
            <small>
              {rejectedExpenses.length} requests
            </small>
          </div>
        </div>

      </div>

      {/* MESSAGES */}
      {message && (
        <div className="success-message">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* SEARCH AND FILTER */}
      <div className="expense-filters">

        <input
          type="text"
          placeholder="🔍 Search employee, destination, category..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

      </div>

      {/* EXPENSE LIST */}
      {loading ? (
        <div className="empty-state">
          <h2>Loading expenses...</h2>
          <p>Please wait.</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="empty-state">

          <div className="empty-icon">
            💰
          </div>

          <h2>No expenses found</h2>

          <p>
            There are no expenses matching your
            current filters.
          </p>

        </div>
      ) : (
        <div className="manager-expense-list">

          {filteredExpenses.map((expense) => (

            <div
              className="manager-expense-card"
              key={expense.id}
            >

              {/* EXPENSE HEADER */}
              <div className="expense-card-top">

                <div>
                  <span className="expense-category">
                    {expense.category}
                  </span>

                  <h2>
                    ₹
                    {Number(
                      expense.amount
                    ).toLocaleString()}
                  </h2>
                </div>

                <span
                  className={`expense-status ${expense.status.toLowerCase()}`}
                >
                  {expense.status}
                </span>

              </div>

              {/* DETAILS */}
              <div className="expense-details">

                <div>
                  <span>Employee</span>

                  <strong>
                    {expense.employeeName}
                  </strong>
                </div>

                <div>
                  <span>Destination</span>

                  <strong>
                    {expense.destination}
                  </strong>
                </div>

                <div>
                  <span>Expense Date</span>

                  <strong>
                    {new Date(
                      expense.expenseDate
                    ).toLocaleDateString()}
                  </strong>
                </div>

                <div>
                  <span>Travel Request</span>

                  <strong>
                    #
                    {expense.travelRequestId.slice(
                      0,
                      8
                    )}
                  </strong>
                </div>

              </div>

              {/* DESCRIPTION */}
              {expense.description && (
                <div className="expense-description">

                  <span>Description</span>

                  <p>
                    {expense.description}
                  </p>

                </div>
              )}

              {/* APPROVE / REJECT */}
              {expense.status === "Pending" && (
                <div className="expense-actions">

                  <button
                    className="approve-btn"
                    onClick={() =>
                      updateExpenseStatus(
                        expense.id,
                        "Approved"
                      )
                    }
                  >
                    ✅ Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() =>
                      updateExpenseStatus(
                        expense.id,
                        "Rejected"
                      )
                    }
                  >
                    ❌ Reject
                  </button>

                </div>
              )}

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default ManagerExpenseDashboard;