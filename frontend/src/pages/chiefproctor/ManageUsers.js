import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', search: '', page: 1 });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20, ...filters });
      Object.keys(filters).forEach((k) => !filters[k] && params.delete(k));
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/toggle-active`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const roleColor = { student: '#1565c0', proctor: '#2e7d32', chief_proctor: '#6a1b9a' };
  const roleBg = { student: '#e3f2fd', proctor: '#e8f5e9', chief_proctor: '#f3e5f5' };

  return (
    <Layout title="Manage Users">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 style={{ fontWeight: 700, color: '#1a237e', margin: 0 }}>
          All Users <span style={{ fontSize: 13, color: '#757575', fontWeight: 400 }}>({total})</span>
        </h5>
        <Link to="/chief/create-staff" className="btn btn-cg-primary btn-sm">
          <i className="bi bi-person-plus me-1" />Add Staff
        </Link>
      </div>

      {/* Filters */}
      <div className="cg-card mb-3">
        <div className="row g-2">
          <div className="col-md-6">
            <input type="text" className="form-control form-control-sm" placeholder="🔍 Search name, email, roll number..."
              value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} />
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))}>
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="proctor">Proctors</option>
              <option value="chief_proctor">Chief Proctors</option>
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => setFilters({ role: '', search: '', page: 1 })}>
              <i className="bi bi-x-lg me-1" />Clear
            </button>
          </div>
        </div>
      </div>

      <div className="cg-card">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-5" style={{ color: '#9e9e9e' }}>
            <i className="bi bi-people" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
            No users found
          </div>
        ) : (
          <>
            <div className="cg-table-mobile-wrap table-responsive">
              <table className="cg-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Roll No.</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td data-label="Name">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleBg[u.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: roleColor[u.role], fontSize: 13, flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                            {u.isOnline && <span style={{ fontSize: 10, color: '#4caf50' }}>● Online</span>}
                          </div>
                        </div>
                      </td>
                      <td data-label="Email" style={{ fontSize: 13, color: '#555' }}>{u.email}</td>
                      <td data-label="Role">
                        <span style={{ background: roleBg[u.role], color: roleColor[u.role], borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                          {u.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td data-label="Department" style={{ fontSize: 13, color: '#555' }}>{u.department || '—'}</td>
                      <td data-label="Roll No." style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.rollNumber || '—'}</td>
                      <td data-label="Status">
                        <span style={{
                          background: u.isActive ? '#e8f5e9' : '#ffebee',
                          color: u.isActive ? '#2e7d32' : '#c62828',
                          borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                        }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td data-label="Joined" style={{ fontSize: 12, color: '#757575' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td data-label="">
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          style={{ borderRadius: 6, fontSize: 12 }}
                          onClick={() => toggleActive(u._id, u.isActive)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > 20 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-sm btn-outline-secondary" disabled={filters.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                  <i className="bi bi-chevron-left" />
                </button>
                <span style={{ fontSize: 13, padding: '6px 12px' }}>Page {filters.page} of {Math.ceil(total / 20)}</span>
                <button className="btn btn-sm btn-outline-secondary" disabled={filters.page >= Math.ceil(total / 20)}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ManageUsers;
