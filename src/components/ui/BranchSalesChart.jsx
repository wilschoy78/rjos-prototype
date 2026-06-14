import { formatCurrency } from '../../utils/format';

/**
 * Renders a comparative bar chart for branch sales.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.data Branch comparison records.
 * @returns {JSX.Element} Comparative branch chart.
 */
function BranchSalesChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.key} className="rounded-2xl border border-zinc-200 bg-white p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-950">{item.label}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-zinc-500">{item.region}</p>
            </div>
            <p className="text-sm font-semibold text-zinc-950">{formatCurrency(item.value)}</p>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                background: `linear-gradient(90deg, ${item.color}, rgba(255,255,255,0.15))`,
                boxShadow: `0 0 18px ${item.glow}`,
              }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{item.focus}</span>
            <span>{item.share}% of current scope</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BranchSalesChart;
