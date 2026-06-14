import { ArrowRightLeft, Boxes, PackageCheck } from 'lucide-react';
import InventoryView from './InventoryView';
import { formatBranchLabel } from '../../utils/format';

const TABS = [
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'transfers', label: 'Stock Transfers', icon: ArrowRightLeft },
];

const TRANSFER_STATUS_STYLES = {
  'For dispatch': 'border-brand-200 bg-brand-50 text-brand-700',
  'Awaiting approval': 'border-amber-200 bg-amber-50 text-amber-700',
  'Picking in progress': 'border-sky-200 bg-sky-50 text-sky-700',
};

/**
 * Renders the grouped inventory workspace with stock and transfer operations.
 *
 * @param {object} props Component props.
 * @param {string} props.activeTab Active inventory operations tab.
 * @param {(tab: string) => void} props.onTabChange Updates the active inventory operations tab.
 * @param {Array<object>} props.products Visible inventory records.
 * @param {string} props.pricingTier Active pricing tier.
 * @param {string} props.searchTerm Inventory search term.
 * @param {(value: string) => void} props.onSearchChange Updates inventory search term.
 * @param {boolean} props.isAddModalOpen Controls the add product modal.
 * @param {() => void} props.onOpenAddModal Opens the add product modal.
 * @param {() => void} props.onCloseAddModal Closes the add product modal.
 * @param {string} props.selectedBranch Active branch filter.
 * @param {Array<object>} props.pendingTransfers Visible pending transfer records.
 * @returns {JSX.Element} Inventory operations workspace.
 */
function InventoryOperationsView({
  activeTab,
  onTabChange,
  products,
  pricingTier,
  searchTerm,
  onSearchChange,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  selectedBranch,
  pendingTransfers,
}) {
  const lowStockCount = products.filter((product) => {
    const stockValue = selectedBranch === 'all'
      ? product.stock.cebu + product.stock.bacolod + product.stock.dumaguete
      : product.stock[selectedBranch];
    return stockValue <= product.reorderLevel;
  }).length;

  const inventoryContent = (
    <InventoryView
      products={products}
      pricingTier={pricingTier}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      isModalOpen={isAddModalOpen}
      onOpenModal={onOpenAddModal}
      onCloseModal={onCloseAddModal}
      selectedBranch={selectedBranch}
      showAddProductAction={false}
      sectionLabel="Inventory Operations"
      sectionTitle="Branch stock control and replenishment visibility"
    />
  );

  const transfersContent = (
    <section className="space-y-5">
      <article className="panel p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-zinc-500">Stock Transfers</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Inter-branch replenishment queue</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              {pendingTransfers.length} requests in scope
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700">
              {lowStockCount} low stock items need balancing
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <ArrowRightLeft size={16} />
              <p className="text-sm font-medium text-zinc-950">Transfer Routing</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Branch managers raise transfers only when another branch can cover an urgent stock shortage.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <PackageCheck size={16} />
              <p className="text-sm font-medium text-zinc-950">Inventory Readiness</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Use transfer requests to preserve branch availability before new procurement is raised.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <Boxes size={16} />
              <p className="text-sm font-medium text-zinc-950">Receiving Link</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Goods receipts replenish branch stock first, then transfers handle remaining shortages.
            </p>
          </div>
        </div>
      </article>

      <article className="panel p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-[13px] text-zinc-500">Transfer Queue</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Pending branch-to-branch movements</h3>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            Current branch scope: {formatBranchLabel(selectedBranch)}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-700">
            <thead>
              <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <th className="pb-3 pr-4">Transfer</th>
                <th className="pb-3 pr-4">From</th>
                <th className="pb-3 pr-4">To</th>
                <th className="pb-3 pr-4">Item</th>
                <th className="pb-3 pr-4">Units</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-b border-zinc-200 last:border-b-0">
                  <td className="py-3 pr-4 text-sm font-medium text-zinc-950">{transfer.id}</td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-500">{formatBranchLabel(transfer.from)}</td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-500">{formatBranchLabel(transfer.to)}</td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-700">{transfer.item}</td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-700">{transfer.units}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        TRANSFER_STATUS_STYLES[transfer.status] ?? 'border-zinc-200 bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      {transfer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );

  return (
    <section className="space-y-5">
      <article className="panel p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-zinc-500">Inventory Operations</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Branch stock, receiving impact, and transfers</h3>
            <p className="mt-2 max-w-3xl text-sm leading-5 text-zinc-500">
              Control on-hand inventory, inspect replenishment results, and move stock between branches from one workspace.
            </p>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            Inventory first, transfer only when needed
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>
      </article>

      {activeTab === 'inventory' ? inventoryContent : transfersContent}
    </section>
  );
}

export default InventoryOperationsView;
