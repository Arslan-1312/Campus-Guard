import React, { useState } from 'react';
import Layout from '../../components/shared/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const departments = ['Computer Science', 'Information Technology', 'Software Engineering', 'Business Administration', 'Education', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Other'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '', semester: user?.semester || '', rollNumber: user?.rollNumber || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPassForm({ ...passForm, [e.target.name]: e.target.value });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPassLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <Layout title="My Profile">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Avatar card */}
        <div className="cg-card mb-4 text-center">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #e11d48, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 800, margin: '0 auto 12px' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h5 style={{ fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{user?.name}</h5>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</div>
          <span style={{ background: 'rgba(225,29,72,0.15)', color: '#fb7185', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, display: 'inline-block', marginTop: 6, border: '1px solid rgba(225,29,72,0.3)' }}>
            Student
          </span>
        </div>

        {/* Profile form */}
        <div className="cg-card mb-4">
          <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Personal Information</h6>
          <form onSubmit={handleProfileSave}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Full Name</label>
                <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Roll Number</label>
                <input type="text" name="rollNumber" className="form-control" value={form.rollNumber} onChange={handleChange} placeholder="HU-CS-2021-XX" />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Phone</label>
                <input type="tel" name="phone" className="form-control" value={form.phone} onChange={handleChange} placeholder="03XX-XXXXXXX" />
              </div>
              <div className="col-sm-7">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Department</label>
                <select name="department" className="form-select" value={form.department} onChange={handleChange}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-sm-5">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Semester</label>
                <select name="semester" className="form-select" value={form.semester} onChange={handleChange}>
                  <option value="">Select semester</option>
                  {semesters.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-cg-primary mt-3" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2 me-1" />Save Changes</>}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="cg-card">
          <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Change Password</h6>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Current Password</label>
              <input type="password" name="currentPassword" className="form-control" value={passForm.currentPassword} onChange={handlePassChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>New Password</label>
              <input type="password" name="newPassword" className="form-control" value={passForm.newPassword} onChange={handlePassChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Confirm New Password</label>
              <input type="password" name="confirmPassword" className="form-control" value={passForm.confirmPassword} onChange={handlePassChange} required />
            </div>
            <button type="submit" className="btn btn-outline-primary" disabled={passLoading} style={{ borderRadius: 8 }}>
              {passLoading ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</> : <><i className="bi bi-lock me-1" />Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default StudentProfile;
