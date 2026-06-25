import React from 'react';

const statusConfig = {
  pending:      { label: 'Pending',      icon: 'bi-clock', cls: 'badge-pending' },
  under_review: { label: 'Under Review', icon: 'bi-eye',   cls: 'badge-under_review' },
  in_progress:  { label: 'In Progress',  icon: 'bi-arrow-repeat', cls: 'badge-in_progress' },
  resolved:     { label: 'Resolved',     icon: 'bi-check-circle', cls: 'badge-resolved' },
  rejected:     { label: 'Rejected',     icon: 'bi-x-circle', cls: 'badge-rejected' },
  closed:       { label: 'Closed',       icon: 'bi-archive', cls: 'badge-closed' },
};

const priorityConfig = {
  low:    { label: 'Low',    cls: 'badge-low' },
  medium: { label: 'Medium', cls: 'badge-medium' },
  high:   { label: 'High',   cls: 'badge-high' },
  urgent: { label: 'Urgent', cls: 'badge-urgent' },
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, icon: 'bi-dot', cls: '' };
  return (
    <span className={`badge ${cfg.cls}`} style={{ borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
      <i className={`bi ${cfg.icon} me-1`} />{cfg.label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const cfg = priorityConfig[priority] || { label: priority, cls: '' };
  return (
    <span className={`badge ${cfg.cls}`} style={{ borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
};

export const CategoryBadge = ({ category }) => (
  <span style={{
    background: 'rgba(225,29,72,0.1)', color: 'var(--violet-light)',
    borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500,
    textTransform: 'capitalize',
    border: '1px solid rgba(225,29,72,0.2)',
  }}>
    {category?.replace('_', ' ')}
  </span>
);
