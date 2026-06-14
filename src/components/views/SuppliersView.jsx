import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, PackageCheck, Pencil, Truck } from 'lucide-react';
import Modal from '../ui/Modal';
import { branches } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';

const SUPPLIER_STATUS_STYLES = {
  active: 'border-green-200 bg-green-50 text-signal-500',
  review: 'border-amber-200 bg-amber-50 text-amber-700',
};

const RELIABILITY_STYLES = {
  Preferred: 'border-brand-200 bg-brand-50 text-brand-700',
  Approved: 'border-sky-200 bg-sky-50 text-sky-700',
  Conditional: 'border-amber-200 bg-amber-50 text-amber-700',
};

const PAYABLE_STATUS_STYLES = {
  pending: 'border-zinc-200 bg-white text-zinc-700',
  accruing: 'border-amber-200 bg-amber-50 text-amber-700',
  due: 'border-brand-200 bg-brand-50 text-brand-700',
  settled: 'border-green-200 bg-green-50 text-signal-500',
};

/**
 * Adds payment term days to a base ISO date.
 *
 * @param {string} baseDate Base ISO date string.
 * @param {string} paymentTerms Payment terms label.
 * @returns {string} Calculated due date string.
 */
function buildPayableDueDate(baseDate, paymentTerms) {
  const daysMatch = paymentTerms.match(/(\d+)/);
  const daysToAdd = daysMatch ? Number(daysMatch[1]) : 0;
  const dueDate = new Date(baseDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  return dueDate.toISOString().slice(0, 10);
}

/**
 * Renders the supplier management module with sourcing visibility.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.suppliers Visible supplier records.
 * @param {Array<object>} props.purchaseOrders Visible purchase orders for supplier history.
 * @param {boolean} props.canManageSuppliers Determines whether supplier admin actions are enabled.
 * @param {(formValues: object, editingSupplierId: string | null) => void} props.onSaveSupplier Saves a supplier record.
 * @param {(id: string, branch: string) => void} props.onChangeSupplierBranch Updates a supplier's branch assignment.
 * @returns {JSX.Element} Supplier management view.
 */
function SuppliersView({ suppliers, purchaseOrders, canManageSuppliers, onSaveSupplier, onChangeSupplierBranch }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id ?? null);
  const [formValues, setFormValues] = useState({
    name: '',
    category: 'Metals',
    branch: 'cebu',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    paymentTerms: '30 Days',
    leadTime: '3-5 days',
    reliability: 'Approved',
    status: 'active',
    onTimeRate: 90,
    fillRate: 90,
    averageLeadDays: 4,
    spendYtd: 0,
  });

  const supplierScorecards = useMemo(() => {
    if (!suppliers.length) {
      return {
        preferredCount: 0,
        averageOnTimeRate: 0,
        averageFillRate: 0,
        totalSpendYtd: 0,
      };
    }

    return {
      preferredCount: suppliers.filter((supplier) => supplier.reliability === 'Preferred').length,
      averageOnTimeRate: Math.round(suppliers.reduce((sum, supplier) => sum + supplier.onTimeRate, 0) / suppliers.length),
      averageFillRate: Math.round(suppliers.reduce((sum, supplier) => sum + supplier.fillRate, 0) / suppliers.length),
      totalSpendYtd: suppliers.reduce((sum, supplier) => sum + supplier.spendYtd, 0),
    };
  }, [suppliers]);

  useEffect(() => {
    if (!suppliers.length) {
      setSelectedSupplierId(null);
      return;
    }

    const selectionStillVisible = suppliers.some((supplier) => supplier.id === selectedSupplierId);
    if (!selectionStillVisible) {
      setSelectedSupplierId(suppliers[0].id);
    }
  }, [selectedSupplierId, suppliers]);

  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? suppliers[0] ?? null;
  const supplierPurchaseHistory = useMemo(() => {
    if (!selectedSupplier) {
      return {
        orders: [],
        orderCount: 0,
        totalSpend: 0,
        receivedValue: 0,
        paidValue: 0,
        outstandingPayables: 0,
        flaggedOrders: 0,
        ledgerRows: [],
      };
    }

    const orders = purchaseOrders.filter((order) => order.supplierId === selectedSupplier.id);
    const ledgerRows = orders.map((order) => {
      const receivedValue = order.items.reduce(
        (sum, item) => sum + (item.receivedQuantity ?? 0) * item.unitCost,
        0,
      );
      const paidValue = order.paidAmount ?? 0;
      const outstanding = Math.max(receivedValue - paidValue, 0);
      const hasDiscrepancy =
        order.items.some((item) => (item.receivedQuantity ?? 0) < item.quantity) ||
        (order.receipts ?? []).some((receipt) => receipt.discrepancyType && receipt.discrepancyType !== 'none');
      let payableStatus = 'pending';

      if (outstanding === 0 && receivedValue > 0) {
        payableStatus = 'settled';
      } else if (receivedValue > 0 && outstanding > 0 && order.status === 'received') {
        payableStatus = 'due';
      } else if (receivedValue > 0 && outstanding > 0) {
        payableStatus = 'accruing';
      }

      return {
        ...order,
        receivedValue,
        paidValue,
        outstanding,
        hasDiscrepancy,
        payableStatus,
        dueDate: buildPayableDueDate(order.eta, order.paymentTerms),
      };
    });

    return {
      orders: ledgerRows,
      orderCount: ledgerRows.length,
      totalSpend: orders.reduce((sum, order) => sum + order.total, 0),
      receivedValue: ledgerRows.reduce((sum, order) => sum + order.receivedValue, 0),
      paidValue: ledgerRows.reduce((sum, order) => sum + order.paidValue, 0),
      outstandingPayables: ledgerRows.reduce((sum, order) => sum + order.outstanding, 0),
      flaggedOrders: ledgerRows.filter((order) => order.hasDiscrepancy).length,
      ledgerRows,
    };
  }, [purchaseOrders, selectedSupplier]);

  /**
   * Opens the add supplier modal with empty defaults.
   */
  function handleOpenAddModal() {
    setEditingSupplierId(null);
    setFormValues({
      name: '',
      category: 'Metals',
      branch: 'cebu',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      paymentTerms: '30 Days',
      leadTime: '3-5 days',
      reliability: 'Approved',
      status: 'active',
      onTimeRate: 90,
      fillRate: 90,
      averageLeadDays: 4,
      spendYtd: 0,
    });
    setIsModalOpen(true);
  }

  /**
   * Opens the edit supplier modal using the selected supplier values.
   *
   * @param {object} supplier Supplier record.
   */
  function handleOpenEditModal(supplier) {
    setEditingSupplierId(supplier.id);
    setFormValues({
      name: supplier.name,
      category: supplier.category,
      branch: supplier.branch,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      leadTime: supplier.leadTime,
      reliability: supplier.reliability,
      status: supplier.status,
      onTimeRate: supplier.onTimeRate,
      fillRate: supplier.fillRate,
      averageLeadDays: supplier.averageLeadDays,
      spendYtd: supplier.spendYtd,
    });
    setIsModalOpen(true);
  }

  /**
   * Saves the supplier form to the shared admin directory.
   */
  function handleSaveSupplier() {
    if (!formValues.name || !formValues.contactPerson || !formValues.phone) {
      return;
    }

    onSaveSupplier(
      {
        ...formValues,
        onTimeRate: Number(formValues.onTimeRate),
        fillRate: Number(formValues.fillRate),
        averageLeadDays: Number(formValues.averageLeadDays),
        spendYtd: Number(formValues.spendYtd),
      },
      editingSupplierId,
    );
    setIsModalOpen(false);
  }

  return (
    <section className="space-y-5">
      <article className="panel p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-zinc-500">Supplier Management</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Vendor relationships, terms, and sourcing readiness</h3>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            {suppliers.length} suppliers in scope
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <Building2 size={16} />
              <p className="text-sm font-medium text-zinc-950">Vendor Portfolio</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Suppliers are grouped by branch relevance and procurement category for faster replenishment decisions.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <Truck size={16} />
              <p className="text-sm font-medium text-zinc-950">Lead Times</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Lead time visibility helps branch teams plan replenishment before stock reaches critical levels.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <PackageCheck size={16} />
              <p className="text-sm font-medium text-zinc-950">Commercial Terms</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Payment terms and reliability labels indicate which vendors are safest for core industrial materials.
            </p>
          </div>
        </div>
      </article>

      <article className="panel p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-[13px] text-zinc-500">Supplier Performance</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Scorecards for sourcing decisions</h3>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            Updated for current branch scope
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <BarChart3 size={16} />
              <p className="text-sm font-medium text-zinc-950">Preferred Vendors</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">{supplierScorecards.preferredCount}</p>
            <p className="mt-1 text-[13px] text-zinc-500">High-confidence supplier relationships</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <Truck size={16} />
              <p className="text-sm font-medium text-zinc-950">Avg. On-Time Rate</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">{supplierScorecards.averageOnTimeRate}%</p>
            <p className="mt-1 text-[13px] text-zinc-500">Delivery reliability across visible suppliers</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <PackageCheck size={16} />
              <p className="text-sm font-medium text-zinc-950">Avg. Fill Rate</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">{supplierScorecards.averageFillRate}%</p>
            <p className="mt-1 text-[13px] text-zinc-500">Order completeness performance</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <Building2 size={16} />
              <p className="text-sm font-medium text-zinc-950">Spend YTD</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">
              {formatCurrency(supplierScorecards.totalSpendYtd)}
            </p>
            <p className="mt-1 text-[13px] text-zinc-500">Procurement value in current scope</p>
          </div>
        </div>
      </article>

      <article className="panel p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-[13px] text-zinc-500">Supplier Directory</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Approved and in-review vendors</h3>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            disabled={!canManageSuppliers}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition ${
              canManageSuppliers ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-zinc-300'
            }`}
          >
            <Building2 size={15} />
            Add Supplier
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-700">
            <thead>
              <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <th className="pb-3 pr-4">Supplier</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Branch</th>
                <th className="pb-3 pr-4">Contact</th>
                <th className="pb-3 pr-4">Terms</th>
                <th className="pb-3 pr-4">Lead Time</th>
                <th className="pb-3 pr-4">Reliability</th>
                <th className="pb-3 pr-4">Performance</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className={`border-b border-zinc-200 last:border-b-0 ${
                    selectedSupplierId === supplier.id ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <td className="py-3 pr-4">
                    <button type="button" onClick={() => setSelectedSupplierId(supplier.id)} className="text-left">
                      <p className="text-sm font-medium text-zinc-950">{supplier.name}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">{supplier.phone}</p>
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-700">{supplier.category}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={supplier.branch}
                      disabled={!canManageSuppliers}
                      onChange={(event) => onChangeSupplierBranch(supplier.id, event.target.value)}
                      className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-[13px] text-zinc-700 outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                    >
                      {branches
                        .filter((branchOption) => branchOption.value !== 'all')
                        .map((branchOption) => (
                          <option key={branchOption.value} value={branchOption.value}>
                            {branchOption.label}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-[13px] text-zinc-700">{supplier.contactPerson}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{supplier.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-500">{supplier.paymentTerms}</td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-500">{supplier.leadTime}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        RELIABILITY_STYLES[supplier.reliability]
                      }`}
                    >
                      {supplier.reliability}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2 text-[12px] text-zinc-500">
                      <span>{supplier.onTimeRate}% OT</span>
                      <span className="text-zinc-300">|</span>
                      <span>{supplier.fillRate}% fill</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                          SUPPLIER_STATUS_STYLES[supplier.status]
                        }`}
                      >
                        {supplier.status}
                      </span>
                      <button
                        type="button"
                        disabled={!canManageSuppliers}
                        onClick={() => handleOpenEditModal(supplier)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                          canManageSuppliers
                            ? 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:text-brand-700'
                            : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[13px] text-zinc-500">Supplier Purchase History</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                {selectedSupplier?.name ?? 'No supplier selected'}
              </h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              {supplierPurchaseHistory.orderCount} purchase orders
            </span>
          </div>

          {selectedSupplier ? (
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Ordered Value</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-950">
                    {formatCurrency(supplierPurchaseHistory.totalSpend)}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Received Value</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-950">
                    {formatCurrency(supplierPurchaseHistory.receivedValue)}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Paid Value</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-950">
                    {formatCurrency(supplierPurchaseHistory.paidValue)}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Open Payables</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-950">
                    {formatCurrency(supplierPurchaseHistory.outstandingPayables)}
                  </p>
                  <p className="mt-1 text-[12px] text-zinc-500">
                    {supplierPurchaseHistory.flaggedOrders} orders carry receipt discrepancies
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="text-sm font-medium text-zinc-950">Recent Purchase Orders</p>
                <div className="mt-3 space-y-2.5">
                  {supplierPurchaseHistory.orders.length ? (
                    supplierPurchaseHistory.orders.map((order) => {
                      const receivedLines = order.items.reduce((sum, item) => sum + (item.receivedQuantity ?? 0), 0);
                      const orderedLines = order.items.reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <div key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-zinc-950">{order.poNumber}</p>
                              <p className="mt-0.5 text-[13px] text-zinc-500">
                                {order.requestedBy} · {order.paymentTerms}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-zinc-950">{formatCurrency(order.total)}</p>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2 text-[12px] text-zinc-500">
                            <span>ETA {order.eta}</span>
                            <span>
                              Received {receivedLines} / {orderedLines} units
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2 text-[12px]">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 font-medium capitalize ${
                                PAYABLE_STATUS_STYLES[order.payableStatus]
                              }`}
                            >
                              {order.payableStatus}
                            </span>
                            <span className="text-zinc-500">Outstanding {formatCurrency(order.outstanding)}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500">
                      No purchase history is available for this supplier in the current branch scope.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
              Select a supplier to inspect purchase order history and receipt performance.
            </div>
          )}
        </article>

        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[13px] text-zinc-500">Receiving Performance</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Order completion and fulfillment indicators</h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              Procurement-linked supplier visibility
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-zinc-700">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  <th className="pb-3 pr-4">PO</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Last Receipt</th>
                  <th className="pb-3">Receipt Progress</th>
                </tr>
              </thead>
              <tbody>
                {supplierPurchaseHistory.orders.map((order) => {
                  const totalOrdered = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const totalReceived = order.items.reduce((sum, item) => sum + (item.receivedQuantity ?? 0), 0);
                  const lastReceipt = order.receipts?.[0]?.receivedAt ?? 'Pending';

                  return (
                    <tr key={`history-${order.id}`} className="border-b border-zinc-200 last:border-b-0">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-zinc-950">{order.poNumber}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{order.branch}</p>
                      </td>
                      <td className="py-3 pr-4 text-[13px] capitalize text-zinc-700">{order.status.replace('-', ' ')}</td>
                      <td className="py-3 pr-4 text-[13px] text-zinc-500">{lastReceipt}</td>
                      <td className="py-3 text-[13px] text-zinc-500">
                        <div className="flex items-center justify-between gap-2">
                          <span>
                            {totalReceived} / {totalOrdered} units
                          </span>
                          {order.hasDiscrepancy ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                              Flagged
                            </span>
                          ) : (
                            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-medium text-signal-500">
                              Clear
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-950">Supplier Ledger</p>
                <p className="mt-1 text-[13px] text-zinc-500">PO-to-payables view based on received value and recorded payments</p>
              </div>
              <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-700">
                {supplierPurchaseHistory.ledgerRows.length} ledger entries
              </span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-zinc-700">
                <thead>
                  <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    <th className="pb-3 pr-4">PO</th>
                    <th className="pb-3 pr-4">Due Date</th>
                    <th className="pb-3 pr-4">Received</th>
                    <th className="pb-3 pr-4">Paid</th>
                    <th className="pb-3 pr-4">Outstanding</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierPurchaseHistory.ledgerRows.map((entry) => (
                    <tr key={`ledger-${entry.id}`} className="border-b border-zinc-200 last:border-b-0">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-zinc-950">{entry.poNumber}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{entry.paymentTerms}</p>
                      </td>
                      <td className="py-3 pr-4 text-[13px] text-zinc-500">{entry.dueDate}</td>
                      <td className="py-3 pr-4 text-[13px] text-zinc-700">{formatCurrency(entry.receivedValue)}</td>
                      <td className="py-3 pr-4 text-[13px] text-zinc-700">{formatCurrency(entry.paidValue)}</td>
                      <td className="py-3 pr-4 text-[13px] font-medium text-zinc-950">{formatCurrency(entry.outstanding)}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                            PAYABLE_STATUS_STYLES[entry.payableStatus]
                          }`}
                        >
                          {entry.payableStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>

      {isModalOpen ? (
        <Modal
          title={editingSupplierId ? 'Edit Supplier Profile' : 'Add Supplier Profile'}
          description="Mock supplier administration flow for maintaining branch sourcing coverage, commercial terms, and vendor reliability metrics."
          onClose={() => setIsModalOpen(false)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="control"
              placeholder="Supplier name"
              value={formValues.name}
              onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="control"
              placeholder="Category"
              value={formValues.category}
              onChange={(event) => setFormValues((current) => ({ ...current, category: event.target.value }))}
            />
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
              placeholder="Contact person"
              value={formValues.contactPerson}
              onChange={(event) => setFormValues((current) => ({ ...current, contactPerson: event.target.value }))}
            />
            <input
              className="control"
              placeholder="Phone"
              value={formValues.phone}
              onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))}
            />
            <input
              className="control"
              placeholder="Email"
              value={formValues.email}
              onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
            />
            <input
              className="control md:col-span-2"
              placeholder="Address"
              value={formValues.address}
              onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
            />
            <input
              className="control"
              placeholder="Payment terms"
              value={formValues.paymentTerms}
              onChange={(event) => setFormValues((current) => ({ ...current, paymentTerms: event.target.value }))}
            />
            <input
              className="control"
              placeholder="Lead time"
              value={formValues.leadTime}
              onChange={(event) => setFormValues((current) => ({ ...current, leadTime: event.target.value }))}
            />
            <select
              className="control"
              value={formValues.reliability}
              onChange={(event) => setFormValues((current) => ({ ...current, reliability: event.target.value }))}
            >
              <option value="Preferred">Preferred</option>
              <option value="Approved">Approved</option>
              <option value="Conditional">Conditional</option>
            </select>
            <select
              className="control"
              value={formValues.status}
              onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="active">Active</option>
              <option value="review">Review</option>
            </select>
            <input
              className="control"
              min="0"
              max="100"
              type="number"
              placeholder="On-time rate"
              value={formValues.onTimeRate}
              onChange={(event) => setFormValues((current) => ({ ...current, onTimeRate: event.target.value }))}
            />
            <input
              className="control"
              min="0"
              max="100"
              type="number"
              placeholder="Fill rate"
              value={formValues.fillRate}
              onChange={(event) => setFormValues((current) => ({ ...current, fillRate: event.target.value }))}
            />
            <input
              className="control"
              min="0"
              type="number"
              placeholder="Average lead days"
              value={formValues.averageLeadDays}
              onChange={(event) => setFormValues((current) => ({ ...current, averageLeadDays: event.target.value }))}
            />
            <input
              className="control"
              min="0"
              type="number"
              placeholder="Spend YTD"
              value={formValues.spendYtd}
              onChange={(event) => setFormValues((current) => ({ ...current, spendYtd: event.target.value }))}
            />
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
              disabled={!canManageSuppliers}
              onClick={handleSaveSupplier}
              className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                canManageSuppliers ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-zinc-300'
              }`}
            >
              Save Supplier
            </button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

export default SuppliersView;
