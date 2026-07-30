import { useState } from 'react';
import { useProjectActivity } from '../hooks/useActivityQuery.js';
import ActivityFeedItem from './ActivityFeedItem.jsx';

export default function ActivityFeed({ projectId }) {
  const [filters, setFilters] = useState({
    type: '',
    limit: 50,
    offset: 0,
  });

  const { data, isLoading, error } = useProjectActivity(projectId, filters);

  const events = data?.events || [];
  const pagination = data?.pagination || {};

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, offset: 0 });
  };

  const handleNextPage = () => {
    setFilters({
      ...filters,
      offset: filters.offset + filters.limit,
    });
  };

  const handlePrevPage = () => {
    setFilters({
      ...filters,
      offset: Math.max(0, filters.offset - filters.limit),
    });
  };

  if (isLoading) {
    return <div className="activity-feed" style={{ textAlign: 'center', padding: '2rem' }}>Loading activity...</div>;
  }

  if (error) {
    return <div className="activity-feed" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Failed to load activity</div>;
  }

  return (
    <div className="activity-feed" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3>Filter by type:</h3>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange({ type: e.target.value })}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <option value="">All Events</option>
          <option value="TASK_CREATED">Task Created</option>
          <option value="TASK_STATUS_CHANGED">Status Changed</option>
          <option value="TASK_APPROVED">Task Approved</option>
        </select>
      </div>

      <div className="activity-list" style={{ borderLeft: '3px solid #6366f1', paddingLeft: '2rem' }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No activity found</div>
        ) : (
          events.map((event) => (
            <ActivityFeedItem key={event.id} event={event} />
          ))
        )}
      </div>

      {pagination.total > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handlePrevPage}
            disabled={filters.offset === 0}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: filters.offset === 0 ? 'not-allowed' : 'pointer',
              opacity: filters.offset === 0 ? 0.5 : 1,
            }}
          >
            ← Previous
          </button>

          <span style={{ color: '#666' }}>
            {filters.offset + 1} - {Math.min(filters.offset + filters.limit, pagination.total)} 
            of {pagination.total}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!pagination.hasMore}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !pagination.hasMore ? 'not-allowed' : 'pointer',
              opacity: !pagination.hasMore ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
