import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const CATEGORY_OPTIONS = ['electrical', 'plumbing', 'furniture', 'wifi', 'heating', 'cleaning', 'other'];

const MaintenanceStaff = () => {
  const [assigned, setAssigned] = useState([]);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState('');

  // Manage staff modal/state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '', department: '', categories: [] });
  const [addLoading, setAddLoading] = useState(false);

  // Cached staff by category
  const [categoryStaffMap, setCategoryStaffMap] = useState({});

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchAssignedComplaints(), fetchPendingComplaints()]);
    setLoading(false);
  };

  const fetchAssignedComplaints = async () => {
    try {
      const res = await axios.get('/complaints?status=assigned');
      setAssigned(res.data.complaints || []);
    } catch (e) {
      setError('Failed to load assigned complaints');
    }
  };

  const fetchPendingComplaints = async () => {
    try {
      const res = await axios.get('/complaints?status=pending');
      setPending(res.data.complaints || []);
    } catch (e) {
      // non-blocking
    }
  };

  const getStaffForCategory = async (category) => {
    if (!category) return [];
    if (categoryStaffMap[category]) return categoryStaffMap[category];
    try {
      const res = await axios.get(`/admin/maintenance-staff?category=${encodeURIComponent(category)}`);
      setCategoryStaffMap(prev => ({ ...prev, [category]: res.data }));
      return res.data;
    } catch (e) {
      return [];
    }
  };

  const handleAssign = async (complaintId, staffId) => {
    if (!staffId) return;
    setAssignLoading(complaintId + '-assign');
    try {
      await axios.patch(`/complaints/${complaintId}/assign`, { assignedTo: staffId });
      await refreshData();
    } catch (e) {
      setError('Failed to assign complaint');
    } finally {
      setAssignLoading('');
    }
  };

  const handleStatusUpdate = async (complaintId, status) => {
    setAssignLoading(complaintId + '-status');
    try {
      await axios.patch(`/complaints/${complaintId}/status`, { status });
      await refreshData();
    } catch (e) {
      setError('Failed to update status');
    } finally {
      setAssignLoading('');
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await axios.post('/admin/maintenance-staff', {
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        phone: addForm.phone,
        department: addForm.department,
        role: 'maintenance',
        categories: addForm.categories,
      });
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', phone: '', department: '', categories: [] });
      setCategoryStaffMap({});
    } catch (e) {
      setError('Failed to add maintenance staff');
    } finally {
      setAddLoading(false);
    }
  };

  const assignedToMe = useMemo(() => {
    // We don't have an API filter by assignedTo; keep the full list for now.
    // Optionally, you can filter client-side if you inject current user id.
    return assigned;
  }, [assigned]);

  if (loading) return <div className="loading">Loading...</div>;
  return (
    <div className="maintenance-staff-page">
      <div className="header-row">
        <h1>Maintenance Staff</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Staff</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="section-card">
        <h2>Assigned Complaints</h2>
        {assignedToMe.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛠️</div>
            <h3>No assigned complaints</h3>
          </div>
        ) : (
          <div className="complaints-list">
            {assignedToMe.map(c => (
              <div key={c._id} className="complaint-card">
                <div className="complaint-header">
                  <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  <span className="complaint-title">{c.title}</span>
                </div>
                <div className="complaint-meta">
                  <span>Category: {c.category}</span>
                  <span>Priority: {c.priority}</span>
                  <span>Location: {c?.location?.building} {c?.location?.room}</span>
                </div>
                <div className="row-actions">
                  <select value={c.status} onChange={(e) => handleStatusUpdate(c._id, e.target.value)} disabled={assignLoading === c._id + '-status'}>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-card">
        <h2>Pending Complaints (Assign by Category)</h2>
        {pending.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No pending complaints</h3>
          </div>
        ) : (
          <div className="complaints-list">
            {pending.map(c => (
              <div key={c._id} className="complaint-card">
                <div className="complaint-header">
                  <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  <span className="complaint-title">{c.title}</span>
                </div>
                <div className="complaint-meta">
                  <span>Category: {c.category}</span>
                  <span>Priority: {c.priority}</span>
                  <span>Location: {c?.location?.building} {c?.location?.room}</span>
                </div>
                <CategoryAssignSelect
                  category={c.category}
                  value={c.assignedTo?._id || ''}
                  onChange={(id) => handleAssign(c._id, id)}
                  loading={assignLoading === c._id + '-assign'}
                  getStaffForCategory={getStaffForCategory}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Add Maintenance Staff</h2>
            <form onSubmit={handleAddMaintenance}>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-control" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input className="form-control" value={addForm.department} onChange={(e) => setAddForm({ ...addForm, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Categories (skills)</label>
                <select multiple className="form-control" value={addForm.categories} onChange={(e) => setAddForm({ ...addForm, categories: Array.from(e.target.selectedOptions, o => o.value) })}>
                  {CATEGORY_OPTIONS.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addLoading}>{addLoading ? 'Adding...' : 'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .maintenance-staff-page { max-width: 900px; margin: 0 auto; padding: 20px; }
        .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .complaints-list { display: grid; gap: 16px; }
        .complaint-card { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 16px; }
        .complaint-header { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
        .complaint-title { font-weight: 600; }
        .complaint-meta { display: flex; gap: 16px; color: #6c757d; font-size: 14px; margin-bottom: 10px; flex-wrap: wrap; }
        .badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; background: #eef; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { background: white; border-radius: 12px; padding: 20px; width: 520px; max-width: calc(100% - 24px); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
        .form-control { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
      `}</style>
    </div>
  );
};

const CategoryAssignSelect = ({ category, value, onChange, loading, getStaffForCategory }) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getStaffForCategory(category).then(list => {
      if (mounted) {
        setOptions(list || []);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [category]);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={loading || isLoading}>
        <option value="">Select staff for {category}</option>
        {options.map(st => (
          <option key={st._id} value={st._id}>{st.name} ({st.email})</option>
        ))}
      </select>
      <button className="btn btn-outline btn-sm" onClick={() => getStaffForCategory(category).then(setOptions)} disabled={isLoading}>Reload</button>
    </div>
  );
};

export default MaintenanceStaff;
