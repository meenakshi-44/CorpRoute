import { useEffect, useState } from "react";

function EmployeeDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/travel-requests"
      );

      if (!response.ok) {
        throw new Error("Unable to fetch travel requests");
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error("Fetch error:", err);

      setError(
        "Unable to connect to the backend. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Count request statuses
  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedRequests = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedRequests = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  // Status styling
  const getStatusClass = (status) => {
    if (status === "Approved") return "status-approved";
    if (status === "Rejected") return "status-rejected";
    return "status-pending";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Not specified";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return date;
    }

    return formattedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="employee-dashboard">

      {/* ================= HEADER ================= */}

      <div className="dashboard-header">
        <div>
          <h1>My Travel Requests ✈️</h1>

          <p>
            Track your corporate travel requests and approval status.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchRequests}
          disabled={loading}
        >
          🔄 {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ================= STATISTICS ================= */}

      {!loading && !error && (
        <div className="stats-grid">

          {/* Total */}
          <div className="stat-card">
            <div className="stat-icon">📋</div>

            <div>
              <p>Total Requests</p>
              <h2>{totalRequests}</h2>
            </div>
          </div>

          {/* Pending */}
          <div className="stat-card">
            <div className="stat-icon pending-icon">⏳</div>

            <div>
              <p>Pending</p>
              <h2>{pendingRequests}</h2>
            </div>
          </div>

          {/* Approved */}
          <div className="stat-card">
            <div className="stat-icon approved-icon">✅</div>

            <div>
              <p>Approved</p>
              <h2>{approvedRequests}</h2>
            </div>
          </div>

          {/* Rejected */}
          <div className="stat-card">
            <div className="stat-icon rejected-icon">❌</div>

            <div>
              <p>Rejected</p>
              <h2>{rejectedRequests}</h2>
            </div>
          </div>

        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="dashboard-message">
          <div className="loading-spinner"></div>
          <p>Loading your travel requests...</p>
        </div>
      )}

      {/* ================= ERROR ================= */}

      {error && (
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>

          <h3>Unable to load requests</h3>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={fetchRequests}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}

      {!loading && !error && requests.length === 0 && (
        <div className="empty-state">

          <div className="empty-icon">✈️</div>

          <h3>No Travel Requests Yet</h3>

          <p>
            You haven't submitted any travel requests.
            Create a new request to get started.
          </p>

        </div>
      )}

      {/* ================= REQUESTS ================= */}

      {!loading && !error && requests.length > 0 && (
        <div className="requests-section">

          <div className="section-heading">
            <div>
              <h2>Travel Request History</h2>

              <p>
                View your submitted travel requests and their
                current status.
              </p>
            </div>

            <span className="request-count">
              {totalRequests} Request
              {totalRequests !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="request-grid">

            {requests.map((request) => (
              <div
                className="request-card"
                key={request.id}
              >

                {/* Card Header */}
                <div className="request-card-header">

                  <div>
                    <span className="request-label">
                      Travel Request
                    </span>

                    <h3>{request.destination}</h3>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      request.status
                    )}`}
                  >
                    {request.status === "Approved" && "✓ "}
                    {request.status === "Rejected" && "✕ "}
                    {request.status === "Pending" && "● "}
                    {request.status}
                  </span>

                </div>

                {/* Request ID */}
                <div className="request-id">
                  Request ID:{" "}
                  <strong>
                    {request.id}
                  </strong>
                </div>

                {/* Request Details */}
                <div className="request-details">

                  <div className="detail-item">
                    <span className="detail-icon">👤</span>

                    <div>
                      <small>Employee</small>
                      <strong>
                        {request.employeeName}
                      </strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">🎯</span>

                    <div>
                      <small>Purpose</small>
                      <strong>
                        {request.purpose}
                      </strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">📅</span>

                    <div>
                      <small>Departure</small>
                      <strong>
                        {formatDate(request.departureDate)}
                      </strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">🏠</span>

                    <div>
                      <small>Return</small>
                      <strong>
                        {formatDate(request.returnDate)}
                      </strong>
                    </div>
                  </div>

                  <div className="detail-item budget-item">
                    <span className="detail-icon">💰</span>

                    <div>
                      <small>Estimated Budget</small>

                      <strong>
                        ₹
                        {Number(
                          request.budget
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                </div>

              </div>
            ))}

          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeeDashboard;