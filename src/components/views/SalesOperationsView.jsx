import { CreditCard, FileText, Users2 } from 'lucide-react';
import CustomersView from './CustomersView';
import PosView from './PosView';
import QuotationsView from './QuotationsView';

const TABS = [
  { id: 'quotations', label: 'Quotations', icon: FileText },
  { id: 'sales', label: 'Sales', icon: CreditCard },
  { id: 'customers', label: 'Customers', icon: Users2 },
];

/**
 * Renders the grouped sales workspace for quotation and transaction processing.
 *
 * @param {object} props Component props.
 * @param {string} props.activeTab Active sales operations tab.
 * @param {(tab: string) => void} props.onTabChange Updates the active sales operations tab.
 * @param {Array<object>} props.products Visible product records.
 * @param {Array<object>} props.customers Visible customer records.
 * @param {Array<object>} props.quoteHistory Quote history records.
 * @param {Array<object>} props.quoteItems Active quote line items.
 * @param {string} props.selectedBranch Active branch filter.
 * @param {string} props.pricingTier Active pricing tier.
 * @param {string} props.quoteNumber Active quote number.
 * @param {string} props.selectedCustomerId Current quote customer identifier.
 * @param {object|null} props.selectedCustomer Current quote customer record.
 * @param {(value: string) => void} props.onCustomerChange Updates the quote customer.
 * @param {number} props.discountPercent Current quote discount percentage.
 * @param {(value: number) => void} props.onDiscountChange Updates the quote discount.
 * @param {string} props.quoteNotes Current quote notes.
 * @param {(value: string) => void} props.onNotesChange Updates quote notes.
 * @param {(product: object) => void} props.onAddToQuote Adds a product to the quote.
 * @param {(id: string, delta: number) => void} props.onUpdateQuoteQuantity Updates quote quantity.
 * @param {(id: string, price: number) => void} props.onUpdateQuotePrice Updates quote price.
 * @param {(id: string) => void} props.onRemoveQuoteItem Removes a quote line.
 * @param {() => void} props.onSaveDraft Saves a quote draft.
 * @param {() => void} props.onGenerateQuotation Generates a quotation.
 * @param {() => void} props.onConvertToSale Converts a quote into a sale.
 * @param {(id: string, status: string) => void} props.onUpdateApprovalStatus Updates quote approval status.
 * @param {(id: string) => void} props.onLoadDraft Loads a draft quote.
 * @param {string} props.quoteMessage Active quote message.
 * @param {Array<object>} props.cart POS cart items.
 * @param {(product: object) => void} props.onAddToCart Adds a product to the cart.
 * @param {(id: string, delta: number) => void} props.onUpdateQuantity Updates cart quantity.
 * @param {string} props.paymentType Active POS payment type.
 * @param {(value: string) => void} props.onPaymentTypeChange Updates POS payment type.
 * @param {() => void} props.onCompleteSale Completes a sale.
 * @param {string} props.successMessage Current POS success message.
 * @returns {JSX.Element} Sales operations workspace.
 */
function SalesOperationsView({
  activeTab,
  onTabChange,
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
  cart,
  onAddToCart,
  onUpdateQuantity,
  paymentType,
  onPaymentTypeChange,
  onCompleteSale,
  successMessage,
}) {
  const tabContent = {
    quotations: (
      <QuotationsView
        products={products}
        customers={customers}
        quoteHistory={quoteHistory}
        quoteItems={quoteItems}
        selectedBranch={selectedBranch}
        pricingTier={pricingTier}
        quoteNumber={quoteNumber}
        selectedCustomerId={selectedCustomerId}
        selectedCustomer={selectedCustomer}
        onCustomerChange={onCustomerChange}
        discountPercent={discountPercent}
        onDiscountChange={onDiscountChange}
        quoteNotes={quoteNotes}
        onNotesChange={onNotesChange}
        onAddToQuote={onAddToQuote}
        onUpdateQuoteQuantity={onUpdateQuoteQuantity}
        onUpdateQuotePrice={onUpdateQuotePrice}
        onRemoveQuoteItem={onRemoveQuoteItem}
        onSaveDraft={onSaveDraft}
        onGenerateQuotation={onGenerateQuotation}
        onConvertToSale={onConvertToSale}
        onUpdateApprovalStatus={onUpdateApprovalStatus}
        onLoadDraft={onLoadDraft}
        quoteMessage={quoteMessage}
      />
    ),
    sales: (
      <PosView
        products={products}
        pricingTier={pricingTier}
        selectedBranch={selectedBranch}
        cart={cart}
        onAddToCart={onAddToCart}
        onUpdateQuantity={onUpdateQuantity}
        paymentType={paymentType}
        onPaymentTypeChange={onPaymentTypeChange}
        onCompleteSale={onCompleteSale}
        successMessage={successMessage}
      />
    ),
    customers: <CustomersView customers={customers} pricingTier={pricingTier} />,
  };

  return (
    <section className="space-y-5">
      <article className="panel p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-zinc-500">Sales Operations</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Branch manager and sales execution workspace</h3>
            <p className="mt-2 max-w-3xl text-sm leading-5 text-zinc-500">
              Move from quotation to customer approval to sale inside one operational area.
            </p>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            Quote, convert, and close sales faster
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

      {tabContent[activeTab]}
    </section>
  );
}

export default SalesOperationsView;
