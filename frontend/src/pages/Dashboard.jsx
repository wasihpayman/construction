import { useEffect, useState } from "react";
import api from "../services/projectApi";
import { useProject } from "../contexts/ProjectContext";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  CreditCard,
  Package
} from "lucide-react";

export default function Dashboard() {
  const { activeProjectId, hasActiveProject } = useProject();
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (hasActiveProject) {
      loadFinancialData();
    }
  }, [activeProjectId, hasActiveProject]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      // Clear previous data
      setFinancialData(null);
      
      // Use the backend financial dashboard which now calculates unit payments correctly
      const response = await api.get("/financial-dashboard");
      console.log("Financial Dashboard Response:", response.data);
      
      // Log the specific values we're interested in
      if (response.data && response.data.balance_summary) {
        console.log("Balance Summary:", response.data.balance_summary);
        Object.entries(response.data.balance_summary).forEach(([currency, data]) => {
          console.log(`${currency} - Unit Sales: ${data.unit_sales}, Unit Payments: ${data.unit_payments}, Remaining: ${data.unit_sales_remaining}`);
        });
      }
      
      setFinancialData(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading financial data:", error);
      setFinancialData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0.00";
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getProgressPercentage = (income, expenses) => {
    if (income === 0) return 0;
    const percentage = (expenses / income) * 100;
    return Math.min(percentage, 100);
  };

  const getFinalBalanceClass = (data, expenseData) => {
    const income = Number(String(data.unit_payments || 0).replace(/,/g, '')) + Number(String(data.party_payments || 0).replace(/,/g, ''));
    const expenses = Number(String(expenseData?.total || 0).replace(/,/g, ''));
    const balance = income - expenses;
    return balance < 0 ? 'negative' : 'positive';
  };

  const getFinalBalanceValue = (data, expenseData, currency) => {
    const income = Number(String(data.unit_payments || 0).replace(/,/g, '')) + Number(String(data.party_payments || 0).replace(/,/g, ''));
    const expenses = Number(String(expenseData?.total || 0).replace(/,/g, ''));
    const balance = income - expenses;
    const isNegative = balance < 0;
    const prefix = currency === 'USD' ? '$' : '';
    return `${isNegative ? '-' : ''}${prefix}${formatNumber(Math.abs(balance))}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
            <div className="loading-logo">
              <DollarSign size={32} />
            </div>
          </div>
          <p className="loading-text">Loading financial dashboard...</p>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!financialData || financialData.error) {
    return (
      <div className="dashboard-container">
        <div className="error-screen">
          <div className="error-icon">
            <AlertCircle size={64} />
          </div>
          <h2>Unable to Load Dashboard</h2>
          <p>There was an error fetching your financial data. Please try again.</p>
          <button onClick={loadFinancialData} className="retry-btn">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { balance_summary = {}, expense_summary = {}, final_balance = {}, material_summary = {}, parties = [] } = financialData || {};

  // Debug: Check parties data
  console.log("Parties Data:", parties);

  // AFN-specific calculations
  const afnIncome = balance_summary?.AFN?.total || 0;
  const afnExpense = expense_summary?.AFN?.total || 0;
  const afnBalance = afnIncome - afnExpense;
  const currencies = Object.keys(balance_summary);
  const activeCurrency = selectedCurrency === "ALL" ? null : selectedCurrency;

  // Filter data based on selected currency
  const filteredBalance = activeCurrency 
    ? { [activeCurrency]: balance_summary[activeCurrency] }
    : balance_summary;
  const filteredExpense = activeCurrency
    ? { [activeCurrency]: expense_summary[activeCurrency] }
    : expense_summary;
  const filteredFinal = activeCurrency
    ? { [activeCurrency]: final_balance[activeCurrency] }
    : final_balance;

  const totalPartyPayments = Object.values(filteredBalance).reduce((sum, data) => sum + (data.party_payments || 0), 0);
  const totalIncome = Object.values(filteredBalance).reduce((sum, data) => sum + (data.unit_sales || 0), 0);
  const totalPayments = Object.values(filteredBalance).reduce((sum, data) => sum + (data.unit_payments || 0), 0);
  const totalRemaining = Object.values(filteredBalance).reduce((sum, data) => sum + (data.unit_sales_remaining || 0), 0);

  // Calculate totals
  const totalIncomeByCurrency = Object.fromEntries(
    Object.entries(filteredBalance).map(
      ([currency, data]) => [
        currency,
        data.unit_sales || 0
      ]
    )
  );
  const totalExpenses = Object.values(expense_summary).reduce((sum, data) => sum + (data.total || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
// USD-specific calculations
const usdIncome = balance_summary?.USD?.unit_sales || 0;
const usdPaid = balance_summary?.USD?.unit_payments || 0;
const usdExpense = expense_summary?.USD?.total || 0;
const usdBalance = (Number(balance_summary?.USD?.unit_payments || 0) + Number(balance_summary?.USD?.party_payments || 0)) - Number(usdExpense || 0);
  // Calculate Unit Paid Money (from unit_sales - actual paid amount)
  const unitPaidMoney = Object.values(balance_summary).reduce((sum, data) => sum + (data.unit_sales || 0), 0);

  // Calculate Remaining Money (from unit_sales_remaining - unpaid balance on sold units)
  const remainingMoney = Object.values(balance_summary).reduce((sum, data) => sum + (data.unit_sales_remaining || 0), 0);


const partyBalanceAFN = parties
  .filter(p => p.currency === "AFN")
  .reduce((sum, p) => sum + Number(p.total || 0), 0);

const partyBalanceUSD = parties
  .filter(p => p.currency === "USD")
  .reduce((sum, p) => sum + Number(p.total || 0), 0);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <TrendingUp size={28} strokeWidth={1.5} />
            </div>
            <div className="header-text">
              <h1>
                Financial Dashboard
                <span className="header-badge">Live</span>
              </h1>
              <p>Real-time financial overview and analytics</p>
            </div>
          </div>
          <div className="header-right">
            <div className="last-updated">
              <Clock size={14} />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <button onClick={loadFinancialData} className="refresh-btn" title="Refresh data">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
{/* PARTY BALANCE */}
<div className="afn-card" style={{ border: "1px solid #10b981" }}>
  <div className="afn-header">
    <h3>Party Balance</h3>
  </div>

  <div className="afn-row">
    <span>AFN Balance</span>
    <b style={{ color: "#10b981" }}>
      AFN {formatNumber(partyBalanceAFN)}
    </b>
  </div>

  <div className="afn-row">
    <span>USD Balance</span>
    <b style={{ color: "#3b82f6" }}>
      $ {formatNumber(partyBalanceUSD)}
    </b>
  </div>
</div>
      {/* AFN Summary Card */}
      <div className="afn-card">
        <div className="afn-header">
          <h3>Afghani (AFN) Summary</h3>
        </div>
        <div className="afn-row">
          <span>Income</span>
          <b>AFN {formatNumber(afnIncome)}</b>
        </div>
        <div className="afn-row">
          <span>Expenses</span>
          <b style={{ color: "#ef4444" }}>
            AFN {formatNumber(afnExpense)}
          </b>
        </div>
        <div className="afn-row">
          <span>Balance</span>
          <b style={{ color: afnBalance >= 0 ? "#10b981" : "#ef4444" }}>
            AFN {formatNumber(afnBalance)}
          </b>
        </div>
      </div>
            {/* USD Summary Card */}
      <div className="afn-card">
        <div className="afn-header">
          <h3>Dollar (USD) Summary</h3>
        </div>
        <div className="afn-row">
          <span>Income</span>
          <b>USD ${formatNumber(Number(balance_summary?.USD?.unit_payments || 0) + Number(balance_summary?.USD?.party_payments || 0))}</b>
        </div>
        <div className="afn-row">
          <span>Expenses</span>
          <b style={{ color: "#ef4444" }}>
            USD {formatNumber(usdExpense)}
          </b>
        </div>
        <div className="afn-row">
          <span>Balance</span>
          <b style={{ color: usdBalance >= 0 ? "#10b981" : "#ef4444" }}>
            USD {formatNumber(usdBalance)}
          </b>
        </div>
      </div>

      {/* Currency Filter */}
      <div className="currency-filter">
        <button
          onClick={() => setSelectedCurrency("ALL")}
          className={`filter-chip ${selectedCurrency === "ALL" ? "active" : ""}`}
        >
          All Currencies
        </button>
        {currencies.map(currency => (
          <button
            key={currency}
            onClick={() => setSelectedCurrency(currency)}
            className={`filter-chip ${selectedCurrency === currency ? "active" : ""}`}
          >
            {currency}
          </button>
        ))}
      </div>
        <center><h1>Units Sales Financial </h1></center>
      {/* KPI Cards */}
      <div className="kpi-grid responsive-grid">
        <div className="kpi-card">
          <div className="kpi-icon green">
            <CreditCard size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Unit Paid Money</span>
            <div className="kpi-breakdown">
              <div className="kpi-breakdown-item">
                <span className="kpi-breakdown-label">Revenue</span>
                <span className="kpi-breakdown-value">{selectedCurrency === 'USD' || selectedCurrency === 'ALL' ? '$' : ''}{formatNumber(Object.values(balance_summary).reduce((sum, data) => sum + (data.unit_sales || 0), 0))}</span>
              </div>
              <div className="kpi-breakdown-item">
                <span className="kpi-breakdown-label">Paid Amount</span>
                <span className="kpi-breakdown-value">{selectedCurrency === 'USD' || selectedCurrency === 'ALL' ? '$' : ''}{formatNumber(Object.values(balance_summary).reduce((sum, data) => sum + (data.unit_payments || 0), 0))}</span>
              </div>
            </div>
            <span className="kpi-trend positive">
              <ArrowUpRight size={14} />
              +12.5%
            </span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orange">
            <Wallet size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Remaining Installments</span>
            <span className="kpi-value" style={{ color: remainingMoney >= 0 ? '#10b981' : '#ef4444' }}>
              {selectedCurrency === 'USD' || selectedCurrency === 'ALL' ? '$' : ''}{formatNumber(Math.abs(remainingMoney))}
            </span>
            <span className="kpi-trend" style={{ color: remainingMoney >= 0 ? '#10b981' : '#ef4444' }}>
              {remainingMoney >= 0 ? 'Available' : 'Overdrawn'}
            </span>
          </div>
        </div>
      </div>

      {/* Income vs Expense Overview */}
      <div className="overview-section">
        <div className="section-header">
          <h2>
            <BarChart3 size={20} />
            Income vs Expenses Overview
          </h2>
        </div>
        <div className="comparison-bars">
          {Object.entries(filteredBalance).map(([currency, data]) => {
            const expenseData = filteredExpense[currency] || { total: 0 };
            const income = Number(String(data.unit_sales || 0).replace(/,/g, '')) + Number(String(data.party_payments || 0).replace(/,/g, ''));
            const expense = expenseData.total || 0;
            const maxValue = Math.max(income, expense, 1);
            const incomePercent = (income / maxValue) * 100;
            const expensePercent = (expense / maxValue) * 100;
            return (
              <div key={currency} className="comparison-item">
                <div className="comparison-header">
                  <span className="currency-name">{currency}</span>
                  <div className="comparison-values">
                    <span className="income-value">Income: {currency === 'USD' ? '$' : 'AFN '}{formatNumber(income)}</span>
                    <span className="expense-value">Expense: {currency === 'USD' ? '$' : 'AFN '}{formatNumber(expense)}</span>
                  </div>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar income-bar" 
                    style={{ width: `${incomePercent}%` }}
                  >
                    <span className="bar-label">{incomePercent.toFixed(0)}%</span>
                  </div>
                  <div 
                    className="bar expense-bar" 
                    style={{ width: `${expensePercent}%` }}
                  >
                    <span className="bar-label">{expensePercent.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Income Section */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <div className="title-icon income">
                <TrendingUp size={18} />
              </div>
              <h3>Income Summary</h3>
            </div>
            <span className="card-badge">Revenue</span>
          </div>
          <div className="card-content">
            {Object.entries(filteredBalance).map(([currency, data]) => (
              <div key={currency} className="financial-item income-item">
                <div className="item-header">
                  <span className="item-currency">{currency}</span>
                  <span className="item-total">{currency === 'USD' ? '$' : ''}{formatNumber(data.total)}</span>
                </div>
                <div className="balance-stats">
                  <div className="balance-stat">
                    <span className="stat-label">Income</span>
                    <span className="stat-value">{currency === 'USD' ? '$' : 'AFN '}{formatNumber(Number(String(data.unit_payments || 0).replace(/,/g, '')) + Number(String(data.party_payments || 0).replace(/,/g, '')))}</span>
                  </div>
                  <div className="balance-stat">
                    <span className="stat-label">Expenses</span>
                    <span className="stat-value expense">{currency === 'USD' ? '$' : 'AFN '}{formatNumber(Number(String(expense_summary[currency]?.total || 0).replace(/,/g, '')))}</span>
                  </div>
                </div>
                <div className="balance-divider"></div>
                <div className="balance-final">
                  <span className="final-label">Final Balance</span>
                  <span className={`final-value ${getFinalBalanceClass(data, expense_summary[currency])}`}>
                    {getFinalBalanceValue(data, expense_summary[currency], currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Section */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <div className="title-icon expense">
                <TrendingDown size={18} />
              </div>
              <h3>Expense Breakdown</h3>
            </div>
            <span className="card-badge">Costs</span>
          </div>
          <div className="card-content">
            {Object.entries(filteredExpense).map(([currency, data]) => (
              <div key={currency} className="financial-item expense-item">
                <div className="item-header">
                  <span className="item-currency">{currency}</span>
                  <span className="item-total expense">{currency === 'USD' ? '$' : ''}{formatNumber(data.total)}</span>
                </div>
                <div className="expense-grid">
                  <div className="expense-chip">
                    <Briefcase size={12} />
                    <span>Salaries: {currency === 'USD' ? '$' : ''}{formatNumber(data.employee_salaries)}</span>
                  </div>
                  <div className="expense-chip">
                    <Users size={12} />
                    <span>Workers: {currency === 'USD' ? '$' : ''}{formatNumber(data.worker_payments)}</span>
                  </div>
                  <div className="expense-chip">
                    <Package size={12} />
                    <span>Materials: {currency === 'USD' ? '$' : ''}{formatNumber(material_summary[currency] || 0)}</span>
                  </div>
                  <div className="expense-chip">
                    <CreditCard size={12} />
                    <span>General: {currency === 'USD' ? '$' : ''}{formatNumber(data.general_expenses)}</span>
                  </div>
                </div>
                <div className="progress-bar-item">
                  <div 
                    className="progress-fill expense-fill"
                    style={{ width: `${(data.total / totalExpenses) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Quick Stats Footer */}
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-icon blue">
            <Users size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {Object.values(expense_summary).filter(d => d.employee_salaries > 0).length}
            </span>
            <span className="stat-label">Employees</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon purple">
            <Building size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {Object.values(balance_summary).filter(d => d.unit_sales > 0).length}
            </span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon orange">
            <Users size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {Object.values(expense_summary).reduce((sum, d) => sum + (d.worker_payments > 0 ? 1 : 0), 0)}
            </span>
            <span className="stat-label">Workers</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon green">
            <DollarSign size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{currencies.length}</span>
            <span className="stat-label">Currencies</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
        }

        /* Loading Screen */
        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }
        .loading-animation {
          position: relative;
          width: 80px;
          height: 80px;
        }
        .loading-spinner {
          width: 80px;
          height: 80px;
          border: 3px solid rgba(139, 92, 246, 0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loading-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #8b5cf6;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-text {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        .loading-progress {
          width: 200px;
          height: 2px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar {
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #6366f1);
          animation: progress 1.5s ease-in-out infinite;
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 60%; }
          100% { width: 100%; }
        }

        /* Error Screen */
        .error-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1rem;
        }
        .error-icon {
          color: #ef4444;
          margin-bottom: 1rem;
        }
        .error-screen h2 {
          color: white;
          font-size: 1.5rem;
        }
        .error-screen p {
          color: #94a3b8;
        }
        .retry-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
        }

        /* Header */
        .dashboard-header {
          margin-bottom: 2rem;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          padding: 1.25rem 2rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-text h1 {
          color: white;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .header-badge {
          background: rgba(16, 185, 129, 0.2);
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 40px;
          font-weight: 500;
          color: #10b981;
        }
        .header-text p {
          color: #94a3b8;
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .last-updated {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        .refresh-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
        }

        /* Currency Filter */
        .currency-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .filter-chip {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 40px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        .filter-chip:hover {
          background: rgba(139, 92, 246, 0.2);
          color: white;
        }
        .filter-chip.active {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          border-color: transparent;
        }

        /* KPI Cards */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .kpi-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
          transition: all 0.2s;
        }
        .kpi-card:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.5);
        }
        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-icon.green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .kpi-icon.red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .kpi-icon.purple { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
        .kpi-icon.orange { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .kpi-info {
          flex: 1;
        }
        .kpi-label {
          display: block;
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
        .kpi-value.green { color: #10b981; }
        .kpi-value.red { color: #ef4444; }
        .kpi-trend {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
        }
        .kpi-trend.positive { color: #10b981; }
        .kpi-trend.negative { color: #ef4444; }

        /* Overview Section */
        .overview-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .section-header {
          margin-bottom: 1.25rem;
        }
        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
        }
        .comparison-bars {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .comparison-item {
          width: 100%;
        }
        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .currency-name {
          font-weight: 600;
          color: #a78bfa;
        }
        .comparison-values {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
        }
        .income-value { color: #10b981; }
        .expense-value { color: #ef4444; }
        .bar-container {
          display: flex;
          height: 32px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
        }
        .bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          transition: width 0.5s ease;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .income-bar {
          background: linear-gradient(90deg, #10b981, #34d399);
          color: white;
        }
        .expense-bar {
          background: linear-gradient(90deg, #ef4444, #f87171);
          color: white;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        .dashboard-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
          overflow: hidden;
        }
        .card-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .title-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .title-icon.income { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .title-icon.expense { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .card-title h3 {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }
        .card-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 20px;
          color: #a78bfa;
        }
        .card-content {
          padding: 1rem 1.25rem;
        }
        .financial-item {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .financial-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .item-currency {
          font-weight: 700;
          color: white;
          font-size: 1rem;
        }
        .item-total {
          font-size: 1.125rem;
          font-weight: 700;
          color: #10b981;
        }
        .item-total.expense { color: #ef4444; }
        .item-details {
          margin-bottom: 0.5rem;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }
        .detail-label { color: #64748b; }
        .detail-value { color: #cbd5e1; }
        .expense-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .expense-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          color: #94a3b8;
        }
        .progress-bar-item {
          height: 4px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.5rem;
        }
        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        .income-fill { background: linear-gradient(90deg, #10b981, #34d399); }
        .expense-fill { background: linear-gradient(90deg, #ef4444, #f87171); }

        /* Balance Section */
        .balance-section {
          margin-bottom: 2rem;
        }
        .balance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .balance-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1.25rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
          transition: all 0.2s;
        }
        .balance-card.positive { border-top: 3px solid #10b981; }
        .balance-card.negative { border-top: 3px solid #ef4444; }
        .balance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .balance-currency {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }
        .positive-icon { color: #10b981; }
        .negative-icon { color: #ef4444; }
        .balance-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .balance-stat {
          text-align: center;
          flex: 1;
        }
        .balance-stat .stat-label {
          display: block;
          font-size: 0.7rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }
        .balance-stat .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: #cbd5e1;
        }
        .balance-stat .stat-value.expense { color: #ef4444; }
        .balance-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0.75rem 0;
        }
        .balance-final {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .final-label {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .final-value {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .final-value.positive { color: #10b981; }
        .final-value.negative { color: #ef4444; }
        .balance-progress {
          height: 4px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        /* Quick Stats */
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }
        .stat-item {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .stat-icon.purple { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
        .stat-icon.orange { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .stat-icon.green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .stat-content {
          flex: 1;
        }
        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
        .stat-label {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .kpi-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }
        
        .kpi-breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }
        
        .kpi-breakdown-label {
          color: #64748b;
          font-weight: 500;
        }
        
        .kpi-breakdown-value {
          color: #10b981;
          font-weight: 600;
        }

        /* AFN Card Styles */
        .afn-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 1rem;
          padding: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .afn-header h3 {
          color: #10b981;
          margin-bottom: 1rem;
        }

        .afn-row {
          display: flex;
          justify-content: space-between;
          margin: 0.5rem 0;
          color: #cbd5e1;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
          .comparison-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .balance-grid {
            grid-template-columns: 1fr;
          }
          .quick-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          .header-left {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}