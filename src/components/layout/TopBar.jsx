import { Factory, Filter, Layers3, ShieldCheck } from 'lucide-react';
import { branches, pricingTiers } from '../../data/mockData';
import { formatBranchLabel, formatPricingTierLabel } from '../../utils/format';

/**
 * Renders the persistent top bar with global operational filters.
 *
 * @param {object} props Component props.
 * @param {string} props.selectedBranch Active branch filter.
 * @param {string} props.pricingTier Active pricing tier filter.
 * @param {(branch: string) => void} props.onBranchChange Updates the branch filter.
 * @param {(tier: string) => void} props.onPricingTierChange Updates the pricing tier.
 * @param {object|null} props.activeBranchProfile Active branch profile record.
 * @param {Array<object>} props.users User directory for the RBAC demo selector.
 * @param {string} props.currentUserId Active simulated signed-in user.
 * @param {(userId: string) => void} props.onCurrentUserChange Updates the simulated signed-in user.
 * @param {object|null} props.currentUser Active simulated signed-in user.
 * @returns {JSX.Element} Top bar section.
 */
function TopBar({
  selectedBranch,
  pricingTier,
  onBranchChange,
  onPricingTierChange,
  activeBranchProfile,
  users,
  currentUserId,
  onCurrentUserChange,
  currentUser,
}) {
  return (
    <header className="panel p-3.5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
        <div className="min-w-0">
          <div className="flex items-start gap-2.5">
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-2.5 text-brand-700">
              <Factory size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">RJO Industrial Products</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <h2 className="text-lg font-semibold text-zinc-950">Operations System</h2>
                <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                  {formatBranchLabel(selectedBranch)}
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                  {formatPricingTierLabel(pricingTier)}
                </span>
              </div>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-zinc-600">
                {activeBranchProfile
                  ? `${activeBranchProfile.city} branch workspace overview.`
                  : 'Multi-branch setup, sales, procurement, and inventory control.'}
              </p>
            </div>
          </div>
        </div>

        {currentUser ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700">
            <p className="font-medium leading-5 text-zinc-950">{currentUser.role}</p>
            <p className="mt-0.5 text-[12px] leading-4.5 text-zinc-500">
              Role-based access to setup, sales, procurement, and inventory.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2 xl:flex-row xl:flex-wrap">
        <label className="panel-muted flex min-h-[46px] min-w-[240px] flex-1 items-center gap-2 px-3 py-2 text-sm">
          <ShieldCheck size={15} className="text-zinc-500" />
          <span className="text-zinc-500">Viewing As</span>
          <select
            className="min-w-0 flex-1 bg-transparent text-[13px] text-zinc-900 outline-none"
            value={currentUserId}
            onChange={(event) => onCurrentUserChange(event.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id} className="bg-white text-zinc-900">
                {user.name} · {user.role}
              </option>
            ))}
          </select>
        </label>

        <label className="panel-muted flex min-h-[46px] min-w-[210px] items-center gap-2 px-3 py-2 text-sm">
          <Filter size={15} className="text-zinc-500" />
          <span className="text-zinc-500">Branch</span>
          <select
            className="min-w-0 flex-1 bg-transparent text-[13px] text-zinc-900 outline-none"
            value={selectedBranch}
            onChange={(event) => onBranchChange(event.target.value)}
          >
            {branches.map((branch) => (
              <option key={branch.value} value={branch.value} className="bg-white text-zinc-900">
                {branch.label}
              </option>
            ))}
          </select>
        </label>

        <div className="panel-muted flex min-h-[46px] flex-wrap items-center gap-1 p-1">
          <div className="flex items-center gap-2 px-2 text-sm text-zinc-500">
            <Layers3 size={15} />
            <span>Pricing</span>
          </div>

          {pricingTiers.map((tier) => {
            const isActive = tier.value === pricingTier;

            return (
              <button
                key={tier.value}
                type="button"
                onClick={() => onPricingTierChange(tier.value)}
                className={`pill-button ${
                  isActive
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-transparent bg-transparent text-zinc-700 hover:border-zinc-200 hover:bg-white'
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
