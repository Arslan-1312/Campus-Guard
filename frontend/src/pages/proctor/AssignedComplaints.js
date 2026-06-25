import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/shared/StatusBadge';
import api from '../../utils/api';
import { downloadComplaintsCSV, downloadComplaint } from '../../utils/downloadComplaint';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 10, ...filters });
      Object.keys(filters).forEach((k) => !filters[k] && params.delete(k));
      const { data } = await api.get(`/complaints?${params}`);
      setComplaints(data.complaints);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  return (
    <Layout title="Assigned Complaints">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Assigned to Me <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>({total})</span>
        </h5>
        {complaints.length > 0 && (
          <button className="btn btn-outline-success btn-sm" onClick={() => downloadComplaintsCSV(complaints, 'assigned-complaints')}>
            <i className="bi bi-download me-1" />Export CSV
          </button>
        )}
      </div>

      <div className="cg-card mb-3">
        <div className="cg-filter-row row g-2">
          <div className="col-md-6">
            <input type="text" className="form-control form-control-sm" placeholder="🔍 Search..."
              value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} />
          </div>
          <div className="col-md-4">
            <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
              <option value="">All Statuses</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => setFilters({ status: '', search: '', page: 1 })}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="cg-card">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          : complaints.length === 0 ? (
            <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
              <i className="bi bi-clipboard-x" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
              No complaints assigned to you yet
            </div>
          ) : (
            <div className="cg-table-mobile-wrap table-responsive">
              <table className="cg-table">
                <thead>
                  <tr><th>Ref #</th><th>Title</th><th>Category</th><th>Student</th><th>Priority</th><th>Status</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id}>
                      <td data-label="Ref #"><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--violet-light)' }}>{c.referenceNumber}</span></td>
                      <td data-label="Title" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                      <td data-label="Category"><CategoryBadge category={c.category} /></td>
                      <td data-label="Student" style={{ fontSize: 13 }}>
                        {c.isAnonymous ? <span style={{ color: '#e65100' }}><i className="bi bi-incognito" /></span> : c.submittedBy?.name || '—'}
                      </td>
                      <td data-label="Priority"><PriorityBadge priority={c.priority} /></td>
                      <td data-label="Status"><StatusBadge status={c.status} /></td>
                      <td data-label="Date" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td data-label=""><div className="d-flex gap-1"><Link to={`/proctor/complaints/${c._id}`} className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: 12 }}>Manage</Link><button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 6, fontSize: 12 }} title="Download" onClick={() => downloadComplaint(c)}><i className="bi bi-download" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        {total > 10 && (
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button className="btn btn-sm btn-outline-secondary" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}><i className="bi bi-chevron-left" /></button>
            <span style={{ fontSize: 13, padding: '6px 12px' }}>Page {filters.page} of {Math.ceil(total / 10)}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={filters.page >= Math.ceil(total / 10)} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}><i className="bi bi-chevron-right" /></button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssignedComplaints;
