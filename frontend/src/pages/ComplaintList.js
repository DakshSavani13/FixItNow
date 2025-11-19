import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaPlus,
  FaBuilding,
  FaWifi,
  FaLightbulb,
  FaTint,
  FaChair,
  FaThermometerHalf,
  FaBroom,
  FaTools,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const ComplaintList = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const categories = [
    { value: 'electrical', label: 'Electrical', icon: <FaLightbulb /> },
    { value: 'plumbing', label: 'Plumbing', icon: <FaTint /> },
    { value: 'furniture', label: 'Furniture', icon: <FaChair /> },
    { value: 'wifi', label: 'WiFi/Internet', icon: <FaWifi /> },
    { value: 'heating', label: 'Heating/Cooling', icon: <FaThermometerHalf /> },
    { value: 'cleaning', label: 'Cleaning', icon: <FaBroom /> },
    { value: 'other', label: 'Other', icon: <FaTools /> }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', icon: <FaClock /> },
    { value: 'assigned', label: 'Assigned', icon: <FaExclamationTriangle /> },
    { value: 'in_progress', label: 'In Progress', icon: <FaTools /> },
    { value: 'resolved', label: 'Resolved', icon: <FaCheckCircle /> },
    { value: 'closed', label: 'Closed', icon: <FaCheckCircle /> }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    fetchComplaints();
  }, [pagination.current, debouncedSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10
      });

      if (debouncedSearch.trim()) {
        params.append('q', debouncedSearch.trim());
      }

      const response = await axios.get(`/complaints?${params}`);
      setComplaints(response.data.complaints);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };


  const getCategoryIcon = (category) => {
    const found = categories.find(c => c.value === category);
    return found ? found.icon : <FaTools />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      assigned: 'badge-assigned',
      in_progress: 'badge-in-progress',
      resolved: 'badge-resolved',
      closed: 'badge-closed'
    };
    return badges[status] || 'badge-pending';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      urgent: 'badge-urgent'
    };
    return badges[priority] || 'badge-medium';
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      await axios.delete(`/complaints/${id}`);
      fetchComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Error deleting complaint');
    }
  };

  return (
    <div className="complaint-list-container">
      <div className="list-header">
        <div className="header-content">
          <h1>Complaints</h1>
          <p>Manage and track maintenance requests</p>
        </div>
        {user.role === 'student' && (
          <Link to="/complaint/new" className="btn btn-primary">
            <FaPlus />
            New Complaint
          </Link>
        )}
      </div>

      <div className="search-container">
        <div className="search-input">
          <FaSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            placeholder="Search complaints..."
          />
        </div>
      </div>

      {/* Complaints List */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No complaints found</h3>
            <p>Try adjusting your filters or create a new complaint</p>
            {user.role === 'student' && (
              <Link to="/complaint/new" className="btn btn-primary">
                Submit Complaint
              </Link>
            )}
            {user.role === 'staff' && (
              <p>You are not allowed to submit a complaint</p>
            )}
          </div>
        ) : (
        <>
          <div className="complaints-grid">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="complaint-card">
                <div className="complaint-header">
                  <div className="complaint-category">
                    {getCategoryIcon(complaint.category)}
                    <span>{complaint.category}</span>
                  </div>
                  <div className="complaint-badges">
                    <span className={`badge ${getStatusBadge(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className={`badge ${getPriorityBadge(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>

                <h3 className="complaint-title">{complaint.title}</h3>
                <p className="complaint-description">{complaint.description}</p>

                <div className="complaint-details">
                  <div className="detail-item">
                    <FaBuilding />
                    <span>{complaint.location.building} - {complaint.location.room}</span>
                  </div>
                  <div className="detail-item">
                    <span>Reported by: {complaint.reportedBy?.name}</span>
                  </div>
                  <div className="detail-item">
                    <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="complaint-actions">
                  <Link
                    to={`/complaint/${complaint._id}`}
                    className="btn btn-outline btn-sm"
                  >
                    <FaEye />
                    View Details
                  </Link>
                  
                  {user.role === 'admin' && (
                    <button
                      onClick={() => deleteComplaint(complaint._id)}
                      className="btn btn-danger btn-sm"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>

              <div className="page-info">
                Page {pagination.current} of {pagination.total}
              </div>

              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.total}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .complaint-list-container {
          padding: 20px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .header-content p {
          color: #6c757d;
          margin: 0;
        }

        .search-container {
          margin-bottom: 20px;
        }

        .search-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          max-width: 420px;
        }

        .search-input input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
        }


        .complaints-grid {
          display: grid;
          gap: 20px;
        }

        .complaint-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .complaint-card:hover {
          transform: translateY(-2px);
        }

        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .complaint-category {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 14px;
        }

        .complaint-badges {
          display: flex;
          gap: 8px;
        }

        .complaint-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #2c3e50;
        }

        .complaint-description {
          color: #6c757d;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .complaint-details {
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6c757d;
        }

        .complaint-actions {
          display: flex;
          gap: 12px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 40px;
        }

        .page-info {
          font-weight: 500;
          color: #2c3e50;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #6c757d;
          margin: 0 0 24px 0;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .complaint-list-container {
            padding: 15px;
          }

          .list-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }


          .complaint-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .complaint-actions {
            flex-direction: column;
          }

          .pagination {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ComplaintList; 