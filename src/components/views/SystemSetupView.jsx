import { Factory, Layers3, ShieldCheck, Waypoints } from 'lucide-react';

/**
 * Renders a lightweight system setup overview for SuperAdmin and Admin roles.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.users Current user directory.
 * @param {number} props.branchCount Number of active branches.
 * @returns {JSX.Element} System setup overview.
 */
function SystemSetupView({ users, branchCount }) {
  const activeAdmins = users.filter((user) => ['SuperAdmin', 'Admin'].includes(user.role)).length;

  return (
    <section className="space-y-5">
      <article className="panel p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-zinc-500">System Setup</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">SuperAdmin governance and operating rules</h3>
            <p className="mt-2 max-w-3xl text-sm leading-5 text-zinc-500">
              Configure branches, role coverage, and the simplified business flow before day-to-day operations begin.
            </p>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            One setup layer for all branches
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <Factory size={16} />
              <p className="text-sm font-medium text-zinc-950">Branches</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">{branchCount}</p>
            <p className="mt-1 text-[13px] text-zinc-500">Operating locations under one system</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <ShieldCheck size={16} />
              <p className="text-sm font-medium text-zinc-950">Admin Accounts</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">{activeAdmins}</p>
            <p className="mt-1 text-[13px] text-zinc-500">SuperAdmin and Admin governance seats</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <Layers3 size={16} />
              <p className="text-sm font-medium text-zinc-950">Pricing Rules</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">2</p>
            <p className="mt-1 text-[13px] text-zinc-500">Retail and wholesale remain global system toggles</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <Waypoints size={16} />
              <p className="text-sm font-medium text-zinc-950">Core Workspaces</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">4</p>
            <p className="mt-1 text-[13px] text-zinc-500">Master data, sales, procurement, and inventory operations</p>
          </div>
        </div>
      </article>

      <article className="panel p-5">
        <div className="border-b border-zinc-200 pb-4">
          <p className="text-[13px] text-zinc-500">Operating Model</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950">Simplified workflow by responsibility</h3>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-950">1. Setup and governance</p>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              SuperAdmin and Admin prepare users, suppliers, customers, products, pricing rules, and visibility settings.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-950">2. Sales operations</p>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Sales teams prepare quotations, confirm customer terms, and convert approved quotes into branch sales.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-950">3. Procurement and receiving</p>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Branch managers raise POs, receive items, flag discrepancies, and monitor supplier payables.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-950">4. Inventory movement</p>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Goods receipts replenish stock first, then transfers balance shortages across Cebu, Bacolod, and Dumaguete.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default SystemSetupView;
