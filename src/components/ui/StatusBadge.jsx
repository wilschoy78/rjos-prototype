const STATUS_STYLES = {
  good: 'border-green-200 bg-green-50 text-signal-500',
  blocked: 'border-brand-200 bg-brand-50 text-brand-700',
};

const STATUS_LABELS = {
  good: 'Good Standing',
  blocked: 'Overdue / Credit Blocked',
};

/**
 * Displays a reusable customer account health badge.
 *
 * @param {object} props Component props.
 * @param {'good'|'blocked'} props.status Customer credit status.
 * @returns {JSX.Element} Status badge.
 */
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default StatusBadge;
