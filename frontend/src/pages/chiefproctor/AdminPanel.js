import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['student', 'proctor', 'chief_proctor'];
const DEPTS = ['CS&IT','Mathematics','Physics','English','Management','Education','Agriculture','Other'];

const defaultForm = { name:'', email:'', password:'', role:'student', rollNumber:'', department:'', semester:'', phone:'' };

const Modal = ({ show, title, onClose, children }) => {
  if (!show) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div style={{ background:'#1a1040', border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, width:'100%', maxWidth:540, boxShadow:'0 24px 64px rgba(0,0,0,0.5)', maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h5 style={{ margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:'#f1f5f9', fontSize:17 }}>{title}</h5>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'#1a1040', border:'1px solid rgba(244,63,94,0.3)', borderRadius:16, width:'100%', maxWidth:400, padding:32, boxShadow:'0 24px 48px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize:44, textAlign:'center', marginBottom:16 }}>⚠️</div>
        <h6 style={{ textAlign:'center', color:'#f1f5f9', fontWeight:700, marginBottom:8 }}>Confirm Delete</h6>
        <p style={{ textAlign:'center', color:'#94a3b8', fontSize:14, marginBottom:24 }}>{message}</p>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onCancel} className="btn btn-outline-secondary w-100" style={{ borderRadius:10 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, background:'linear-gradient(135deg,#f43f5e,#fb923c)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, cursor:'pointer', padding:'10px 0' }}>Delete</button>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, name, value, onChange, type='text', placeholder='', required=false, options=null }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:'block', color:'#94a3b8', fontSize:12, fontWeight:600, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px' }}>
      {label}{required && <span style={{ color:'#f43f5e', marginLeft:3 }}>*</span>}
    </label>
    {options ? (
      <select name={name} value={value} onChange={onChange} className="form-select" style={{ borderRadius:10, padding:'10px 14px' }}>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="form-control" style={{ borderRadius:10, padding:'10px 14px' }} required={required} />
    )}
  </div>
);

const roleBadge = {
  student:       { bg:'rgba(6,182,212,0.15)',   color:'#22d3ee',  label:'Student' },
  proctor:       { bg:'rgba(16,185,129,0.15)',  color:'#34d399',  label:'Proctor' },
  chief_proctor: { bg:'rgba(124,58,237,0.15)',  color:'#a78bfa',  label:'Chief Proctor' },
};

const AdminPanel = () => {
  const [tab, setTab]           = useState('student');
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const LIMIT = 15;

  const [showModal, setShowModal]     = useState(false);
  const [editUser, setEditUser]       = useState(null);   // null = create mode
  const [form, setForm]               = useState(defaultForm);
  const [saving, setSaving]           = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: tab, limit: LIMIT, page });
      if (search) params.set('search', search);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [tab, page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [tab, search]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ ...defaultForm, role: tab });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({
      name:        u.name || '',
      email:       u.email || '',
      password:    '',
      role:        u.role || tab,
      rollNumber:  u.rollNumber || '',
      department:  u.department || '',
      semester:    u.semester || '',
      phone:       u.phone || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        await api.put(`/users/${editUser._id}`, form);
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', form);
        toast.success('User created successfully!');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const pages = Math.ceil(total / LIMIT);

  const tabs = [
    { key:'student',       label:'👨‍🎓 Students',       count: tab==='student' ? total : '' },
    { key:'proctor',       label:'👮 Proctors',         count: tab==='proctor' ? total : '' },
    { key:'chief_proctor', label:'🏛️ Chief Proctors',   count: tab==='chief_proctor' ? total : '' },
  ];

  return (
    <Layout title="DB Admin Panel">
      <ConfirmModal
        show={!!deleteTarget}
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal show={showModal} title={editUser ? `Edit — ${editUser.name}` : 'Add New User'} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave}>
          <div className="row g-0">
            <div className="col-12">
              <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ali Hassan" required />
            </div>
            <div className="col-12">
              <FormField label="Email" name="email" value={form.email} onChange={handleChange} type="email" placeholder="user@hu.edu.pk" required />
            </div>
            <div className="col-12">
              <FormField
                label={editUser ? 'New Password (leave blank to keep)' : 'Password'}
                name="password" value={form.password} onChange={handleChange}
                type="password" placeholder="Min 6 characters"
                required={!editUser}
              />
            </div>
            <div className="col-12">
              <FormField label="Role" name="role" value={form.role} onChange={handleChange}
                options={ROLES.map(r => ({ value:r, label:r.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase()) }))} />
            </div>
            {(form.role === 'student') && (
              <div className="col-12">
                <FormField label="Roll Number" name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="e.g. 22-CS-001" />
              </div>
            )}
            {(form.role === 'student') && (
              <div className="col-12">
                <FormField label="Semester" name="semester" value={form.semester} onChange={handleChange} placeholder="e.g. 5th" />
              </div>
            )}
            <div className="col-12">
              <FormField label="Department" name="department" value={form.department} onChange={handleChange}
                options={[{ value:'', label:'— Select Department —' }, ...DEPTS.map(d => ({ value:d, label:d }))]} />
            </div>
            <div className="col-12">
              <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+92 3XX XXXXXXX" />
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline-secondary w-100" style={{ borderRadius:10 }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-cg-primary w-100" style={{ justifyContent:'center', borderRadius:10 }}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : (editUser ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h4 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, color:'#f1f5f9', margin:0 }}>
            🗄️ MongoDB Admin Panel
          </h4>
          <p style={{ color:'#94a3b8', fontSize:13, marginTop:4, marginBottom:0 }}>
            Add, edit, and remove users directly in the database
          </p>
        </div>
        <button className="btn-cg-primary" onClick={openCreate}>
          <i className="bi bi-person-plus" /> Add New User
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'10px 20px', borderRadius:10, border:'1px solid',
            borderColor: tab === t.key ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)',
            background: tab === t.key ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
            color: tab === t.key ? '#a78bfa' : '#94a3b8',
            fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.2s',
          }}>
            {t.label} {t.count !== '' && <span style={{ marginLeft:6, opacity:0.7 }}>({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="cg-card" style={{ marginBottom:16, padding:'14px 18px' }}>
        <div style={{ position:'relative' }}>
          <i className="bi bi-search" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569', fontSize:14 }} />
          <input
            type="text" placeholder="Search name, email, roll number…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="form-control" style={{ paddingLeft:40, borderRadius:10 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="cg-card" style={{ padding:0, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:32 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton-row" />)}
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign:'center', padding:'56px 0', color:'#475569' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>👤</div>
            <div style={{ fontSize:15, fontWeight:600, color:'#94a3b8', marginBottom:6 }}>No users found</div>
            <div style={{ fontSize:13 }}>Try a different search or tab</div>
          </div>
        ) : (
          <>
            <div className="cg-table-mobile-wrap table-responsive">
              <table className="cg-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th>
                    <th>Dept</th><th>Roll No.</th><th>Status</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const rb = roleBadge[u.role] || roleBadge.student;
                    return (
                      <tr key={u._id}>
                        <td data-label="Name">
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background: rb.bg, border:`1px solid ${rb.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:rb.color, fontSize:13, flexShrink:0 }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, color:'#f1f5f9', fontSize:13 }}>{u.name}</div>
                              {u.isOnline && <span style={{ fontSize:10, color:'#34d399' }}>● Online</span>}
                            </div>
                          </div>
                        </td>
                        <td data-label="Email" style={{ fontSize:12, color:'#64748b' }}>{u.email}</td>
                        <td data-label="Role">
                          <span style={{ background:rb.bg, color:rb.color, border:`1px solid ${rb.color}33`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>
                            {rb.label}
                          </span>
                        </td>
                        <td data-label="Dept" style={{ fontSize:12, color:'#94a3b8' }}>{u.department || '—'}</td>
                        <td data-label="Roll No." style={{ fontFamily:'monospace', fontSize:12, color:'#94a3b8' }}>{u.rollNumber || '—'}</td>
                        <td data-label="Status">
                          <span style={{ background: u.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', color: u.isActive ? '#34d399' : '#fb7185', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td data-label="Joined" style={{ fontSize:12, color:'#475569' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td data-label="">
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => openEdit(u)} className="btn btn-outline-primary btn-sm" style={{ borderRadius:8, fontSize:12, padding:'4px 12px' }}>
                              <i className="bi bi-pencil me-1" />Edit
                            </button>
                            <button onClick={() => setDeleteTarget(u)} className="btn btn-outline-danger btn-sm" style={{ borderRadius:8, fontSize:12, padding:'4px 10px' }}>
                              <i className="bi bi-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', gap:8, padding:'16px 0', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ borderRadius:8 }}>
                  <i className="bi bi-chevron-left" />
                </button>
                <span style={{ fontSize:13, color:'#94a3b8', padding:'6px 16px' }}>Page {page} of {pages}</span>
                <button className="btn btn-outline-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)} style={{ borderRadius:8 }}>
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

export default AdminPanel;
