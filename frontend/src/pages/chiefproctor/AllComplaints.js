import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/shared/StatusBadge';
import api from '../../utils/api';
import { downloadComplaintsCSV, downloadComplaint } from '../../utils/downloadComplaint';
import toast from 'react-hot-toast';

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '', page: 1, sortBy: 'createdAt', order: 'desc' });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 15, ...filters });
      Object.keys(filters).forEach((k) => !filters[k] && params.delete(k));
      const { data } = await api.get(`/complaints?${params}`);
      setComplaints(data.complaints);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) return;
    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Complaint deleted successfully');
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete complaint');
    }
  };

  return (
    <Layout title="All Complaints">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          All Complaints <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>({total} total)</span>
        </h5>
        {complaints.length > 0 && (
          <button className="btn btn-outline-success btn-sm" onClick={() => downloadComplaintsCSV(complaints, 'all-complaints')}>
            <i className="bi bi-download me-1" />Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="cg-card mb-3">
        <div className="cg-filter-row row g-2">
          <div className="col-md-4">
            <input type="text" className="form-control form-control-sm" placeholder="🔍 Search reference, title..."
              value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
          </div>
          <div className="col-md-2">
            <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select form-select-sm" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {['harassment','bullying','ragging','smoking','violence','theft','academic','misconduct','other'].map(c => (
                <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select form-select-sm" value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => setFilters({ status: '', category: '', priority: '', search: '', page: 1, sortBy: 'createdAt', order: 'desc' })}>
              <i className="bi bi-x-lg me-1" />Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cg-card">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <i className="bi bi-inbox" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
            No complaints found
          </div>
        ) : (
          <>
            <div className="cg-table-mobile-wrap table-responsive">
              <table className="cg-table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Student</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id}>
                      <td data-label="Ref #"><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--violet-light)', whiteSpace: 'nowrap' }}>{c.referenceNumber}</span></td>
                      <td data-label="Title" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title}
                        {c.isAnonymous && <span style={{ fontSize: 10, color: '#e65100', display: 'block' }}><i className="bi bi-incognito me-1" />Anon</span>}
                      </td>
                      <td data-label="Category"><CategoryBadge category={c.category} /></td>
                      <td data-label="Student" style={{ fontSize: 13 }}>
                        {c.isAnonymous
                          ? <span style={{ color: '#e65100' }}>Anonymous</span>
                          : <div>
                              <div style={{ fontWeight: 600 }}>{c.submittedBy?.name || '—'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.submittedBy?.rollNumber}</div>
                            </div>
                        }
                      </td>
                      <td data-label="Priority"><PriorityBadge priority={c.priority} /></td>
                      <td data-label="Status"><StatusBadge status={c.status} /></td>
                      <td data-label="Assigned To" style={{ fontSize: 13 }}>
                        {c.assignedTo
                          ? <span style={{ color: 'var(--cyan)' }}><i className="bi bi-person-check me-1" />{c.assignedTo.name}</span>
                          : <span style={{ color: '#e65100', fontSize: 12 }}>Unassigned</span>
                        }
                      </td>
                      <td data-label="Date" style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td data-label="">
                        <div className="d-flex gap-1">
                          <Link to={`/chief/complaints/${c._id}`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: 6, fontSize: 12, whiteSpace: 'nowrap' }}>
                            View
                          </Link>
                          <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 6, fontSize: 12 }} title="Download" onClick={() => downloadComplaint(c)}><i className="bi bi-download" /></button>
                          <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6, fontSize: 12 }} title="Delete" onClick={() => handleDelete(c._id)}><i className="bi bi-trash" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 15 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Showing {((filters.page - 1) * 15) + 1}–{Math.min(filters.page * 15, total)} of {total}
                </span>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" disabled={filters.page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                    <i className="bi bi-chevron-left" />
                  </button>
                  <span style={{ fontSize: 13, padding: '6px 12px', color: 'var(--text-secondary)' }}>
                    {filters.page} / {Math.ceil(total / 15)}
                  </span>
                  <button className="btn btn-sm btn-outline-secondary" disabled={filters.page >= Math.ceil(total / 15)}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                    <i className="bi bi-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AllComplaints;
