const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();

const PORT = 5000;

const dataDirectory = path.join(__dirname, "data");

const travelRequestsFile = path.join(
  dataDirectory,
  "travelRequests.json"
);

const expensesFile = path.join(
  dataDirectory,
  "expenses.json"
);

// Middleware
app.use(cors());
app.use(express.json());

/* =========================================================
   TRAVEL REQUEST FUNCTIONS
   ========================================================= */

// Read travel requests
async function readRequests() {
  try {
    const data = await fs.readFile(
      travelRequestsFile,
      "utf-8"
    );

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(dataDirectory, {
        recursive: true,
      });

      await fs.writeFile(
        travelRequestsFile,
        "[]"
      );

      return [];
    }

    throw error;
  }
}

// Save travel requests
async function saveRequests(requests) {
  await fs.mkdir(dataDirectory, {
    recursive: true,
  });

  await fs.writeFile(
    travelRequestsFile,
    JSON.stringify(requests, null, 2)
  );
}

/* =========================================================
   EXPENSE FUNCTIONS
   ========================================================= */

// Read expenses
async function readExpenses() {
  try {
    const data = await fs.readFile(
      expensesFile,
      "utf-8"
    );

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(dataDirectory, {
        recursive: true,
      });

      await fs.writeFile(
        expensesFile,
        "[]"
      );

      return [];
    }

    throw error;
  }
}

// Save expenses
async function saveExpenses(expenses) {
  await fs.mkdir(dataDirectory, {
    recursive: true,
  });

  await fs.writeFile(
    expensesFile,
    JSON.stringify(expenses, null, 2)
  );
}

/* =========================================================
   HOME
   ========================================================= */

app.get("/", (req, res) => {
  res.send("TravelOps Backend is Running!");
});

/* =========================================================
   TRAVEL REQUEST API
   ========================================================= */

// GET all travel requests
app.get(
  "/api/travel-requests",
  async (req, res) => {
    try {
      const requests = await readRequests();

      res.status(200).json(requests);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Unable to fetch travel requests",
      });
    }
  }
);

// POST a new travel request
app.post(
  "/api/travel-requests",
  async (req, res) => {
    try {
      const {
        employeeName,
        destination,
        purpose,
        departureDate,
        returnDate,
        budget,
      } = req.body;

      if (
        !employeeName ||
        !destination ||
        !purpose ||
        !departureDate ||
        !returnDate ||
        !budget
      ) {
        return res.status(400).json({
          message:
            "Please fill in all fields",
        });
      }

      if (
        new Date(departureDate) >
        new Date(returnDate)
      ) {
        return res.status(400).json({
          message:
            "Return date must be after departure date",
        });
      }

      if (Number(budget) <= 0) {
        return res.status(400).json({
          message:
            "Budget must be greater than zero",
        });
      }

      const requests =
        await readRequests();

      const newRequest = {
        id: randomUUID(),
        employeeName,
        destination,
        purpose,
        departureDate,
        returnDate,
        budget: Number(budget),
        status: "Pending",
        createdAt:
          new Date().toISOString(),
      };

      requests.push(newRequest);

      await saveRequests(requests);

      res.status(201).json({
        message:
          "Travel request submitted successfully",
        request: newRequest,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Unable to submit travel request",
      });
    }
  }
);

// UPDATE request status
app.put(
  "/api/travel-requests/:id/status",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Approved",
        "Rejected",
        "Pending",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      const requests =
        await readRequests();

      const requestIndex =
        requests.findIndex(
          (request) =>
            request.id === id
        );

      if (requestIndex === -1) {
        return res.status(404).json({
          message:
            "Travel request not found",
        });
      }

      requests[requestIndex].status =
        status;

      await saveRequests(requests);

      res.status(200).json({
        message: `Request ${status.toLowerCase()} successfully`,
        request:
          requests[requestIndex],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Unable to update request status",
      });
    }
  }
);

/* =========================================================
   EXPENSE MANAGEMENT API
   ========================================================= */

// GET all expenses
app.get(
  "/api/expenses",
  async (req, res) => {
    try {
      const expenses =
        await readExpenses();

      res.status(200).json(expenses);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Unable to fetch expenses",
      });
    }
  }
);

// POST a new expense
app.post(
  "/api/expenses",
  async (req, res) => {
    try {
      const {
        travelRequestId,
        employeeName,
        destination,
        category,
        amount,
        expenseDate,
        description,
      } = req.body;

      // Validate required fields
      if (
        !travelRequestId ||
        !employeeName ||
        !destination ||
        !category ||
        !amount ||
        !expenseDate ||
        !description
      ) {
        return res.status(400).json({
          message:
            "Please fill in all expense fields",
        });
      }

      // Validate amount
      if (Number(amount) <= 0) {
        return res.status(400).json({
          message:
            "Expense amount must be greater than zero",
        });
      }

      // Check whether travel request exists
      const requests =
        await readRequests();

      const travelRequest =
        requests.find(
          (request) =>
            request.id ===
            travelRequestId
        );

      if (!travelRequest) {
        return res.status(404).json({
          message:
            "Travel request not found",
        });
      }

      // Expense can only be submitted for approved trips
      if (
        travelRequest.status !==
        "Approved"
      ) {
        return res.status(400).json({
          message:
            "Expenses can only be added for approved travel requests",
        });
      }

      // Allowed expense categories
      const allowedCategories = [
        "Flight",
        "Hotel",
        "Food",
        "Transport",
        "Other",
      ];

      if (
        !allowedCategories.includes(
          category
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid expense category",
        });
      }

      const expenses =
        await readExpenses();

      const newExpense = {
        id: randomUUID(),

        travelRequestId,

        employeeName,

        destination,

        category,

        amount: Number(amount),

        expenseDate,

        description,

        status: "Pending",

        createdAt:
          new Date().toISOString(),
      };

      expenses.push(newExpense);

      await saveExpenses(expenses);

      res.status(201).json({
        message:
          "Expense submitted successfully",
        expense: newExpense,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Unable to submit expense",
      });
    }
  }
);

// UPDATE expense status
app.put(
  "/api/expenses/:id/status",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Approved",
        "Rejected",
        "Pending",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid expense status",
        });
      }

      const expenses =
        await readExpenses();

      const expenseIndex =
        expenses.findIndex(
          (expense) =>
            expense.id === id
        );

      if (expenseIndex === -1) {
        return res.status(404).json({
          message:
            "Expense not found",
        });
      }

      expenses[expenseIndex].status =
        status;

      await saveExpenses(expenses);

      res.status(200).json({
        message: `Expense ${status.toLowerCase()} successfully`,
        expense:
          expenses[expenseIndex],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Unable to update expense status",
      });
    }
  }
);

/* =========================================================
   START SERVER
   ========================================================= */

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});