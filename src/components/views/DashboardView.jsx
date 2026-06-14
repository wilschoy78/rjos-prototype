import {
  AlertTriangle,
  Boxes,
  PhilippinePeso,
  RefreshCcw,
  WalletCards,
} from 'lucide-react';
import MetricCard from '../ui/MetricCard';
import TrendChart from '../ui/TrendChart';
import BranchSalesChart from '../ui/BranchSalesChart';
import { formatBranchLabel, formatCurrency, formatPricingTierLabel } from '../../utils/format';

/**
 * Shows the executive dashboard with KPIs and activity context.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.recentActivity Filtered activity records.
 * @param {Array<object>} props.kpis Metric definitions.
 * @param {string} props.selectedBranch Active branch key.
 * @param {string} props.pricingTier Active pricing tier key.
 * @param {string[]} props.trendLabels Dashboard trend labels.
 * @param {number[]} props.trendSeries Dashboard trend series.
 * @param {Array<object>} props.branchPerformance Branch comparison records.
 * @param {object|null} props.activeBranchProfile Current branch profile.
 * @returns {JSX.Element} Dashboard view.
 */
function DashboardView({
  recentActivity,
  kpis,
  selectedBranch,
  pricingTier,
  trendLabels,
  trendSeries,
  branchPerformance,
  activeBranchProfile,
}) {
  const iconMap = {
    sales: PhilippinePeso,
    lowStock: AlertTriangle,
    accounts: WalletCards,
    transfers: RefreshCcw,
  };

  const totalWeeklySales = branchPerformance.reduce((sum, branch) => sum + branch.weeklyTotal, 0);
  const chartColor = activeBranchProfile?.color ?? '#d90404';

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric) => (
          <MetricCard
            key={metric.id}
            icon={iconMap[metric.id] ?? Boxes}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="panel p-5">
          <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[13px] text-zinc-500">Sales Trend</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">7-day commercial momentum</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-700">
                {formatBranchLabel(selectedBranch)}
              </span>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] text-brand-700">
                {formatPricingTierLabel(pricingTier)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div>
              <TrendChart labels={trendLabels} values={trendSeries} color={chartColor} />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Weekly Sales Scope</p>
                <p className="mt-2 text-xl font-semibold text-zinc-950">{formatCurrency(totalWeeklySales)}</p>
                <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">
                  Aggregated from branch trading activity and presentation scenario assumptions.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Active Branch Story</p>
                <p className="mt-2 text-base font-semibold text-zinc-950">
                  {activeBranchProfile ? activeBranchProfile.focus : 'Multi-branch network balance'}
                </p>
                <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">
                  {activeBranchProfile
                    ? `${activeBranchProfile.city} coverage led by ${activeBranchProfile.manager}.`
                    : 'Use the branch selector to spotlight Cebu, Bacolod, or Dumaguete-specific performance.'}
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="panel p-5">
          <div className="border-b border-zinc-200 pb-4">
            <p className="text-[13px] text-zinc-500">Branch Revenue Mix</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Today&apos;s branch contribution</h3>
          </div>
          <div className="mt-4">
            <BranchSalesChart data={branchPerformance} />
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
        <article className="panel p-5">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[13px] text-zinc-500">Recent Activity Feed</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Live multi-branch operational timeline</h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-700">
              {recentActivity.length} activities in scope
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-600 shadow-[0_0_12px_rgba(217,4,4,0.22)]" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-zinc-950">{activity.title}</p>
                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-500">
                      {formatBranchLabel(activity.branch)}
                    </span>
                    <span className="rounded-full border border-signal-500/20 bg-green-50 px-2 py-1 text-[10px] uppercase tracking-wide text-signal-500">
                      {formatPricingTierLabel(activity.tier)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">{activity.description}</p>
                </div>
                <p className="text-[11px] text-zinc-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-5">
          <p className="text-[13px] text-zinc-500">System Highlights</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950">Why this demo matters</h3>

          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <p className="font-medium text-zinc-950">Operational visibility</p>
              <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">
                Branch heads see synchronized sales, low stock risks, and pending transfers in one dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <p className="font-medium text-zinc-950">Pricing consistency</p>
              <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">
                Switching between retail and wholesale instantly updates analytics, inventory pricing, POS, and credit profiles.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <p className="font-medium text-zinc-950">Branch-aware workflows</p>
              <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">
                The current demo context is set to {formatBranchLabel(selectedBranch)} under {formatPricingTierLabel(pricingTier)}.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default DashboardView;
