export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return 'badge badge-approved';
    case 'PENDING':
      return 'badge badge-pending';
    case 'REJECTED':
      return 'badge badge-rejected';
    default:
      return 'badge badge-info';
  }
};
