const companies = [
  { id: "C01", name: "Nova Capital", revenue: 120, interest: 6.5 },
  { id: "C02", name: "Blue Orbit", revenue: 95, interest: 5.8 },
  { id: "C03", name: "Vertex Edge", revenue: 140, interest: 7.2 },
  { id: "C04", name: "Summit Peak", revenue: 110, interest: 6.0 },
];

const investmentHistory = [
  { company: "Nova Capital", amount: 45, interest: 6.4, success: 88 },
  { company: "Blue Orbit", amount: 38, interest: 5.9, success: 80 },
  { company: "Vertex Edge", amount: 52, interest: 7.0, success: 20 },
  { company: "Summit Peak", amount: 47, interest: 6.1, success: 85 },
];

const users = {
  admin: { password: "admin123", role: "admin", name: "Admin" },
  user: { password: "user123", role: "user", name: "Investor" },
};

// PRIMARY DATASET: All registered investors are stored here
// This is the source of truth for investor login credentials
const investorDataset = [
  {
    name: "Investor",
    username: "user",
    password: "user123",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

let activeUser = null;

const selectors = {
  accessCard: document.getElementById("access-card"),
  loginCard: document.getElementById("login-card"),
  registerCard: document.getElementById("register-card"),
  dashboard: document.getElementById("dashboard"),
  loginForm: document.getElementById("login-form"),
  welcomeTitle: document.getElementById("welcome-title"),
  welcomeSubtitle: document.getElementById("welcome-subtitle"),
  logoutBtn: document.getElementById("logout-btn"),
  companiesTableBody: document.querySelector("#companies-table tbody"),
  historyTableBody: document.querySelector("#history-table tbody"),
  companyForm: document.getElementById("company-edit-form"),
  companySelect: document.getElementById("company-select"),
  revenueInput: document.getElementById("revenue-input"),
  interestInput: document.getElementById("interest-input"),
  suggestBtn: document.getElementById("suggest-btn"),
  suggestionResult: document.getElementById("suggestion-result"),
  suggestedCompany: document.getElementById("suggested-company"),
  suggestionReason: document.getElementById("suggestion-reason"),
  ackBtn: document.getElementById("ack-btn"),
  ackMessage: document.getElementById("ack-message"),
  investAmount: document.getElementById("invest-amount"),
  investBtn: document.getElementById("invest-btn"),
  investMessage: document.getElementById("invest-message"),
  aiCard: document.getElementById("ai-card"),
  agentCard: document.getElementById("agent-card"),
  runAgentBtn: document.getElementById("run-agent-btn"),
  agentSteps: document.getElementById("agent-steps"),
  agentStatus: document.getElementById("agent-status"),
  agentLog: document.getElementById("agent-log"),
  agentLogList: document.getElementById("agent-log-list"),
  registerForm: document.getElementById("register-form"),
  registerName: document.getElementById("register-name"),
  registerPassword: document.getElementById("register-password"),
  registerFeedback: document.getElementById("register-feedback"),
  showLoginBtn: document.getElementById("show-login-btn"),
  showRegisterBtn: document.getElementById("show-register-btn"),
  investorsTableBody: document.querySelector("#investors-table tbody"),
  investorsCard: document.getElementById("investors-card"),
  usersDebugDisplay: document.getElementById("users-debug-display"),
  usersDebugCard: document.getElementById("users-debug-card"),
};

let lastSuggestion = null;

function renderCompanyTable() {
  selectors.companiesTableBody.innerHTML = "";
  companies.forEach((company) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${company.id}</td>
      <td>${company.name}</td>
      <td>${company.revenue.toFixed(1)}</td>
      <td>${company.interest.toFixed(1)}</td>
    `;
    selectors.companiesTableBody.appendChild(row);
  });
}

function renderHistoryTable() {
  selectors.historyTableBody.innerHTML = "";
  investmentHistory.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.company}</td>
      <td>${item.amount.toFixed(1)}</td>
      <td>${item.interest.toFixed(1)}</td>
      <td>${item.success}%</td>
    `;
    selectors.historyTableBody.appendChild(row);
  });
}

function renderInvestorsTable() {
  if (!selectors.investorsTableBody) return;
  selectors.investorsTableBody.innerHTML = "";
  if (!investorDataset.length) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="3">No investors have registered yet.</td>`;
    selectors.investorsTableBody.appendChild(emptyRow);
    return;
  }
  investorDataset.forEach((record) => {
    const row = document.createElement("tr");
    const formattedDate = record.createdAt
      ? new Date(record.createdAt).toLocaleString()
      : "—";
    row.innerHTML = `
      <td>${record.name}</td>
      <td>${record.username}</td>
      <td>${formattedDate}</td>
    `;
    selectors.investorsTableBody.appendChild(row);
  });
}

function renderUsersDebug() {
  if (!selectors.usersDebugDisplay) return;
  // Create a sanitized copy without passwords for display
  const sanitizedUsers = {};
  Object.keys(users).forEach((username) => {
    sanitizedUsers[username] = {
      role: users[username].role,
      name: users[username].name,
      password: "***hidden***",
    };
  });
  selectors.usersDebugDisplay.textContent = JSON.stringify(sanitizedUsers, null, 2);
}

function populateCompanySelect() {
  selectors.companySelect.innerHTML = "";
  companies.forEach((company, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = company.name;
    selectors.companySelect.appendChild(option);
  });
  setFormValues(0);
}

function setFormValues(index) {
  const company = companies[index];
  if (!company) return;
  selectors.revenueInput.value = company.revenue;
  selectors.interestInput.value = company.interest;
}

function scoreCompany(company) {
  const history = investmentHistory.find((item) => item.company === company.name);
  const success = history ? history.success : 75;
  const adjustedInterest = 10 - company.interest;

  return company.revenue * 0.5 + success * 0.4 + adjustedInterest * 5;
}

function getSuggestion() {
  let best = null;
  companies.forEach((company) => {
    const score = scoreCompany(company);
    if (!best || score > best.score) {
      best = { company, score };
    }
  });
  return best;
}

function revealSuggestion(suggestion) {
  if (!suggestion) return;
  lastSuggestion = suggestion.company;
  const history = investmentHistory.find(
    (item) => item.company === suggestion.company.name
  );

  selectors.suggestedCompany.textContent = suggestion.company.name;
  selectors.suggestionReason.textContent =
    `AI picked ${suggestion.company.name} because it combines ` +
    `a strong revenue base of ₹${suggestion.company.revenue.toFixed(1)}M with a ` +
    `competitive ${suggestion.company.interest.toFixed(1)}% rate and a ${
      history ? history.success : 80
    }% success record.`;
  selectors.suggestionResult.classList.remove("hidden");
  selectors.ackMessage.classList.add("hidden");
  selectors.investMessage.classList.add("hidden");
  selectors.investAmount.value = "";
}

class ProjectFlowAgent {
  constructor() {
    this.isRunning = false;
    this.stepIndex = 0;
    this.context = {};
    this.stepDefinitions = this.createSteps();
    this.renderStepList();
    this.reset(true, "Agent idle. Login to enable.", true);
  }

  createSteps() {
    return [
      {
        id: "session",
        label: "Validate session",
        run: () => {
          if (!activeUser) {
            throw new Error("No active session detected.");
          }
          return {
            message: `Active session confirmed for ${activeUser.name} (${activeUser.role}).`,
          };
        },
      },
      {
        id: "sync",
        label: "Sync live deal data",
        run: () => {
          renderCompanyTable();
          renderHistoryTable();
          const avgRate =
            companies.reduce((total, company) => total + company.interest, 0) /
            companies.length;
          return {
            message: `Refreshed ${companies.length} deals (avg rate ${avgRate.toFixed(
              1
            )}%).`,
          };
        },
      },
      {
        id: "history",
        label: "Scan investment history",
        run: (ctx) => {
          if (!investmentHistory.length) {
            return { message: "No history found. Proceeding with defaults." };
          }
          const totalSuccess = investmentHistory.reduce(
            (total, entry) => total + entry.success,
            0
          );
          const avgSuccess = totalSuccess / investmentHistory.length;
          const topHistory = investmentHistory.reduce((best, entry) =>
            entry.success > best.success ? entry : best
          );
          ctx.topHistory = topHistory;
          return {
            message: `Historical success averages ${avgSuccess.toFixed(
              1
            )}% with ${topHistory.company} leading at ${topHistory.success}%.`,
          };
        },
      },
      {
        id: "recommendation",
        label: "Draft AI recommendation",
        run: (ctx) => {
          const suggestion = getSuggestion();
          if (!suggestion) {
            throw new Error("No deals available for recommendation.");
          }
          revealSuggestion(suggestion);
          ctx.suggestion = suggestion;
          return {
            message: `Recommended ${suggestion.company.name} at ${suggestion.company.interest.toFixed(
              1
            )}% with ₹${suggestion.company.revenue.toFixed(1)}M revenue.`,
          };
        },
      },
      {
        id: "plan",
        label: "Prepare investment plan",
        run: (ctx) => {
          if (!ctx.suggestion) {
            throw new Error("Recommendation missing. Unable to plan.");
          }
          const amount = Math.max(
            50,
            Math.round(ctx.suggestion.company.revenue * 20)
          );
          ctx.planAmount = amount;
          selectors.investAmount.value = amount;
          selectors.ackMessage.textContent =
            "Agent acknowledged the recommendation.";
          selectors.ackMessage.classList.remove("hidden");
          selectors.investMessage.textContent = `Agent plan: allocate ₹${amount.toFixed(
            0
          )}K to ${ctx.suggestion.company.name}.`;
          selectors.investMessage.classList.remove("hidden");
          return {
            message: `Drafted plan to allocate ₹${amount.toFixed(0)}K to ${
              ctx.suggestion.company.name
            }.`,
          };
        },
      },
      {
        id: "summary",
        label: "Summarize outcome",
        run: (ctx) => {
          const companyName = ctx.suggestion
            ? ctx.suggestion.company.name
            : "the recommended company";
          const amountLabel = ctx.planAmount
            ? `₹${ctx.planAmount.toFixed(0)}K`
            : "an open budget";
          return {
            message: `Flow complete. Ready to brief stakeholders on ${companyName} with ${amountLabel}.`,
          };
        },
      },
    ];
  }

  renderStepList() {
    if (!selectors.agentSteps) return;
    selectors.agentSteps.innerHTML = this.stepDefinitions
      .map((step) => `<li data-step="${step.id}">${step.label}</li>`)
      .join("");
  }

  reset(hideLog = false, message = "Agent idle. Ready to run.", disableBtn = false) {
    this.isRunning = false;
    this.stepIndex = 0;
    this.context = {};
    if (selectors.runAgentBtn) {
      selectors.runAgentBtn.disabled = disableBtn;
      selectors.runAgentBtn.textContent = "Run AI Agent";
    }
    this.stepDefinitions.forEach((step) => this.updateStepState(step.id, ""));
    if (selectors.agentStatus) {
      selectors.agentStatus.textContent = message;
    }
    if (hideLog && selectors.agentLog) {
      selectors.agentLog.classList.add("hidden");
      selectors.agentLogList.innerHTML = "";
    }
  }

  start() {
    if (this.isRunning) return;
    if (!activeUser) {
      alert("Log in first so the AI agent can access deals.");
      return;
    }
    this.isRunning = true;
    this.context = {};
    this.stepIndex = 0;
    this.stepDefinitions.forEach((step) => this.updateStepState(step.id, ""));

    selectors.agentLogList.innerHTML = "";
    selectors.agentLog.classList.remove("hidden");
    selectors.agentStatus.textContent = "Agent running project flow...";
    selectors.runAgentBtn.disabled = true;
    selectors.runAgentBtn.textContent = "Running...";
    this.runNextStep();
  }

  runNextStep() {
    if (!this.isRunning) return;
    if (this.stepIndex >= this.stepDefinitions.length) {
      this.finish();
      return;
    }
    const step = this.stepDefinitions[this.stepIndex];
    this.updateStepState(step.id, "active");
    selectors.agentStatus.textContent = `Running: ${step.label}`;
    setTimeout(() => {
      try {
        const result = step.run(this.context);
        if (result?.message) {
          this.log(step.label, result.message);
        }
        this.updateStepState(step.id, "done");
        this.stepIndex += 1;
        this.runNextStep();
      } catch (error) {
        this.fail(step.id, error.message || "Agent encountered an error.");
      }
    }, 500);
  }

  finish() {
    this.isRunning = false;
    selectors.agentStatus.textContent = "Project flow complete.";
    selectors.runAgentBtn.disabled = false;
    selectors.runAgentBtn.textContent = "Run Again";
  }

  fail(stepId, message) {
    this.isRunning = false;
    this.updateStepState(stepId, "error");
    selectors.agentStatus.textContent = `Agent stopped: ${message}`;
    selectors.runAgentBtn.disabled = false;
    selectors.runAgentBtn.textContent = "Try Again";
    this.log("Error", message);
  }

  log(step, message) {
    const item = document.createElement("li");
    const timestamp = new Date().toLocaleTimeString();
    item.innerHTML = `<span>${step} · ${timestamp}</span>${message}`;
    selectors.agentLogList.appendChild(item);
  }

  updateStepState(stepId, state) {
    const node = selectors.agentSteps?.querySelector(`[data-step="${stepId}"]`);
    if (!node) return;
    node.className = state || "";
  }
}

const projectAgent = new ProjectFlowAgent();

function showAuthSection(target) {
  if (target === "login") {
    selectors.loginCard.classList.remove("hidden");
    selectors.registerCard.classList.add("hidden");
  } else if (target === "register") {
    selectors.registerCard.classList.remove("hidden");
    selectors.loginCard.classList.add("hidden");
  } else {
    selectors.loginCard.classList.add("hidden");
    selectors.registerCard.classList.add("hidden");
  }
}

function slugifyName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^\d+/, "");
}

function generateUniqueUsername(name) {
  let base = slugifyName(name);
  if (!base) {
    base = "investor";
  }
  let username = base;
  let suffix = 1;
  while (users[username] || investorDataset.some((inv) => inv.username === username)) {
    username = `${base}${suffix}`;
    suffix += 1;
  }
  return username;
}

function findUserCredentials(username, password) {
  // First check investorDataset (primary source for registered investors)
  const investor = investorDataset.find(
    (inv) => inv.username === username && inv.password === password
  );
  
  if (investor) {
    console.log("Login successful from investorDataset:", investor.username);
    return {
      username: investor.username,
      password: investor.password,
      role: "user",
      name: investor.name,
    };
  }
  
  // Then check users object (for admin and default system users)
  if (users[username] && users[username].password === password) {
    console.log("Login successful from users object:", username);
    return { username, ...users[username] };
  }
  
  console.log("Login failed: credentials not found");
  return null;
}

selectors.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const userCreds = findUserCredentials(username, password);
  
  if (!userCreds) {
    alert("Invalid credentials. Please check your username and password.");
    return;
  }

  activeUser = userCreds;
  selectors.loginCard.classList.add("hidden");
  selectors.registerCard.classList.add("hidden");
  selectors.accessCard.classList.add("hidden");
  selectors.dashboard.classList.remove("hidden");
  selectors.welcomeTitle.textContent = `Welcome, ${activeUser.name}`;
  selectors.welcomeSubtitle.textContent =
    activeUser.role === "admin"
      ? "You can update live company deals."
      : "Review deals and ask AI for the best pick.";

  selectors.companyForm.classList.toggle("hidden", activeUser.role !== "admin");
  selectors.aiCard.classList.toggle("hidden", activeUser.role === "admin");
  selectors.agentCard.classList.remove("hidden");
  
  // Hide Registered Investors and Users Debug sections for all users
  selectors.investorsCard.classList.add("hidden");
  selectors.usersDebugCard.classList.add("hidden");

  renderCompanyTable();
  renderHistoryTable();
  if (activeUser.role === "admin") {
    populateCompanySelect();
  }
  projectAgent.reset(true, "Agent idle. Ready to run.");
  selectors.runAgentBtn.disabled = false;
});

selectors.logoutBtn.addEventListener("click", () => {
  activeUser = null;
  selectors.accessCard.classList.remove("hidden");
  showAuthSection(null);
  selectors.dashboard.classList.add("hidden");
  selectors.loginForm.reset();
  selectors.suggestionResult.classList.add("hidden");
  selectors.ackMessage.classList.add("hidden");
  selectors.investMessage.classList.add("hidden");
  selectors.agentCard.classList.add("hidden");
  projectAgent.reset(true, "Agent idle. Login to enable.", true);
});

selectors.companySelect.addEventListener("change", (event) => {
  setFormValues(event.target.value);
});

selectors.companyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const index = parseInt(selectors.companySelect.value, 10);
  companies[index].revenue = parseFloat(selectors.revenueInput.value);
  companies[index].interest = parseFloat(selectors.interestInput.value);

  renderCompanyTable();
  alert(`${companies[index].name} has been updated.`);
});

selectors.suggestBtn.addEventListener("click", () => {
  const suggestion = getSuggestion();
  if (!suggestion) return;
  revealSuggestion(suggestion);
});

selectors.ackBtn.addEventListener("click", () => {
  selectors.ackMessage.textContent =
    "Acknowledged! We logged your interest in this deal.";
  selectors.ackMessage.classList.remove("hidden");
});

selectors.investBtn.addEventListener("click", () => {
  if (!lastSuggestion) {
    alert("Ask the AI for a suggestion first.");
    return;
  }

  const amount = parseFloat(selectors.investAmount.value);
  if (Number.isNaN(amount) || amount <= 0) {
    alert("Enter a valid amount to invest.");
    return;
  }

  selectors.investMessage.textContent = `Great! Your plan to invest ₹${amount.toFixed(
    1
  )}K in ${lastSuggestion.name} is recorded.`;
  selectors.investMessage.classList.remove("hidden");
});

selectors.runAgentBtn.addEventListener("click", () => {
  projectAgent.start();
});

selectors.showLoginBtn.addEventListener("click", () => {
  showAuthSection("login");
});

selectors.showRegisterBtn.addEventListener("click", () => {
  showAuthSection("register");
});

selectors.registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = selectors.registerName.value.trim();
  const password = selectors.registerPassword.value.trim();

  if (name.length < 3) {
    selectors.registerFeedback.textContent = "Name must be at least 3 characters long.";
    selectors.registerFeedback.classList.remove("success-text");
    return;
  }
  if (password.length < 6) {
    selectors.registerFeedback.textContent = "Password must be at least 6 characters long.";
    selectors.registerFeedback.classList.remove("success-text");
    return;
  }

  const username = generateUniqueUsername(name);
  
  // PRIMARY: Add to investorDataset (this is the source of truth for investor credentials)
  const newInvestor = {
    name,
    username,
    password,
    createdAt: new Date().toISOString(),
  };
  investorDataset.push(newInvestor);
  
  // SYNC: Also add to users object for backward compatibility and quick lookup
  users[username] = { password, role: "user", name };
  
  // Debug: Log to console to verify update
  console.log("InvestorDataset updated:", investorDataset);
  console.log("New investor registered:", username, newInvestor);
  console.log("Users object synced:", users);

  selectors.registerFeedback.textContent = `Registered! Use username "${username}" to log in. Dataset now contains ${investorDataset.length} registered investors.`;
  selectors.registerFeedback.classList.add("success-text");
  selectors.registerForm.reset();
});

showAuthSection(null);

