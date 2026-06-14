import { CheckCircle2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { formatCurrency, getStockForBranch } from '../../utils/format';

/**
 * Renders the interactive point-of-sale terminal with cart logic.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.products Available products for the active filters.
 * @param {string} props.pricingTier Active pricing tier.
 * @param {string} props.selectedBranch Active branch filter.
 * @param {Array<object>} props.cart Cart line items.
 * @param {(product: object) => void} props.onAddToCart Adds a product to the cart.
 * @param {(id: string, delta: number) => void} props.onUpdateQuantity Updates a cart quantity.
 * @param {string} props.paymentType Active payment type.
 * @param {(paymentType: string) => void} props.onPaymentTypeChange Updates payment type.
 * @param {() => void} props.onCompleteSale Completes the sale flow.
 * @param {string} props.successMessage Current success message.
 * @returns {JSX.Element} POS terminal view.
 */
function PosView({
  products,
  pricingTier,
  selectedBranch,
  cart,
  onAddToCart,
  onUpdateQuantity,
  paymentType,
  onPaymentTypeChange,
  onCompleteSale,
  successMessage,
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.12;
  const total = subtotal + vat;

  return (
    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="panel p-5">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-[13px] text-zinc-500">Point of Sale</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Branch counter terminal</h3>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            {products.length} SKUs available
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onAddToCart(product)}
              className="rounded-2xl border border-zinc-200 bg-white p-3.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-950">{product.name}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">{product.category}</p>
                </div>
                <ShoppingCart size={16} className="text-brand-600" />
              </div>
              <p className="mt-3 text-base font-semibold text-zinc-950">{formatCurrency(product.price[pricingTier])}</p>
              <p className="mt-1.5 text-[13px] text-zinc-500">
                {getStockForBranch(product, selectedBranch)} available in scope
              </p>
            </button>
          ))}
        </div>
      </article>

      <article className="panel p-5">
        <div className="border-b border-zinc-200 pb-4">
          <p className="text-[13px] text-zinc-500">Transaction Cart</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950">Live totals and payment type</h3>
        </div>

        {successMessage ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-signal-500">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <div className="mt-4 space-y-2.5">
          {cart.length ? (
            cart.map((item) => (
              <div key={item.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-950">{item.name}</p>
                    <p className="mt-0.5 text-[13px] text-zinc-500">{formatCurrency(item.price)} each</p>
                  </div>
                  <p className="text-sm font-medium text-zinc-950">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="rounded-lg border border-zinc-300 p-1.5 text-zinc-600 transition hover:border-brand-300 hover:text-brand-700"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="min-w-7 text-center text-sm font-medium text-zinc-950">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="rounded-lg border border-zinc-300 p-1.5 text-zinc-600 transition hover:border-brand-300 hover:text-brand-700"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-500">{item.unit}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
              Add industrial items from the left panel to start a sale.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
          <p className="text-sm font-medium text-zinc-950">Payment Type</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {['cash', 'charge'].map((type) => {
              const isActive = paymentType === type;
              const label = type === 'cash' ? 'Cash' : 'Charge (30-Day Credit Line)';

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onPaymentTypeChange(type)}
                  className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'border-brand-300 bg-brand-50 text-brand-700'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-sm text-zinc-700">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>VAT (12%)</span>
            <span>{formatCurrency(vat)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 pt-2.5 text-base font-semibold text-zinc-950">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCompleteSale}
          className="mt-4 w-full rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Complete Sale
        </button>
      </article>
    </section>
  );
}

export default PosView;
