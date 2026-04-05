import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import KpiCard from '../components/KpiCard';

function DashboardPage() {
  const { request } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [summaryData, trendData] = await Promise.all([
        request('/dashboard/summary'),
        request('/dashboard/trends')
      ]);

      setSummary(summaryData || null);
      setTrends(trendData?.trends || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topCategory = summary?.categoryTotals?.[0];
  const maxIncome = Math.max(...trends.map((t) => t.income || 0), 1);
  const maxExpense = Math.max(...trends.map((t) => t.expense || 0), 1);

  return (
    <section className="pageSection">
      <div className="sectionHeader">
        <h2>Dashboard Overview</h2>
        <button className="btn-secondary" onClick={loadDashboard} disabled={loading}>
          Refresh
        </button>
      </div>

      {error ? <p className="alert error">{error}</p> : null}

      <div className="kpiGrid">
        <KpiCard title="Income" value={`$${summary?.totalIncome || 0}`} tone="good" />
        <KpiCard title="Expenses" value={`$${summary?.totalExpenses || 0}`} tone="danger" />
        <KpiCard title="Net" value={`$${summary?.netBalance || 0}`} tone="neutral" />
        <KpiCard title="Recent Activities" value={summary?.recentActivity?.length || 0} tone="info" />
      </div>

      <article className="card heroInsight">
        <div>
          <h3>Performance Snapshot</h3>
          <p className="muted">Live view of your income vs expenses momentum.</p>
        </div>
        <div className="heroStats">
          <div>
            <span className="muted">Top Category</span>
            <p className="heroValue">{topCategory?.category || 'n/a'}</p>
          </div>
          <div>
            <span className="muted">Top Spend/Flow</span>
            <p className="heroValue">${topCategory?.total || 0}</p>
          </div>
          <div>
            <span className="muted">Net Position</span>
            <p className={`heroValue ${Number(summary?.netBalance || 0) >= 0 ? 'positive' : 'negative'}`}>
              ${summary?.netBalance || 0}
            </p>
          </div>
        </div>
      </article>

      <div className="cards2">
        <article className="card">
          <h3>Category Totals</h3>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : (
            <ul className="list scrollable">
              {(summary?.categoryTotals || []).map((item) => (
                <li key={item.category}>
                  <span>{item.category}</span>
                  <strong>${item.total}</strong>
                </li>
              ))}
              {!summary?.categoryTotals?.length ? <li className="muted">No categories yet.</li> : null}
            </ul>
          )}
        </article>

        <article className="card">
          <h3>Monthly Trends</h3>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : (
            <div className="trendStack scrollable">
              {trends.map((item) => (
                <div key={item.period} className="trendRow">
                  <div className="trendLabel">{item.period}</div>
                  <div className="trendBars">
                    <div className="bar income" style={{ width: `${Math.max((item.income / maxIncome) * 100, 6)}%` }} />
                    <div className="bar expense" style={{ width: `${Math.max((item.expense / maxExpense) * 100, 6)}%` }} />
                  </div>
                  <div className="trendValues">
                    <span>In ${item.income || 0}</span>
                    <span>Out ${item.expense || 0}</span>
                  </div>
                </div>
              ))}
              {!trends.length ? <p className="muted">No trend points yet.</p> : null}
            </div>
          )}
        </article>
      </div>

      <article className="card tableCard">
        <h3>Recent Activity</h3>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.recentActivity || []).map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.type}</td>
                  <td>{r.category}</td>
                  <td>${r.amount}</td>
                  <td>{r.createdBy?.email || 'system'}</td>
                </tr>
              ))}
              {!summary?.recentActivity?.length ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No recent records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default DashboardPage;
