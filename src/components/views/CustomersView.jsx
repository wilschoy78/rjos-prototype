import StatusBadge from '../ui/StatusBadge';
import { formatBranchLabel, formatCurrency } from '../../utils/format';

/**
 * Renders customer account profiles and credit standing information.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.customers Visible customers after filters.
 * @param {string} props.pricingTier Active pricing tier.
 * @returns {JSX.Element} Customer profile view.
 */
function CustomersView({ customers, pricingTier }) {
  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[13px] text-zinc-500">Customer Profiles</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950">Credit limits and account health</h3>
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
          {customers.length} accounts in {pricingTier} scope
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-zinc-700">
          <thead>
            <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Branch</th>
              <th className="pb-3 pr-4">Tier</th>
              <th className="pb-3 pr-4">Outstanding Balance</th>
              <th className="pb-3 pr-4">Credit Limit</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-zinc-200 last:border-b-0">
                <td className="py-3 pr-4 text-sm font-medium text-zinc-950">{customer.name}</td>
                <td className="py-3 pr-4 text-[13px] text-zinc-500">{formatBranchLabel(customer.branch)}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      customer.tier === 'wholesale'
                        ? 'border-brand-200 bg-brand-50 text-brand-700'
                        : 'border-zinc-300 bg-white text-zinc-700'
                    }`}
                  >
                    {customer.tier === 'wholesale' ? 'Wholesale' : 'Retail'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-[13px] text-zinc-700">{formatCurrency(customer.outstandingBalance)}</td>
                <td className="py-3 pr-4 text-[13px] text-zinc-700">{formatCurrency(customer.creditLimit)}</td>
                <td className="py-3">
                  <StatusBadge status={customer.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CustomersView;
