import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, ClipboardCheck, FilePlus2, ShoppingCart, Truck } from 'lucide-react';
import Modal from '../ui/Modal';
import { branches } from '../../data/mockData';
import { formatBranchLabel, formatCurrency, formatPricingTierLabel } from '../../utils/format';

const PO_STATUS_STYLES = {
  draft: 'border-zinc-200 bg-white text-zinc-700',
  'for-approval': 'border-amber-200 bg-amber-50 text-amber-700',
  released: 'border-brand-200 bg-brand-50 text-brand-700',
  partial: 'border-sky-200 bg-sky-50 text-sky-700',
  received: 'border-green-200 bg-green-50 text-signal-500',
};

/**
 * Builds a mock purchase order number for the selected branch.
 *
 * @param {string} branch Branch identifier.
 * @param {number} sequence Running sequence number.
 * @returns {string} Formatted purchase order number.
 */
function buildPurchaseOrderNumber(branch, sequence) {
  const branchCode = branch === 'all' ? 'ALL' : branch.toUpperCase();
  return `PO-${branchCode}-2026-${String(sequence).padStart(3, '0')}`;
}

/**
 * Resolves the next purchase order status for demo approval actions.
 *
 * @param {string} status Current purchase order status.
 * @returns {string} Next purchase order status.
 */
function getNextPurchaseOrderStatus(status) {
  if (status === 'draft') {
    return 'for-approval';
  }

  if (status === 'for-approval') {
    return 'released';
  }

  return status;
}

/**
 * Resolves the action label for the next purchase order status step.
 *
 * @param {string} status Current purchase order status.
 * @returns {string|null} Action button label.
 */
function getPurchaseOrderActionLabel(status) {
  if (status === 'draft') {
    return 'Submit';
  }

  if (status === 'for-approval') {
    return 'Approve';
  }

  if (status === 'released' || status === 'partial') {
    return 'Receive';
  }

  return null;
}

/**
 * Formats progress text for ordered versus received quantities.
 *
 * @param {Array<object>} items Purchase order line items.
 * @returns {string} Receipt progress summary.
 */
function formatReceiptProgress(items) {
  const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceived = items.reduce((sum, item) => sum + (item.receivedQuantity ?? 0), 0);
  return `${totalReceived} / ${totalOrdered} units`;
}

/**
 * Calculates the received value posted against a purchase order.
 *
 * @param {object} order Purchase order record.
 * @returns {number} Received value.
 */
function getReceivedValue(order) {
  return order.items.reduce((sum, item) => sum + (item.receivedQuantity ?? 0) * item.unitCost, 0);
}

/**
 * Calculates the outstanding payable value for a purchase order.
 *
 * @param {object} order Purchase order record.
 * @returns {number} Outstanding payable amount.
 */
function getOutstandingPayable(order) {
  return Math.max(getReceivedValue(order) - (order.paidAmount ?? 0), 0);
}

/**
 * Determines whether a purchase order still has a receiving discrepancy.
 *
 * @param {object} order Purchase order record.
 * @returns {boolean} True when a discrepancy flag or remaining quantity exists.
 */
function hasReceivingDiscrepancy(order) {
  const hasReceiptFlag = (order.receipts ?? []).some((receipt) => receipt.discrepancyType && receipt.discrepancyType !== 'none');
  const hasRemainingItems = order.items.some((item) => (item.receivedQuantity ?? 0) < item.quantity);
  return hasReceiptFlag || hasRemainingItems;
}

/**
 * Renders the procurement purchase order module with local demo workflows.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.purchaseOrders Visible purchase orders.
 * @param {Array<object>} props.suppliers Visible suppliers for the active scope.
 * @param {Array<object>} props.products Visible inventory products for line selection.
 * @param {string} props.selectedBranch Active branch filter.
 * @param {string} props.pricingTier Active pricing tier.
 * @param {number} props.sequenceBase Global purchase order sequence base.
 * @param {object|null} props.currentUser Active simulated signed-in user.
 * @param {boolean} props.canManageProcurement Determines whether procurement actions are enabled.
 * @param {(payload: object) => void} props.onCreatePurchaseOrder Creates a new mock purchase order.
 * @param {(id: string, status: string) => void} props.onUpdatePurchaseOrderStatus Updates a purchase order lifecycle status.
 * @param {(id: string, receiptPayload: object) => void} props.onReceivePurchaseOrder Posts goods receipts against a purchase order.
 * @returns {JSX.Element} Procurement module.
 */
function ProcurementView({
  purchaseOrders,
  suppliers,
  products,
  selectedBranch,
  pricingTier,
  sequenceBase,
  currentUser,
  canManageProcurement,
  onCreatePurchaseOrder,
  onUpdatePurchaseOrderStatus,
  onReceivePurchaseOrder,
}) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(purchaseOrders[0]?.id ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    supplierId: suppliers[0]?.id ?? '',
    branch: selectedBranch === 'all' ? suppliers[0]?.branch ?? 'cebu' : selectedBranch,
    paymentTerms: suppliers[0]?.paymentTerms ?? '30 Days',
    eta: '2026-06-20',
    requestedBy: 'System Admin',
    items: [
      {
        productId: products[0]?.id ?? '',
        quantity: 1,
        unitCost: products[0] ? Number((products[0].price.wholesale * 0.92).toFixed(2)) : 0,
      },
      {
        productId: products[1]?.id ?? '',
        quantity: 1,
        unitCost: products[1] ? Number((products[1].price.wholesale * 0.92).toFixed(2)) : 0,
      },
    ],
  });
  const [receiptForm, setReceiptForm] = useState({
    receivedAt: '2026-06-14',
    receivedBy: currentUser?.name ?? 'System Admin',
    notes: 'Goods received, counted, and staged for branch allocation.',
    discrepancyType: 'none',
    discrepancyNotes: '',
    items: [],
  });

  useEffect(() => {
    if (!purchaseOrders.length) {
      setSelectedPurchaseOrderId(null);
      return;
    }

    const isCurrentSelectionVisible = purchaseOrders.some((order) => order.id === selectedPurchaseOrderId);
    if (!isCurrentSelectionVisible) {
      setSelectedPurchaseOrderId(purchaseOrders[0].id);
    }
  }, [purchaseOrders, selectedPurchaseOrderId]);

  useEffect(() => {
    setFormValues((current) => {
      const nextSupplier = suppliers.find((supplier) => supplier.id === current.supplierId) ?? suppliers[0];
      const nextBranch = selectedBranch === 'all' ? nextSupplier?.branch ?? current.branch : selectedBranch;
      const nextProducts = products.length ? products : [];

      return {
        ...current,
        supplierId: nextSupplier?.id ?? '',
        branch: nextBranch,
        paymentTerms: nextSupplier?.paymentTerms ?? current.paymentTerms,
        items: current.items.map((item, index) => {
          const fallbackProduct = nextProducts[index] ?? nextProducts[0];
          const resolvedProduct =
            nextProducts.find((product) => product.id === item.productId) ?? fallbackProduct ?? null;

          return {
            ...item,
            productId: resolvedProduct?.id ?? '',
            unitCost:
              item.unitCost > 0
                ? item.unitCost
                : resolvedProduct
                  ? Number((resolvedProduct.price.wholesale * 0.92).toFixed(2))
                  : 0,
          };
        }),
      };
    });
  }, [products, selectedBranch, suppliers]);

  const procurementSummary = useMemo(() => {
    const productLookup = new Map(products.map((product) => [product.id, product]));

    return purchaseOrders.reduce(
      (summary, order) => {
        const isOpen = order.status !== 'received';
        const etaDate = new Date(order.eta);
        const dayDiff = Math.ceil((etaDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const projectedSalesValue = order.items.reduce((sum, item) => {
          const product = productLookup.get(item.id);
          return sum + (product?.price[pricingTier] ?? 0) * item.quantity;
        }, 0);

        return {
          openOrders: summary.openOrders + (isOpen ? 1 : 0),
          forApproval: summary.forApproval + (order.status === 'for-approval' ? 1 : 0),
          dueArrivals: summary.dueArrivals + (dayDiff <= 3 ? 1 : 0),
          openCommitment: summary.openCommitment + (isOpen ? order.total : 0),
          projectedSalesValue: summary.projectedSalesValue + projectedSalesValue,
          openPayables: summary.openPayables + getOutstandingPayable(order),
        };
      },
      {
        openOrders: 0,
        forApproval: 0,
        dueArrivals: 0,
        openCommitment: 0,
        projectedSalesValue: 0,
        openPayables: 0,
      },
    );
  }, [pricingTier, products, purchaseOrders]);
  const discrepancySummary = useMemo(
    () =>
      branches
        .filter((branch) => branch.value !== 'all')
        .map((branch) => ({
          branch: branch.value,
          label: branch.label,
          flaggedOrders: purchaseOrders.filter(
            (order) => order.branch === branch.value && hasReceivingDiscrepancy(order),
          ).length,
        })),
    [purchaseOrders],
  );

  const selectedPurchaseOrder =
    purchaseOrders.find((order) => order.id === selectedPurchaseOrderId) ?? purchaseOrders[0] ?? null;

  const draftTotal = formValues.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const receiptProgress = selectedPurchaseOrder ? formatReceiptProgress(selectedPurchaseOrder.items) : '0 / 0 units';

  /**
   * Opens the create purchase order modal with branch-aware defaults.
   */
  function handleOpenModal() {
    const defaultSupplier = suppliers[0] ?? null;
    const fallbackProducts = products.slice(0, 2);

    setFormValues({
      supplierId: defaultSupplier?.id ?? '',
      branch: selectedBranch === 'all' ? defaultSupplier?.branch ?? 'cebu' : selectedBranch,
      paymentTerms: defaultSupplier?.paymentTerms ?? '30 Days',
      eta: '2026-06-20',
      requestedBy: currentUser?.name ?? 'System Admin',
      items: fallbackProducts.map((product) => ({
        productId: product.id,
        quantity: 1,
        unitCost: Number((product.price.wholesale * 0.92).toFixed(2)),
      })),
    });
    setIsModalOpen(true);
  }

  /**
   * Opens the receiving modal with remaining quantities for the selected purchase order.
   *
   * @param {object} order Purchase order record.
   */
  function handleOpenReceivingModal(order) {
    setSelectedPurchaseOrderId(order.id);
    setReceiptForm({
      receivedAt: '2026-06-14',
      receivedBy: currentUser?.name ?? 'System Admin',
      notes: 'Goods received, counted, and staged for branch allocation.',
      discrepancyType: 'none',
      discrepancyNotes: '',
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        remainingQuantity: item.quantity - (item.receivedQuantity ?? 0),
        receivedQuantity: Math.max(item.quantity - (item.receivedQuantity ?? 0), 0),
      })),
    });
    setIsReceivingModalOpen(true);
  }

  /**
   * Syncs dependent supplier fields when the selected supplier changes.
   *
   * @param {string} supplierId Selected supplier identifier.
   */
  function handleSupplierChange(supplierId) {
    const supplier = suppliers.find((entry) => entry.id === supplierId);
    if (!supplier) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      supplierId,
      branch: selectedBranch === 'all' ? supplier.branch : current.branch,
      paymentTerms: supplier.paymentTerms,
    }));
  }

  /**
   * Updates one line item inside the mock purchase order form.
   *
   * @param {number} index Line index.
   * @param {string} field Field name.
   * @param {string|number} value Field value.
   */
  function handleItemChange(index, field, value) {
    setFormValues((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (field === 'productId') {
          const product = products.find((entry) => entry.id === value);
          return {
            ...item,
            productId: value,
            unitCost: product ? Number((product.price.wholesale * 0.92).toFixed(2)) : item.unitCost,
          };
        }

        return {
          ...item,
          [field]: field === 'quantity' || field === 'unitCost' ? Number(value) : value,
        };
      }),
    }));
  }

  /**
   * Saves a new purchase order into the shared demo state.
   */
  function handleCreatePurchaseOrder() {
    const supplier = suppliers.find((entry) => entry.id === formValues.supplierId);
    const items = formValues.items
      .filter((item) => item.productId && item.quantity > 0 && item.unitCost > 0)
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return {
          id: item.productId,
          name: product?.name ?? 'Unknown Item',
          quantity: item.quantity,
          unit: product?.unit ?? 'unit',
          unitCost: item.unitCost,
        };
      });

    if (!supplier || !items.length) {
      return;
    }

    onCreatePurchaseOrder({
      poNumber: buildPurchaseOrderNumber(formValues.branch, sequenceBase),
      supplierId: supplier.id,
      supplierName: supplier.name,
      branch: formValues.branch,
      status: 'draft',
      requestedBy: formValues.requestedBy,
      paymentTerms: formValues.paymentTerms,
      eta: formValues.eta,
      receipts: [],
      total: items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
      items: items.map((item) => ({ ...item, receivedQuantity: 0 })),
    });
    setIsModalOpen(false);
  }

  /**
   * Updates a receipt line quantity inside the goods receipt form.
   *
   * @param {string} id Product identifier.
   * @param {number} quantity Quantity received in this transaction.
   */
  function handleReceiptQuantityChange(id, quantity) {
    setReceiptForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id
          ? { ...item, receivedQuantity: Math.max(0, Math.min(item.remainingQuantity, Number(quantity))) }
          : item,
      ),
    }));
  }

  /**
   * Submits the goods receipt for the selected purchase order.
   */
  function handleSaveReceipt() {
    if (!selectedPurchaseOrder) {
      return;
    }

    onReceivePurchaseOrder(selectedPurchaseOrder.id, {
      receivedAt: receiptForm.receivedAt,
      receivedBy: receiptForm.receivedBy,
      notes: receiptForm.notes,
      discrepancyType: receiptForm.discrepancyType,
      discrepancyNotes: receiptForm.discrepancyNotes,
      items: receiptForm.items.map((item) => ({
        id: item.id,
        receivedQuantity: item.receivedQuantity,
      })),
    });
    setIsReceivingModalOpen(false);
  }

  return (
    <>
      <section className="space-y-5">
        <article className="panel p-5">
          <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[13px] text-zinc-500">Procurement Purchase Orders</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Branch replenishment approvals and supplier commitments</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
                {purchaseOrders.length} purchase orders in scope
              </span>
              <button
                type="button"
                onClick={handleOpenModal}
                disabled={!canManageProcurement || !suppliers.length || !products.length}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition ${
                  !canManageProcurement || !suppliers.length || !products.length
                    ? 'cursor-not-allowed bg-zinc-300'
                    : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                <FilePlus2 size={15} />
                Create PO
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="flex items-center gap-2 text-brand-700">
                <ShoppingCart size={16} />
                <p className="text-sm font-medium text-zinc-950">Open Orders</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{procurementSummary.openOrders}</p>
              <p className="mt-1 text-[13px] text-zinc-500">Drafts, approvals, and released vendor commitments</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="flex items-center gap-2 text-brand-700">
                <BadgeCheck size={16} />
                <p className="text-sm font-medium text-zinc-950">For Approval</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{procurementSummary.forApproval}</p>
              <p className="mt-1 text-[13px] text-zinc-500">Awaiting management or procurement sign-off</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="flex items-center gap-2 text-brand-700">
                <Truck size={16} />
                <p className="text-sm font-medium text-zinc-950">Due Arrivals</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{procurementSummary.dueArrivals}</p>
              <p className="mt-1 text-[13px] text-zinc-500">Orders expected in the next three calendar days</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="flex items-center gap-2 text-brand-700">
                <ClipboardCheck size={16} />
                <p className="text-sm font-medium text-zinc-950">Projected {formatPricingTierLabel(pricingTier)}</p>
              </div>
              <p className="mt-3 text-xl font-semibold text-zinc-950">
                {formatCurrency(procurementSummary.projectedSalesValue)}
              </p>
              <p className="mt-1 text-[13px] text-zinc-500">Current tier reference value for all visible PO quantities</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="flex items-center gap-2 text-brand-700">
                <BadgeCheck size={16} />
                <p className="text-sm font-medium text-zinc-950">Open Payables</p>
              </div>
              <p className="mt-3 text-xl font-semibold text-zinc-950">{formatCurrency(procurementSummary.openPayables)}</p>
              <p className="mt-1 text-[13px] text-zinc-500">Received vendor value still awaiting settlement</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {discrepancySummary.map((entry) => (
              <div key={entry.branch} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{entry.label}</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-950">{entry.flaggedOrders}</p>
                <p className="mt-1 text-[13px] text-zinc-500">Receiving issues or incomplete PO receipts</p>
              </div>
            ))}
          </div>
        </article>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="panel p-5">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
              <div>
                <p className="text-[13px] text-zinc-500">Purchase Order Register</p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-950">Branch-scope procurement queue</h3>
              </div>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
                Open commitment {formatCurrency(procurementSummary.openCommitment)}
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-zinc-700">
                <thead>
                  <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    <th className="pb-3 pr-4">PO</th>
                    <th className="pb-3 pr-4">Supplier</th>
                    <th className="pb-3 pr-4">Branch</th>
                    <th className="pb-3 pr-4">Requested By</th>
                    <th className="pb-3 pr-4">ETA</th>
                    <th className="pb-3 pr-4">Total</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((order) => {
                    const actionLabel = getPurchaseOrderActionLabel(order.status);
                    const isSelected = selectedPurchaseOrderId === order.id;

                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-zinc-200 last:border-b-0 ${isSelected ? 'bg-brand-50/40' : ''}`}
                      >
                        <td className="py-3 pr-4">
                          <button
                            type="button"
                            onClick={() => setSelectedPurchaseOrderId(order.id)}
                            className="text-left transition hover:text-brand-700"
                          >
                            <p className="text-sm font-medium text-zinc-950">{order.poNumber}</p>
                            <p className="mt-0.5 text-[11px] text-zinc-500">{order.items.length} line items</p>
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-[13px] text-zinc-700">{order.supplierName}</td>
                        <td className="py-3 pr-4 text-[13px] text-zinc-500">{formatBranchLabel(order.branch)}</td>
                        <td className="py-3 pr-4 text-[13px] text-zinc-500">{order.requestedBy}</td>
                        <td className="py-3 pr-4 text-[13px] text-zinc-500">{order.eta}</td>
                        <td className="py-3 pr-4 text-[13px] font-medium text-zinc-950">{formatCurrency(order.total)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                              PO_STATUS_STYLES[order.status]
                            }`}
                          >
                            {order.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-3">
                          {actionLabel ? (
                            order.status === 'released' || order.status === 'partial' ? (
                              <button
                                type="button"
                                disabled={!canManageProcurement}
                                onClick={() => handleOpenReceivingModal(order)}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                  canManageProcurement
                                    ? 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:text-brand-700'
                                    : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                                }`}
                              >
                                {actionLabel}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!canManageProcurement}
                                onClick={() => onUpdatePurchaseOrderStatus(order.id, getNextPurchaseOrderStatus(order.status))}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                  canManageProcurement
                                    ? 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:text-brand-700'
                                    : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                                }`}
                              >
                                {actionLabel}
                              </button>
                            )
                          ) : (
                            <span className="text-[12px] text-zinc-400">Complete</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel p-5">
            <div className="border-b border-zinc-200 pb-4">
              <p className="text-[13px] text-zinc-500">Purchase Order Detail</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                {selectedPurchaseOrder?.poNumber ?? 'No purchase order selected'}
              </h3>
            </div>

            {selectedPurchaseOrder ? (
              <div className="mt-4 space-y-3.5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Supplier</p>
                    <p className="mt-1 text-sm font-medium text-zinc-950">{selectedPurchaseOrder.supplierName}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Branch</p>
                    <p className="mt-1 text-sm font-medium text-zinc-950">
                      {formatBranchLabel(selectedPurchaseOrder.branch)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Payment Terms</p>
                    <p className="mt-1 text-sm font-medium text-zinc-950">{selectedPurchaseOrder.paymentTerms}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">ETA</p>
                    <p className="mt-1 text-sm font-medium text-zinc-950">{selectedPurchaseOrder.eta}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 md:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Receipt Progress</p>
                    <p className="mt-1 text-sm font-medium text-zinc-950">{receiptProgress}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Received Value</p>
                    <p className="mt-1 text-sm font-medium text-zinc-950">
                      {formatCurrency(getReceivedValue(selectedPurchaseOrder))}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Outstanding Payable</p>
                    <p className="mt-1 text-sm font-medium text-zinc-950">
                      {formatCurrency(getOutstandingPayable(selectedPurchaseOrder))}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-950">Ordered Items</p>
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-700">
                      {selectedPurchaseOrder.items.length} lines
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {selectedPurchaseOrder.items.map((item) => (
                      <div key={`${selectedPurchaseOrder.id}-${item.id}`} className="rounded-2xl border border-zinc-200 bg-white p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-zinc-950">{item.name}</p>
                            <p className="mt-0.5 text-[13px] text-zinc-500">
                              {item.quantity} {item.unit} x {formatCurrency(item.unitCost)}
                            </p>
                            <p className="mt-1 text-[12px] text-zinc-400">
                              Received {item.receivedQuantity ?? 0} of {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-zinc-950">
                            {formatCurrency(item.quantity * item.unitCost)}
                          </p>
                        </div>
                        {(item.receivedQuantity ?? 0) < item.quantity ? (
                          <div className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                            Pending discrepancy: {item.quantity - (item.receivedQuantity ?? 0)} units not yet received
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-950">Goods Receipts</p>
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-700">
                      {selectedPurchaseOrder.receipts?.length ?? 0} entries
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {selectedPurchaseOrder.receipts?.length ? (
                      selectedPurchaseOrder.receipts.map((receipt) => (
                        <div key={receipt.id} className="rounded-2xl border border-zinc-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-zinc-950">{receipt.referenceNumber}</p>
                              <p className="mt-0.5 text-[13px] text-zinc-500">
                                {receipt.receivedBy} · {receipt.receivedAt}
                              </p>
                            </div>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                                receipt.discrepancyType && receipt.discrepancyType !== 'none'
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-green-200 bg-green-50 text-signal-500'
                              }`}
                            >
                              {receipt.discrepancyType && receipt.discrepancyType !== 'none'
                                ? receipt.discrepancyType.replace('-', ' ')
                                : 'cleared'}
                            </span>
                          </div>
                          <p className="mt-2 text-[13px] leading-5 text-zinc-500">{receipt.notes}</p>
                          {receipt.discrepancyNotes ? (
                            <p className="mt-1 text-[12px] leading-5 text-amber-700">{receipt.discrepancyNotes}</p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500">
                        No goods receipts have been posted for this purchase order yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
                No purchase orders are available for the selected branch scope.
              </div>
            )}
          </article>
        </section>
      </section>

      {isModalOpen ? (
        <Modal
          title="Create Purchase Order"
          description="Mock procurement flow for assembling a supplier order, routing it for approval, and tracking branch replenishment commitments."
          onClose={() => setIsModalOpen(false)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <select className="control" value={formValues.supplierId} onChange={(event) => handleSupplierChange(event.target.value)}>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <select
              className="control"
              value={formValues.branch}
              onChange={(event) => setFormValues((current) => ({ ...current, branch: event.target.value }))}
            >
              {branches
                .filter((branchOption) => branchOption.value !== 'all')
                .map((branchOption) => (
                  <option key={branchOption.value} value={branchOption.value}>
                    {branchOption.label}
                  </option>
                ))}
            </select>
            <input
              className="control"
              placeholder="Requested by"
              value={formValues.requestedBy}
              onChange={(event) => setFormValues((current) => ({ ...current, requestedBy: event.target.value }))}
            />
            <input
              className="control"
              placeholder="ETA"
              type="date"
              value={formValues.eta}
              onChange={(event) => setFormValues((current) => ({ ...current, eta: event.target.value }))}
            />
            <input
              className="control md:col-span-2"
              placeholder="Payment terms"
              value={formValues.paymentTerms}
              onChange={(event) => setFormValues((current) => ({ ...current, paymentTerms: event.target.value }))}
            />
          </div>

          <div className="mt-4 space-y-3">
            {formValues.items.map((item, index) => (
              <div key={`draft-item-${index}`} className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-[1.3fr_0.7fr_0.8fr]">
                <select
                  className="control"
                  value={item.productId}
                  onChange={(event) => handleItemChange(index, 'productId', event.target.value)}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  className="control"
                  min="1"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                />
                <input
                  className="control"
                  min="0"
                  step="0.01"
                  type="number"
                  value={item.unitCost}
                  onChange={(event) => handleItemChange(index, 'unitCost', event.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-700">
            Draft PO total: <span className="font-semibold text-zinc-950">{formatCurrency(draftTotal)}</span>
          </div>

          <div className="mt-5 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canManageProcurement}
              onClick={handleCreatePurchaseOrder}
              className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                canManageProcurement ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-zinc-300'
              }`}
            >
              Save Purchase Order
            </button>
          </div>
        </Modal>
      ) : null}

      {isReceivingModalOpen && selectedPurchaseOrder ? (
        <Modal
          title={`Receive Goods for ${selectedPurchaseOrder.poNumber}`}
          description="Mock goods receipt flow for posting delivered quantities, updating receipt progress, and closing open purchase order lines."
          onClose={() => setIsReceivingModalOpen(false)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="control"
              type="date"
              value={receiptForm.receivedAt}
              onChange={(event) => setReceiptForm((current) => ({ ...current, receivedAt: event.target.value }))}
            />
            <input
              className="control"
              placeholder="Received by"
              value={receiptForm.receivedBy}
              onChange={(event) => setReceiptForm((current) => ({ ...current, receivedBy: event.target.value }))}
            />
            <input
              className="control md:col-span-2"
              placeholder="Receiving notes"
              value={receiptForm.notes}
              onChange={(event) => setReceiptForm((current) => ({ ...current, notes: event.target.value }))}
            />
            <select
              className="control"
              value={receiptForm.discrepancyType}
              onChange={(event) => setReceiptForm((current) => ({ ...current, discrepancyType: event.target.value }))}
            >
              <option value="none">No discrepancy</option>
              <option value="shortage">Shortage</option>
              <option value="damage">Damage</option>
              <option value="paperwork">Paperwork issue</option>
            </select>
            <input
              className="control"
              placeholder="Discrepancy note"
              value={receiptForm.discrepancyNotes}
              onChange={(event) => setReceiptForm((current) => ({ ...current, discrepancyNotes: event.target.value }))}
            />
          </div>

          <div className="mt-4 space-y-3">
            {receiptForm.items.map((item) => (
              <div key={`receipt-${item.id}`} className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-[1.25fr_0.7fr_0.7fr]">
                <div>
                  <p className="text-sm font-medium text-zinc-950">{item.name}</p>
                  <p className="mt-0.5 text-[12px] text-zinc-500">Remaining quantity: {item.remainingQuantity}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
                  Pending: {item.remainingQuantity}
                </div>
                <input
                  className="control"
                  type="number"
                  min="0"
                  max={item.remainingQuantity}
                  value={item.receivedQuantity}
                  onChange={(event) => handleReceiptQuantityChange(item.id, Number(event.target.value))}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsReceivingModalOpen(false)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canManageProcurement}
              onClick={handleSaveReceipt}
              className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                canManageProcurement ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-zinc-300'
              }`}
            >
              Post Goods Receipt
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export default ProcurementView;
