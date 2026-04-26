import { useEffect, useState } from "react";
import api from "../services/api";
import { Calendar, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function SalaryPaymentHistory({ employeeId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
  });

  useEffect(() => {
    fetchPayments();
  }, [employeeId, currentPage, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        ...filters,
      });
      
      const response = await api.get(`/employees/${employeeId}/salary-payments?${params}`);
      setPayments(response.data);
      // Note: This would need pagination support from the backend
    } catch (error) {
      console.error("Error fetching salary payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ date: '' });
  };

  return (
    <div className="salary-payment-history">
      <div className="history-header">
        <h4>Payment History</h4>
        <div className="history-filters">
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          {filters.date && (
            <button onClick={clearFilters} className="clear-filters">
              Clear
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="history-filters-grid">
            <div className="filter-group">
              <label>Filter by Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading payment history...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <p>No salary payments recorded yet</p>
        </div>
      ) : (
        <div className="payments-table">
          <table>
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Description</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <div className="payment-date">
                      <Calendar size={14} />
                      {formatDate(payment.payment_date)}
                    </div>
                  </td>
                  <td>
                    {payment.description ? (
                      <span>{payment.description}</span>
                    ) : (
                      <span className="no-description">No description</span>
                    )}
                  </td>
                  <td>
                    <span className="created-date">
                      {formatDate(payment.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <style jsx>{`
        .salary-payment-history {
          margin-top: 1rem;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .history-header h4 {
          color: #e2e8f0;
          margin: 0;
          font-size: 1rem;
        }
        .history-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: #34d399;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .clear-filters {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 0.75rem;
        }
        .history-filters-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }
        .filter-group label {
          display: block;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }
        .filter-group input {
          width: 100%;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 0.875rem;
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(139, 92, 246, 0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
        .payments-table {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
        }
        .payments-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .payments-table th {
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .payments-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }
        .payment-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        .no-description {
          color: #64748b;
          font-style: italic;
        }
        .created-date {
          font-size: 0.75rem;
          color: #64748b;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .page-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-info {
          color: #94a3b8;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
