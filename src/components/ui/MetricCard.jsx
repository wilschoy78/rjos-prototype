/**
 * Displays a compact KPI card for the operations dashboard.
 *
 * @param {object} props Component props.
 * @param {React.ComponentType<{ size?: number, className?: string }>} props.icon KPI icon component.
 * @param {string} props.label Metric label.
 * @param {string|number} props.value Metric value.
 * @param {string} props.helper Supporting context.
 * @returns {JSX.Element} Metric card.
 */
function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
        </div>
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-2.5 text-brand-700">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-5 text-zinc-500">{helper}</p>
    </article>
  );
}

export default MetricCard;
