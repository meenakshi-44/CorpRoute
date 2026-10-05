import { useState } from "react";
import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashboard";
import ExpenseDashboard from "./ExpenseDashboard";
import ManagerExpenseDashboard from "./ManagerExpenseDashboard";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("home");

  const [formData, setFormData] = useState({
    employeeName: "",
    destination: "",
    purpose: "",
    departureDate: "",
    returnDate: "",
    budget: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ================= NAVIGATION =================

  const navigateTo = (page) => {
    setActivePage(page);
    setMessage("");
    setError("");
    window.scrollTo(0, 0);
  };

  // ================= NEW REQUEST =================

  const createNewRequest = () => {
    setFormData({
      employeeName: "",
      destination: "",
      purpose: "",
      departureDate: "",
      returnDate: "",
      budget: "",
    });

    setMessage("");
    setError("");

    setActivePage("employee");

    window.scrollTo(0, 0);
  };

  // ================= FORM CHANGE =================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SUBMIT TRAVEL REQUEST =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/travel-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Something went wrong."
        );
        return;
      }

      setMessage(
        `Travel request created successfully! Request ID: ${data.id}`
      );

      setFormData({
        employeeName: "",
        destination: "",
        purpose: "",
        departureDate: "",
        returnDate: "",
        budget: "",
      });
    } catch (err) {
      setError(
        "Unable to connect to the server. Make sure the backend is running."
      );
    }
  };

  return (
    <div className="app-container">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            ✈
          </div>

          <h2>CorpRoute</h2>
        </div>

        {/* HOME */}
        <button
          className={
            activePage === "home"
              ? "active"
              : ""
          }
          onClick={() => navigateTo("home")}
        >
          🏠 Home
        </button>

        {/* EMPLOYEE FORM */}
        <button
          className={
            activePage === "employee"
              ? "active"
              : ""
          }
          onClick={() => navigateTo("employee")}
        >
          ✈️ Employee Form
        </button>

        {/* MY TRAVEL REQUESTS */}
        <button
          className={
            activePage === "employeeDashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            navigateTo("employeeDashboard")
          }
        >
          📋 My Travel Requests
        </button>

        {/* EXPENSES */}
        <button
          className={
            activePage === "expenses"
              ? "active"
              : ""
          }
          onClick={() =>
            navigateTo("expenses")
          }
        >
          💰 Expenses
        </button>

        {/* EXPENSE APPROVALS */}
        <button
          className={
            activePage === "managerExpenses"
              ? "active"
              : ""
          }
          onClick={() =>
            navigateTo("managerExpenses")
          }
        >
          💳 Expense Approvals
        </button>

        {/* MANAGER DASHBOARD */}
        <button
          className={
            activePage === "manager"
              ? "active"
              : ""
          }
          onClick={() =>
            navigateTo("manager")
          }
        >
          📊 Manager Dashboard
        </button>

        {/* NEW REQUEST */}
        <button onClick={createNewRequest}>
          📝 New Request
        </button>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="main-content">

        {/* =================================================
            HOME PAGE
        ================================================= */}

        {activePage === "home" && (
          <div className="simple-home">

            <div className="welcome-section">

              <h1>
                Welcome to <span>CorpRoute</span>
              </h1>

              <p>
                Your simple and efficient corporate
                travel management system.
              </p>

              <p className="home-description">
                Create travel requests, track approvals,
                and manage your business expenses in
                one place.
              </p>

              <div className="home-buttons">

                <button
                  className="primary-btn"
                  onClick={createNewRequest}
                >
                  📝 Create Travel Request
                </button>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    navigateTo(
                      "employeeDashboard"
                    )
                  }
                >
                  📋 My Travel Requests
                </button>

              </div>

            </div>

            {/* SIMPLE FEATURES */}

            <div className="simple-features">

              <div className="simple-feature">

                <h3>
                  ✈️ Travel Requests
                </h3>

                <p>
                  Create and submit your business
                  travel requests easily.
                </p>

              </div>

              <div className="simple-feature">

                <h3>
                  📋 Track Requests
                </h3>

                <p>
                  Check the status of your travel
                  requests anytime.
                </p>

              </div>

              <div className="simple-feature">

                <h3>
                  💰 Manage Expenses
                </h3>

                <p>
                  Submit and manage expenses related
                  to approved trips.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            EMPLOYEE TRAVEL REQUEST FORM
        ================================================= */}

        {activePage === "employee" && (
          <div className="page-container">

            <div className="page-header">

              <div>

                <span className="page-label">
                  EMPLOYEE
                </span>

                <h1>
                  Create Travel Request
                </h1>

                <p>
                  Submit your business travel details
                  for manager approval.
                </p>

              </div>

            </div>

            <div className="form-card">

              <form onSubmit={handleSubmit}>

                <div className="form-grid">

                  {/* Employee Name */}

                  <div className="form-group">

                    <label>
                      Employee Name
                    </label>

                    <input
                      type="text"
                      name="employeeName"
                      value={
                        formData.employeeName
                      }
                      onChange={handleChange}
                      placeholder="Enter employee name"
                      required
                    />

                  </div>

                  {/* Destination */}

                  <div className="form-group">

                    <label>
                      Destination
                    </label>

                    <input
                      type="text"
                      name="destination"
                      value={
                        formData.destination
                      }
                      onChange={handleChange}
                      placeholder="e.g. Delhi"
                      required
                    />

                  </div>

                  {/* Purpose */}

                  <div className="form-group full-width">

                    <label>
                      Purpose of Travel
                    </label>

                    <textarea
                      name="purpose"
                      value={
                        formData.purpose
                      }
                      onChange={handleChange}
                      placeholder="Enter the purpose of your business trip"
                      rows="4"
                      required
                    />

                  </div>

                  {/* Departure Date */}

                  <div className="form-group">

                    <label>
                      Departure Date
                    </label>

                    <input
                      type="date"
                      name="departureDate"
                      value={
                        formData.departureDate
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* Return Date */}

                  <div className="form-group">

                    <label>
                      Return Date
                    </label>

                    <input
                      type="date"
                      name="returnDate"
                      value={
                        formData.returnDate
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* Budget */}

                  <div className="form-group">

                    <label>
                      Estimated Budget (₹)
                    </label>

                    <input
                      type="number"
                      name="budget"
                      value={
                        formData.budget
                      }
                      onChange={handleChange}
                      placeholder="Enter estimated budget"
                      min="1"
                      required
                    />

                  </div>

                </div>

                {/* SUCCESS MESSAGE */}

                {message && (
                  <div className="success-message">
                    ✅ {message}
                  </div>
                )}

                {/* ERROR MESSAGE */}

                {error && (
                  <div className="error-message">
                    ❌ {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                >
                  Submit Travel Request
                </button>

              </form>

            </div>

          </div>
        )}

        {/* =================================================
            MY TRAVEL REQUESTS
        ================================================= */}

        {activePage === "employeeDashboard" && (
          <EmployeeDashboard />
        )}

        {/* =================================================
            EMPLOYEE EXPENSES
        ================================================= */}

        {activePage === "expenses" && (
          <ExpenseDashboard />
        )}

        {/* =================================================
            EXPENSE APPROVALS
        ================================================= */}

        {activePage === "managerExpenses" && (
          <ManagerExpenseDashboard />
        )}

        {/* =================================================
            MANAGER DASHBOARD
        ================================================= */}

        {activePage === "manager" && (
          <ManagerDashboard />
        )}

      </main>

    </div>
  );
}

export default App;