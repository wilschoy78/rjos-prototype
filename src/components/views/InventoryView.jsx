import { Plus, Search } from 'lucide-react';
import Modal from '../ui/Modal';
import { formatCurrency, getStockForBranch } from '../../utils/format';

/**
 * Renders the inventory table and mock add-product modal interaction.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.products Visible inventory products.
 * @param {string} props.pricingTier Active pricing tier.
 * @param {string} props.searchTerm Inventory search value.
 * @param {(value: string) => void} props.onSearchChange Updates the search term.
 * @param {boolean} props.isModalOpen Controls the add-product modal.
 * @param {() => void} props.onOpenModal Opens the add-product modal.
 * @param {() => void} props.onCloseModal Closes the add-product modal.
 * @param {string} props.selectedBranch Active branch filter.
 * @param {boolean} [props.showAddProductAction] Displays the add product button.
 * @param {string} [props.sectionLabel] Section eyebrow label.
 * @param {string} [props.sectionTitle] Section title.
 * @returns {JSX.Element} Inventory view.
 */
function InventoryView({
  products,
  pricingTier,
  searchTerm,
  onSearchChange,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  selectedBranch,
  showAddProductAction = true,
  sectionLabel = 'Inventory Management',
  sectionTitle = 'Multi-branch parts and materials tracking',
}) {
  return (
    <>
      <section className="panel p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-zinc-500">{sectionLabel}</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">{sectionTitle}</h3>
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <label className="panel-muted flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-500">
              <Search size={16} />
              <input
                type="text"
                className="bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400"
                placeholder="Search by product, SKU, or category"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </label>

            {showAddProductAction ? (
              <button
                type="button"
                onClick={onOpenModal}
                className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                <Plus size={16} />
                Add Product
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-700">
            <thead>
              <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">SKU</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Cebu</th>
                <th className="pb-3 pr-4">Bacolod</th>
                <th className="pb-3 pr-4">Dumaguete</th>
                <th className="pb-3 pr-4">Visible Stock</th>
                <th className="pb-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const visibleStock = getStockForBranch(product, selectedBranch);
                const isLowStock = visibleStock <= product.reorderLevel;

                return (
                  <tr key={product.id} className="border-b border-zinc-200 last:border-b-0">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-950">{product.name}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{product.unit} unit</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-zinc-500">{product.sku}</td>
                    <td className="py-3 pr-4 text-[13px] text-zinc-500">{product.category}</td>
                    <td className="py-3 pr-4 text-[13px]">{product.stock.cebu}</td>
                    <td className="py-3 pr-4 text-[13px]">{product.stock.bacolod}</td>
                    <td className="py-3 pr-4 text-[13px]">{product.stock.dumaguete}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                          isLowStock
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        {visibleStock} units
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-zinc-950">{formatCurrency(product.price[pricingTier])}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <Modal
          title="Add Product"
          description="Mock modal for the client presentation. In production, this would capture new product metadata, branch allocations, and pricing tier rules."
          onClose={onCloseModal}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input className="control" placeholder="Product name" />
            <input className="control" placeholder="SKU code" />
            <input className="control" placeholder="Category" />
            <input className="control" placeholder="Unit of measure" />
            <input className="control" placeholder="Retail price" />
            <input className="control" placeholder="Wholesale price" />
          </div>
          <div className="mt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onCloseModal}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCloseModal}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Save Mock Product
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export default InventoryView;
