import { ArrowRightLeft, CheckCheck, FileCheck2, FilePenLine, FileText, Minus, Plus, Printer, ReceiptText, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import { formatBranchLabel, formatCurrency, getStockForBranch } from '../../utils/format';

const QUOTE_STATUS_STYLES = {
  draft: 'border-zinc-200 bg-white text-zinc-700',
  sent: 'border-brand-200 bg-brand-50 text-brand-700',
  converted: 'border-green-200 bg-green-50 text-signal-500',
};

const APPROVAL_STATUS_STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  reviewed: 'border-sky-200 bg-sky-50 text-sky-700',
  approved: 'border-green-200 bg-green-50 text-signal-500',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
};

/**
 * Formats an ISO date string for compact UI display.
 *
 * @param {string} value ISO date string.
 * @returns {string} Human-readable short date.
 */
function formatDateLabel(value) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

/**
 * Renders the quotation builder view with item selection and summary details.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.products Visible products for the active filters.
 * @param {Array<object>} props.customers Visible customer records.
 * @param {Array<object>} props.quoteHistory Historical quotation records.
 * @param {Array<object>} props.quoteItems Active quotation line items.
 * @param {string} props.selectedBranch Active branch key.
 * @param {string} props.pricingTier Active pricing tier.
 * @param {string} props.quoteNumber Active quotation number.
 * @param {string} props.selectedCustomerId Active customer selection.
 * @param {object|null} props.selectedCustomer Current customer selection.
 * @param {(customerId: string) => void} props.onCustomerChange Updates the selected customer.
 * @param {number} props.discountPercent Current quotation discount percentage.
 * @param {(value: number) => void} props.onDiscountChange Updates the quotation discount.
 * @param {string} props.quoteNotes Current quotation notes.
 * @param {(value: string) => void} props.onNotesChange Updates quotation notes.
 * @param {(product: object) => void} props.onAddToQuote Adds a product to the quotation.
 * @param {(id: string, delta: number) => void} props.onUpdateQuoteQuantity Updates a quotation line quantity.
 * @param {(id: string, price: number) => void} props.onUpdateQuotePrice Updates a quotation line price.
 * @param {(id: string) => void} props.onRemoveQuoteItem Removes a quotation line.
 * @param {() => void} props.onSaveDraft Saves the quotation as a draft.
 * @param {() => void} props.onGenerateQuotation Generates the quotation document.
 * @param {() => void} props.onConvertToSale Converts the quotation into a POS sale.
 * @param {(id: string, approvalStatus: 'pending'|'reviewed'|'approved'|'rejected') => void} props.onUpdateApprovalStatus Updates historical approval status.
 * @param {(id: string) => void} props.onLoadDraft Loads a saved draft into the active builder.
 * @param {string} props.quoteMessage Current feedback message.
 * @returns {JSX.Element} Quotation builder view.
 */
function QuotationsView({
  products,
  customers,
  quoteHistory,
  quoteItems,
  selectedBranch,
  pricingTier,
  quoteNumber,
  selectedCustomerId,
  selectedCustomer,
  onCustomerChange,
  discountPercent,
  onDiscountChange,
  quoteNotes,
  onNotesChange,
  onAddToQuote,
  onUpdateQuoteQuantity,
  onUpdateQuotePrice,
  onRemoveQuoteItem,
  onSaveDraft,
  onGenerateQuotation,
  onConvertToSale,
  onUpdateApprovalStatus,
  onLoadDraft,
  quoteMessage,
}) {
  const subtotal = quoteItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const vat = taxableAmount * 0.12;
  const total = taxableAmount + vat;
  const validityDays = selectedCustomer?.quotationValidityDays ?? 15;
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + validityDays);
  const validUntil = validityDate.toISOString().slice(0, 10);
  const paymentTerms = selectedCustomer?.paymentTerms ?? 'Standard Commercial Terms';

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="panel p-5">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[13px] text-zinc-500">Quotation Builder</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Prepare branch-aware customer quotations</h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              {products.length} products in scope
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onAddToQuote(product)}
                className="rounded-2xl border border-zinc-200 bg-white p-3.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-950">{product.name}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">{product.category}</p>
                  </div>
                  <FileText size={16} className="text-brand-600" />
                </div>
                <p className="mt-3 text-base font-semibold text-zinc-950">{formatCurrency(product.price[pricingTier])}</p>
                <p className="mt-1.5 text-[13px] text-zinc-500">
                  {getStockForBranch(product, selectedBranch)} available in {formatBranchLabel(selectedBranch)}
                </p>
              </button>
            ))}
          </div>
        </article>

        <article className="panel p-5">
          <div className="border-b border-zinc-200 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] text-zinc-500">Quotation Summary</p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-950">{quoteNumber}</h3>
              </div>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                Active Draft
              </span>
            </div>
          </div>

          {quoteMessage ? (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-signal-500">
              {quoteMessage}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Customer</label>
              <select
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                value={selectedCustomerId}
                onChange={(event) => onCustomerChange(event.target.value)}
              >
                <option value="">Select customer account</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Branch</p>
                  <p className="mt-1 text-sm font-medium text-zinc-950">
                    {selectedCustomer ? formatBranchLabel(selectedCustomer.branch) : formatBranchLabel(selectedBranch)}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Validity</p>
                  <p className="mt-1 text-sm font-medium text-zinc-950">{validityDays} Calendar Days</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 md:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Payment Terms</p>
                  <p className="mt-1 text-sm font-medium text-zinc-950">{paymentTerms}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-950">Quoted Items</p>
                <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{quoteItems.length} lines</span>
              </div>

              <div className="mt-3 space-y-2.5">
                {quoteItems.length ? (
                  quoteItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-950">{item.name}</p>
                        <p className="mt-0.5 text-[13px] text-zinc-500">{item.unit} basis pricing</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Unit Price</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(event) => onUpdateQuotePrice(item.id, Number(event.target.value))}
                            className="w-32 rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1.5 text-sm text-zinc-900 outline-none"
                          />
                        </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveQuoteItem(item.id)}
                          className="rounded-lg border border-zinc-300 p-1.5 text-zinc-500 transition hover:border-brand-300 hover:text-brand-700"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuoteQuantity(item.id, -1)}
                            className="rounded-lg border border-zinc-300 p-1.5 text-zinc-600 transition hover:border-brand-300 hover:text-brand-700"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="min-w-7 text-center text-sm font-medium text-zinc-950">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuoteQuantity(item.id, 1)}
                            className="rounded-lg border border-zinc-300 p-1.5 text-zinc-600 transition hover:border-brand-300 hover:text-brand-700"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-zinc-950">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
                    Add products from the left panel to start a quotation.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Discount</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={discountPercent}
                      onChange={(event) => onDiscountChange(Number(event.target.value))}
                      className="w-full accent-[#d90404]"
                    />
                    <span className="min-w-12 text-right text-sm font-medium text-zinc-950">{discountPercent}%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Notes</label>
                  <textarea
                    rows="3"
                    value={quoteNotes}
                    onChange={(event) => onNotesChange(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                    placeholder="Delivery lead time, installation scope, or commercial notes"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-sm text-zinc-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>VAT (12%)</span>
                <span>{formatCurrency(vat)}</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-zinc-200 pt-2.5 text-base font-semibold text-zinc-950">
                <span>Total Quote Value</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={onSaveDraft}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                <ReceiptText size={15} />
                Save Draft
              </button>
              <button
                type="button"
                onClick={onGenerateQuotation}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                <FileCheck2 size={15} />
                Generate Quote
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                <Printer size={15} />
                Print Preview
              </button>
              <button
                type="button"
                onClick={onConvertToSale}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:border-brand-300 hover:bg-brand-100"
              >
                <ArrowRightLeft size={15} />
                Convert To Sale
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[13px] text-zinc-500">Print Preview</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Printable quotation layout</h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              Ready for client presentation
            </span>
          </div>

          <div className="mt-4 rounded-[28px] border border-zinc-300 bg-white p-5 shadow-sm">
            <div className="border-b-2 border-brand-600 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-3xl font-black tracking-tight text-brand-600">R.J.O</p>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-700">
                    Industrial Products &amp; Installation Services
                  </p>
                  <p className="mt-2 text-[13px] leading-5 text-zinc-500">
                    {selectedBranch === 'all'
                      ? 'Multi-branch industrial supply quotation'
                      : `${formatBranchLabel(selectedBranch)} commercial quotation`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Quotation No.</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{quoteNumber}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Valid Until</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{formatDateLabel(validUntil)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 md:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Customer</p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">{selectedCustomer?.name ?? 'Select a customer'}</p>
                <p className="mt-1 text-[13px] text-zinc-500">
                  {selectedCustomer ? formatBranchLabel(selectedCustomer.branch) : formatBranchLabel(selectedBranch)}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Prepared By</p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">RJO Sales Operations</p>
                <p className="mt-1 text-[13px] text-zinc-500">Enterprise demo export layout</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Commercial Terms</p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">{paymentTerms}</p>
                <p className="mt-1 text-[13px] text-zinc-500">{validityDays} calendar days validity</p>
              </div>
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-3.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-brand-700">Export Branding</p>
                <p className="mt-1 text-sm font-semibold text-brand-800">PDF-Style Client Proposal Sheet</p>
                <p className="mt-1 text-[13px] text-brand-700">Branded header, commercial terms, totals, and print-ready layout.</p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    <th className="px-3 py-2.5">Item</th>
                    <th className="px-3 py-2.5">Qty</th>
                    <th className="px-3 py-2.5">Unit Price</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.length ? (
                    quoteItems.map((item) => (
                      <tr key={item.id} className="border-t border-zinc-200">
                        <td className="px-3 py-2.5 text-[13px] text-zinc-700">{item.name}</td>
                        <td className="px-3 py-2.5 text-[13px] text-zinc-700">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-[13px] text-zinc-700">{formatCurrency(item.price)}</td>
                        <td className="px-3 py-2.5 text-right text-[13px] font-medium text-zinc-950">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-zinc-200">
                      <td colSpan="4" className="px-3 py-4 text-center text-[13px] text-zinc-500">
                        No quotation items yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Notes</p>
                <p className="mt-1 text-[13px] leading-5 text-zinc-700">{quoteNotes || 'No additional quotation notes.'}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-sm text-zinc-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>VAT</span>
                  <span>{formatCurrency(vat)}</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-zinc-200 pt-2.5 text-base font-semibold text-zinc-950">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[13px] text-zinc-500">Quotation History</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Saved drafts and generated records</h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              {quoteHistory.length} records
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-zinc-700">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  <th className="pb-3 pr-4">Quote No.</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Approval</th>
                  <th className="pb-3 pr-4">Terms</th>
                  <th className="pb-3 pr-4">Valid Until</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quoteHistory.map((record) => (
                  <tr key={record.id} className="border-b border-zinc-200 last:border-b-0">
                    <td className="py-3 pr-4 text-[13px] font-medium text-zinc-950">{record.quoteNumber}</td>
                    <td className="py-3 pr-4">
                      <p className="text-[13px] font-medium text-zinc-950">{record.customerName}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">{formatBranchLabel(record.branch)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                          QUOTE_STATUS_STYLES[record.status]
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                          APPROVAL_STATUS_STYLES[record.approvalStatus]
                        }`}
                      >
                        {record.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-zinc-500">{record.paymentTerms}</td>
                    <td className="py-3 pr-4 text-[13px] text-zinc-500">{formatDateLabel(record.validUntil)}</td>
                    <td className="py-3 pr-4 text-[13px] font-medium text-zinc-950">{formatCurrency(record.total)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {record.status === 'draft' ? (
                          <button
                            type="button"
                            onClick={() => onLoadDraft(record.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 transition hover:border-brand-300 hover:text-brand-700"
                          >
                            <FilePenLine size={12} />
                            Edit
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => onUpdateApprovalStatus(record.id, 'reviewed')}
                          className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 transition hover:bg-sky-100"
                        >
                          <CheckCheck size={12} />
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateApprovalStatus(record.id, 'approved')}
                          className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-medium text-signal-500 transition hover:bg-green-100"
                        >
                          <ShieldCheck size={12} />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateApprovalStatus(record.id, 'rejected')}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          <XCircle size={12} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

export default QuotationsView;
