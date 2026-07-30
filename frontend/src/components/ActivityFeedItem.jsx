function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

function getActionLabel(type, metadata) {
  switch (type) {
    case 'TASK_CREATED':
      return `created task "${metadata?.taskTitle || 'Unknown'}"`;

    case 'TASK_STATUS_CHANGED':
      return `changed task "${metadata?.taskTitle || 'Unknown'}" from ${metadata?.from || '?'} to ${metadata?.to || '?'}`;

    case 'TASK_APPROVED':
      return `approved task "${metadata?.taskTitle || 'Unknown'}"`;

    default:
      return 'performed an action';
  }
}

function getActionIcon(type) {
  switch (type) {
    case 'TASK_CREATED':
      return '✨';
    case 'TASK_STATUS_CHANGED':
      return '🔄';
    case 'TASK_APPROVED':
      return '✅';
    default:
      return '📌';
  }
}

export default function ActivityFeedItem({ event }) {
  const { type, userName, metadata, timestamp } = event;

  const timeAgo = getTimeAgo(new Date(timestamp));
  const actionLabel = getActionLabel(type, metadata);
  const icon = getActionIcon(type);

  return (
    <div style={{ marginBottom: '2rem', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: '-31px',
          top: '4px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#6366f1',
          border: '3px solid white',
          boxShadow: '0 0 0 2px #e0e7ff',
        }}
      />

      <div style={{ fontSize: '1rem', color: '#333', marginBottom: '4px' }}>
        <strong style={{ color: '#6366f1' }}>{userName || 'System'}</strong> {icon} {actionLabel}
      </div>

      {metadata && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {metadata.taskTitle && (
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#e0e7ff',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#6366f1',
            }}>
              {metadata.taskTitle}
            </span>
          )}
          {metadata.from && metadata.to && (
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#e0e7ff',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#6366f1',
            }}>
              {metadata.from} → {metadata.to}
            </span>
          )}
        </div>
      )}

      <time style={{ display: 'block', color: '#999', fontSize: '0.85rem', marginTop: '0.5rem' }}>
        {timeAgo}
      </time>
    </div>
  );
}
