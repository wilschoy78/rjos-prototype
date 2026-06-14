import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import DashboardView from './components/views/DashboardView';
import InventoryOperationsView from './components/views/InventoryOperationsView';
import MasterDataView from './components/views/MasterDataView';
import ProcurementView from './components/views/ProcurementView';
import SalesOperationsView from './components/views/SalesOperationsView';
import SystemSetupView from './components/views/SystemSetupView';
import {
  branchProfiles,
  customers,
  inventoryItems,
  pendingTransfers,
  purchaseOrders,
  quotationHistory,
  recentActivity,
  rolePermissionMatrix,
  salesToday,
  salesTrend,
  salesTrendLabels,
  suppliers,
  systemUsers,
  userActivityLog,
  userDeactivationRequests,
} from './data/mockData';
import { formatCurrency, getStockForBranch } from './utils/format';

const ROLE_MODULE_ACCESS = {
  SuperAdmin: ['dashboard', 'system-setup', 'master-data', 'sales-operations', 'procurement', 'inventory-operations'],
  Admin: ['dashboard', 'system-setup', 'master-data', 'sales-operations', 'procurement', 'inventory-operations'],
  'Branch Manager': ['dashboard', 'sales-operations', 'procurement', 'inventory-operations'],
  'Inventory Controller': ['dashboard', 'procurement', 'inventory-operations'],
  'Sales Encoder': ['sales-operations'],
  'Credit Officer': ['dashboard', 'sales-operations'],
};

const VIEW_ORDER = ['dashboard', 'system-setup', 'master-data', 'sales-operations', 'procurement', 'inventory-operations'];

/**
 * Builds a quotation number from branch scope and sequence.
 *
 * @param {string} branch Active branch key.
 * @param {number} sequence Quote running sequence.
 * @returns {string} Quotation number.
 */
function buildQuoteNumber(branch, sequence) {
  const branchCode = branch === 'all' ? 'ALL' : branch.toUpperCase();
  return `QT-${branchCode}-2026-${String(sequence).padStart(3, '0')}`;
}

/**
 * Returns an ISO date string after adding a number of days.
 *
 * @param {number} days Days to add from the current date.
 * @returns {string} ISO date string.
 */
function buildFutureDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Filters inventory using the active branch and search term.
 *
 * @param {Array<object>} items Inventory collection.
 * @param {string} selectedBranch Active branch key.
 * @param {string} searchTerm Current search input.
 * @returns {Array<object>} Filtered inventory records.
 */
function filterInventory(items, selectedBranch, searchTerm) {
  return items.filter((item) => {
    const matchesSearch = [item.name, item.sku, item.category]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch && getStockForBranch(item, selectedBranch) > 0;
  });
}

/**
 * Filters customers using the branch and pricing tier context.
 *
 * @param {Array<object>} records Customer records.
 * @param {string} selectedBranch Active branch key.
 * @param {string} pricingTier Active pricing tier.
 * @returns {Array<object>} Visible customer records.
 */
function filterCustomers(records, selectedBranch, pricingTier) {
  return records.filter((customer) => {
    const matchesBranch = selectedBranch === 'all' || customer.branch === selectedBranch;
    const matchesTier = customer.tier === pricingTier;

    return matchesBranch && matchesTier;
  });
}

/**
 * Filters supplier records using the active branch context.
 *
 * @param {Array<object>} records Supplier records.
 * @param {string} selectedBranch Active branch key.
 * @returns {Array<object>} Visible supplier records.
 */
function filterSuppliers(records, selectedBranch) {
  return records.filter((supplier) => selectedBranch === 'all' || supplier.branch === selectedBranch);
}

/**
 * Filters user accounts using the active branch context.
 *
 * @param {Array<object>} records System user records.
 * @param {string} selectedBranch Active branch key.
 * @returns {Array<object>} Visible user records.
 */
function filterUsers(records, selectedBranch) {
  return records.filter((user) => selectedBranch === 'all' || user.branch === selectedBranch);
}

/**
 * Filters user activity records using the active branch context.
 *
 * @param {Array<object>} records Audit log records.
 * @param {string} selectedBranch Active branch key.
 * @returns {Array<object>} Visible audit log records.
 */
function filterUserActivity(records, selectedBranch) {
  return records.filter((entry) => selectedBranch === 'all' || entry.branch === selectedBranch);
}

/**
 * Filters deactivation requests based on the active branch context.
 *
 * @param {Array<object>} records Deactivation requests.
 * @param {string} selectedBranch Active branch key.
 * @param {Array<object>} users User directory for branch lookup.
 * @returns {Array<object>} Visible deactivation requests.
 */
function filterDeactivationRequests(records, selectedBranch, users) {
  return records.filter((request) => {
    if (selectedBranch === 'all') {
      return true;
    }

    const user = users.find((entry) => entry.id === request.userId);
    return user?.branch === selectedBranch;
  });
}

/**
 * Filters purchase orders using the active branch context.
 *
 * @param {Array<object>} records Purchase order records.
 * @param {string} selectedBranch Active branch key.
 * @returns {Array<object>} Visible purchase orders.
 */
function filterPurchaseOrders(records, selectedBranch) {
  return records.filter((order) => selectedBranch === 'all' || order.branch === selectedBranch);
}

/**
 * Filters stock transfer requests using the active branch context.
 *
 * @param {Array<object>} records Transfer request records.
 * @param {string} selectedBranch Active branch key.
 * @returns {Array<object>} Visible transfer requests.
 */
function filterPendingTransfers(records, selectedBranch) {
  return records.filter((transfer) => {
    if (selectedBranch === 'all') {
      return true;
    }

    return transfer.from === selectedBranch || transfer.to === selectedBranch;
  });
}

/**
 * Calculates KPI summaries for the active branch and tier filters.
 *
 * @param {string} selectedBranch Active branch key.
 * @param {string} pricingTier Active pricing tier.
 * @param {Array<object>} visibleCustomers Filtered customers.
 * @returns {Array<object>} KPI card definitions.
 */
function buildKpis(selectedBranch, pricingTier, visibleCustomers, inventoryCatalog) {
  const salesValue =
    selectedBranch === 'all'
      ? Object.values(salesToday).reduce((sum, branchSales) => sum + branchSales[pricingTier], 0)
      : salesToday[selectedBranch][pricingTier];

  const lowStockItems = inventoryCatalog.filter(
    (item) => getStockForBranch(item, selectedBranch) <= item.reorderLevel,
  ).length;

  const transferCount = pendingTransfers.filter((transfer) => {
    if (selectedBranch === 'all') {
      return true;
    }

    return transfer.from === selectedBranch || transfer.to === selectedBranch;
  }).length;

  return [
    {
      id: 'sales',
      label: 'Total Sales Today',
      value: formatCurrency(salesValue),
      helper: `Based on ${pricingTier} transactions in the current branch scope.`,
    },
    {
      id: 'lowStock',
      label: 'Low Stock Items',
      value: lowStockItems,
      helper: 'Products at or below reorder threshold require purchasing attention.',
    },
    {
      id: 'accounts',
      label: 'Active 30-Day Charge Accounts',
      value: visibleCustomers.filter((customer) => customer.status === 'good').length,
      helper: 'Accounts eligible to transact on approved 30-day credit terms.',
    },
    {
      id: 'transfers',
      label: 'Pending Transfers',
      value: transferCount,
      helper: 'Open branch-to-branch replenishment requests still in motion.',
    },
  ];
}

/**
 * Builds the trend chart series for the current dashboard scope.
 *
 * @param {string} selectedBranch Active branch key.
 * @param {string} pricingTier Active pricing tier.
 * @returns {number[]} Trend values.
 */
function buildTrendSeries(selectedBranch, pricingTier) {
  if (selectedBranch === 'all') {
    return salesTrendLabels.map((_, index) =>
      Object.keys(branchProfiles).reduce(
        (sum, branchKey) => sum + salesTrend[branchKey][pricingTier][index],
        0,
      ),
    );
  }

  return salesTrend[selectedBranch][pricingTier];
}

/**
 * Builds comparative branch revenue metrics for dashboard charts.
 *
 * @param {string} pricingTier Active pricing tier.
 * @returns {Array<object>} Branch comparison records.
 */
function buildBranchPerformance(pricingTier) {
  const totalSales = Object.values(salesToday).reduce((sum, branchSales) => sum + branchSales[pricingTier], 0);

  return Object.values(branchProfiles).map((branch) => ({
    ...branch,
    value: salesToday[branch.key][pricingTier],
    weeklyTotal: salesTrend[branch.key][pricingTier].reduce((sum, value) => sum + value, 0),
    share: Math.round((salesToday[branch.key][pricingTier] / totalSales) * 100),
  }));
}

/**
 * Provides the main SPA shell and coordinates shared view state.
 *
 * @returns {JSX.Element} Full application shell.
 */
function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [pricingTier, setPricingTier] = useState('retail');
  const [inventoryDirectory, setInventoryDirectory] = useState(inventoryItems);
  const [supplierDirectory, setSupplierDirectory] = useState(suppliers);
  const [userDirectory, setUserDirectory] = useState(systemUsers);
  const [currentUserId, setCurrentUserId] = useState(systemUsers[0]?.id ?? '');
  const [userActivityItems, setUserActivityItems] = useState(userActivityLog);
  const [deactivationQueue, setDeactivationQueue] = useState(userDeactivationRequests);
  const [purchaseOrderDirectory, setPurchaseOrderDirectory] = useState(purchaseOrders);
  const [inventorySearch, setInventorySearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [masterDataTab, setMasterDataTab] = useState('users');
  const [salesOperationsTab, setSalesOperationsTab] = useState('quotations');
  const [inventoryOperationsTab, setInventoryOperationsTab] = useState('inventory');
  const [paymentType, setPaymentType] = useState('cash');
  const [successMessage, setSuccessMessage] = useState('');
  const [cart, setCart] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]);
  const [selectedQuoteCustomerId, setSelectedQuoteCustomerId] = useState('');
  const [quoteDiscountPercent, setQuoteDiscountPercent] = useState(0);
  const [quoteNotes, setQuoteNotes] = useState('Delivery is subject to available branch stock and final confirmation.');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteHistoryItems, setQuoteHistoryItems] = useState(quotationHistory);
  const [quoteSequence, setQuoteSequence] = useState(14);
  const [activeEditingQuoteId, setActiveEditingQuoteId] = useState(null);

  const visibleInventory = useMemo(
    () => filterInventory(inventoryDirectory, selectedBranch, inventorySearch),
    [inventoryDirectory, selectedBranch, inventorySearch],
  );

  const visibleCustomers = useMemo(
    () => filterCustomers(customers, selectedBranch, pricingTier),
    [selectedBranch, pricingTier],
  );

  const visibleSuppliers = useMemo(
    () => filterSuppliers(supplierDirectory, selectedBranch),
    [selectedBranch, supplierDirectory],
  );

  const visibleUsers = useMemo(
    () => filterUsers(userDirectory, selectedBranch),
    [selectedBranch, userDirectory],
  );

  const visibleUserActivity = useMemo(
    () => filterUserActivity(userActivityItems, selectedBranch),
    [selectedBranch, userActivityItems],
  );

  const visibleDeactivationRequests = useMemo(
    () => filterDeactivationRequests(deactivationQueue, selectedBranch, userDirectory),
    [deactivationQueue, selectedBranch, userDirectory],
  );

  const visiblePurchaseOrders = useMemo(
    () => filterPurchaseOrders(purchaseOrderDirectory, selectedBranch),
    [purchaseOrderDirectory, selectedBranch],
  );
  const visibleTransfers = useMemo(
    () => filterPendingTransfers(pendingTransfers, selectedBranch),
    [selectedBranch],
  );

  const visibleActivity = useMemo(
    () =>
      recentActivity.filter((activity) => {
        const matchesBranch = selectedBranch === 'all' || activity.branch === selectedBranch;
        const matchesTier = activity.tier === pricingTier;

        return matchesBranch && matchesTier;
      }),
    [selectedBranch, pricingTier],
  );

  const kpis = useMemo(
    () => buildKpis(selectedBranch, pricingTier, visibleCustomers, inventoryDirectory),
    [inventoryDirectory, selectedBranch, pricingTier, visibleCustomers],
  );

  const trendSeries = useMemo(
    () => buildTrendSeries(selectedBranch, pricingTier),
    [selectedBranch, pricingTier],
  );

  const branchPerformance = useMemo(
    () => buildBranchPerformance(pricingTier),
    [pricingTier],
  );

  const activeBranchProfile = selectedBranch === 'all' ? null : branchProfiles[selectedBranch];
  const currentUser = userDirectory.find((user) => user.id === currentUserId) ?? userDirectory[0] ?? null;
  const currentPermissions = useMemo(() => new Set(currentUser?.permissions ?? []), [currentUser]);
  const visibleViewIds = useMemo(
    () => VIEW_ORDER.filter((viewId) => (ROLE_MODULE_ACCESS[currentUser?.role] ?? ['dashboard']).includes(viewId)),
    [currentUser],
  );
  const canManageUsers = currentPermissions.has('Users');
  const canManageSuppliers = currentPermissions.has('Suppliers');
  const canManageProcurement = currentPermissions.has('Procurement');
  const selectedQuoteCustomer = visibleCustomers.find((customer) => customer.id === selectedQuoteCustomerId) ?? null;
  const activeEditingQuote = quoteHistoryItems.find((item) => item.id === activeEditingQuoteId) ?? null;
  const activeQuoteNumber = activeEditingQuote?.quoteNumber ?? buildQuoteNumber(selectedBranch, quoteSequence);

  /**
   * Resets the active quotation builder to a fresh blank draft.
   */
  function resetQuotationBuilder() {
    setQuoteItems([]);
    setSelectedQuoteCustomerId('');
    setQuoteDiscountPercent(0);
    setQuoteNotes('Delivery is subject to available branch stock and final confirmation.');
    setActiveEditingQuoteId(null);
    setQuoteSequence((currentValue) => currentValue + 1);
  }

  /**
   * Creates a history record snapshot for the current quotation.
   *
   * @param {'draft'|'sent'|'converted'} status Quotation lifecycle status.
   * @param {'pending'|'reviewed'|'approved'|'rejected'} approvalStatus Approval workflow status.
   * @returns {object} History row.
   */
  function buildQuoteHistoryRecord(status, approvalStatus = 'pending') {
    const subtotal = quoteItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * (quoteDiscountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const vat = taxableAmount * 0.12;
    const total = taxableAmount + vat;
    const validityDays = selectedQuoteCustomer?.quotationValidityDays ?? 15;

    return {
      id: activeEditingQuoteId ?? `${activeQuoteNumber}-${status.toLowerCase()}`,
      quoteNumber: activeQuoteNumber,
      customerId: selectedQuoteCustomer?.id ?? '',
      customerName: selectedQuoteCustomer?.name ?? 'Walk-in / Project Client',
      branch: selectedQuoteCustomer?.branch ?? selectedBranch,
      tier: selectedQuoteCustomer?.tier ?? pricingTier,
      status,
      approvalStatus,
      paymentTerms: selectedQuoteCustomer?.paymentTerms ?? 'Standard Commercial Terms',
      validUntil: buildFutureDate(validityDays),
      total,
      createdAt: new Date().toISOString().slice(0, 10),
      discountPercent: quoteDiscountPercent,
      notes: quoteNotes,
      items: quoteItems.map((item) => ({ ...item })),
    };
  }

  /**
   * Adds a product to the cart or increments the existing line item.
   *
   * @param {object} product Inventory product selected from the POS grid.
   */
  function handleAddToCart(product) {
    setSuccessMessage('');
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, price: product.price[pricingTier] }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          unit: product.unit,
          price: product.price[pricingTier],
          quantity: 1,
        },
      ];
    });
  }

  /**
   * Updates the quantity of a cart item and removes empty lines.
   *
   * @param {string} id Product identifier.
   * @param {number} delta Quantity change.
   */
  function handleUpdateQuantity(id, delta) {
    setSuccessMessage('');
    setCart((currentCart) =>
      currentCart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  /**
   * Finalizes the mock sale flow and resets cart state.
   */
  function handleCompleteSale() {
    if (!cart.length) {
      setSuccessMessage('Select at least one item before completing the sale.');
      return;
    }

    const paymentLabel = paymentType === 'cash' ? 'Cash' : '30-day charge';
    setSuccessMessage(`Sale completed successfully using ${paymentLabel}. Receipt synced to branch operations.`);
    setCart([]);
  }

  /**
   * Adds a product to the quotation or increments an existing quotation line.
   *
   * @param {object} product Inventory product selected for quotation.
   */
  function handleAddToQuote(product) {
    setQuoteMessage('');
    setQuoteItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, price: product.price[pricingTier] }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          unit: product.unit,
          price: product.price[pricingTier],
          quantity: 1,
        },
      ];
    });
  }

  /**
   * Updates a quotation line quantity and removes zero-quantity rows.
   *
   * @param {string} id Product identifier.
   * @param {number} delta Quantity change.
   */
  function handleUpdateQuoteQuantity(id, delta) {
    setQuoteMessage('');
    setQuoteItems((currentItems) =>
      currentItems
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  /**
   * Updates the unit price of a quotation line.
   *
   * @param {string} id Product identifier.
   * @param {number} price Updated line price.
   */
  function handleUpdateQuotePrice(id, price) {
    setQuoteMessage('');
    if (Number.isNaN(price) || price < 0) {
      return;
    }

    setQuoteItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, price } : item)),
    );
  }

  /**
   * Removes a quotation line item.
   *
   * @param {string} id Product identifier.
   */
  function handleRemoveQuoteItem(id) {
    setQuoteMessage('');
    setQuoteItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  /**
   * Saves the quotation as a mock draft.
   */
  function handleSaveQuoteDraft() {
    if (!quoteItems.length) {
      setQuoteMessage('Add at least one item before saving a quotation draft.');
      return;
    }

    const record = buildQuoteHistoryRecord('draft', 'pending');
    setQuoteHistoryItems((currentItems) => {
      const remainingItems = currentItems.filter((item) => item.id !== record.id);
      return [record, ...remainingItems];
    });
    setQuoteMessage(activeEditingQuoteId ? 'Quotation draft updated successfully.' : 'Quotation draft saved successfully and is ready for review.');
  }

  /**
   * Generates a mock quotation document summary.
   */
  function handleGenerateQuotation() {
    if (!quoteItems.length) {
      setQuoteMessage('Add at least one item before generating a quotation.');
      return;
    }

    if (!selectedQuoteCustomerId) {
      setQuoteMessage('Select a customer account before generating the quotation.');
      return;
    }

    const record = buildQuoteHistoryRecord('sent', 'reviewed');
    setQuoteHistoryItems((currentItems) => {
      const remainingItems = currentItems.filter((item) => item.id !== record.id);
      return [record, ...remainingItems];
    });
    setQuoteMessage('Quotation generated successfully and is ready to send to the customer.');
  }

  /**
   * Converts the active quotation into a POS sale and switches to the POS terminal.
   */
  function handleConvertQuoteToSale() {
    if (!quoteItems.length) {
      setQuoteMessage('Add at least one item before converting the quotation to a sale.');
      return;
    }

    setCart(
      quoteItems.map((item) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        price: item.price,
        quantity: item.quantity,
      })),
    );

    if (selectedQuoteCustomer?.paymentTerms?.toLowerCase().includes('30-day')) {
      setPaymentType('charge');
    } else {
      setPaymentType('cash');
    }

    const record = buildQuoteHistoryRecord('converted', 'approved');
    setQuoteHistoryItems((currentItems) => {
      const remainingItems = currentItems.filter((item) => item.id !== record.id);
      return [record, ...remainingItems];
    });
    setSuccessMessage(`Quotation ${activeQuoteNumber} converted to a sale and loaded into the POS terminal.`);
    setQuoteMessage('Quotation converted successfully. Review the cart and complete the sale in POS.');
    resetQuotationBuilder();
    setSalesOperationsTab('sales');
    setActiveView('sales-operations');
  }

  /**
   * Updates the approval status of a historical quotation record.
   *
   * @param {string} id History record identifier.
   * @param {'pending'|'reviewed'|'approved'|'rejected'} approvalStatus Updated approval state.
   */
  function handleUpdateQuoteApprovalStatus(id, approvalStatus) {
    setQuoteHistoryItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, approvalStatus } : item)),
    );
    setQuoteMessage(`Quotation approval status updated to ${approvalStatus}.`);
  }

  /**
   * Loads a saved draft back into the active quotation builder for editing.
   *
   * @param {string} id History record identifier.
   */
  function handleLoadQuoteDraft(id) {
    const record = quoteHistoryItems.find((item) => item.id === id);
    if (!record) {
      return;
    }

    setSelectedBranch(record.branch ?? 'all');
    setPricingTier(record.tier ?? pricingTier);
    setActiveEditingQuoteId(record.id);
    setSelectedQuoteCustomerId(record.customerId ?? '');
    setQuoteDiscountPercent(record.discountPercent ?? 0);
    setQuoteNotes(record.notes ?? '');
    setQuoteItems((record.items ?? []).map((item) => ({ ...item })));
    setQuoteMessage(`Loaded ${record.quoteNumber} back into the quotation builder for editing.`);
    setSalesOperationsTab('quotations');
    setActiveView('sales-operations');
  }

  /**
   * Prepends a new audit log entry into the shared user activity stream.
   *
   * @param {object} payload Audit record details.
   * @param {string} payload.userId User identifier related to the action.
   * @param {string} payload.action Action summary.
   * @param {string} payload.branch Branch identifier for the action.
   */
  function appendAuditLogEntry({ userId, action, branch }) {
    setUserActivityItems((currentItems) => [
      {
        id: `audit-${currentItems.length + 1}`,
        userId,
        actor: currentUser?.name ?? 'System Admin',
        action,
        branch,
        timestamp: '2026-06-14 12:00',
      },
      ...currentItems,
    ]);
  }

  /**
   * Saves a new or existing user account into the shared admin directory.
   *
   * @param {object} formValues User form payload.
   * @param {string|null} editingUserId Existing user identifier when editing.
   */
  function handleSaveUser(formValues, editingUserId) {
    const rolePermissions = rolePermissionMatrix.find((role) => role.role === formValues.role)?.permissions ?? [];
    const nextUser = {
      ...formValues,
      accessLevel: rolePermissions.join(' + '),
      permissions: rolePermissions,
      lastActive: formValues.status === 'invited' ? 'Invitation Pending' : 'Just updated',
    };

    if (editingUserId) {
      setUserDirectory((currentUsers) =>
        currentUsers.map((user) => (user.id === editingUserId ? { ...user, ...nextUser } : user)),
      );
      appendAuditLogEntry({
        userId: editingUserId,
        action: `Updated account profile for ${formValues.name}`,
        branch: formValues.branch,
      });
      return;
    }

    const newUserId = `usr-${userDirectory.length + 1}`;
    setUserDirectory((currentUsers) => [{ id: newUserId, ...nextUser }, ...currentUsers]);
    appendAuditLogEntry({
      userId: newUserId,
      action: `Created user account for ${formValues.name}`,
      branch: formValues.branch,
    });
  }

  /**
   * Updates a user's branch assignment from the users table.
   *
   * @param {string} id User identifier.
   * @param {string} branch Updated branch key.
   */
  function handleUserBranchAssignmentChange(id, branch) {
    const user = userDirectory.find((entry) => entry.id === id);
    if (!user) {
      return;
    }

    setUserDirectory((currentUsers) => currentUsers.map((entry) => (entry.id === id ? { ...entry, branch } : entry)));
    appendAuditLogEntry({
      userId: id,
      action: `Reassigned ${user.name} to ${branch} branch coverage`,
      branch,
    });
  }

  /**
   * Raises a mock deactivation request for a user account.
   *
   * @param {string} userId User identifier.
   */
  function handleRequestUserDeactivation(userId) {
    const user = userDirectory.find((entry) => entry.id === userId);
    const hasOpenRequest = deactivationQueue.some(
      (request) => request.userId === userId && ['pending', 'review'].includes(request.status),
    );

    if (!user || hasOpenRequest) {
      return;
    }

    setDeactivationQueue((currentItems) => [
      {
        id: `deact-${currentItems.length + 1}`,
        userId,
        userName: user.name,
        requestedBy: currentUser?.name ?? 'System Admin',
        reason: 'Administrative access cleanup pending management confirmation',
        requestedAt: '2026-06-14',
        status: 'pending',
      },
      ...currentItems,
    ]);
    appendAuditLogEntry({
      userId,
      action: `Raised user deactivation request for ${user.name}`,
      branch: user.branch,
    });
  }

  /**
   * Updates the approval status for a user deactivation request.
   *
   * @param {string} id Deactivation request identifier.
   * @param {'pending'|'review'|'approved'|'rejected'} status Updated approval status.
   */
  function handleUpdateDeactivationRequest(id, status) {
    const request = deactivationQueue.find((entry) => entry.id === id);
    const user = userDirectory.find((entry) => entry.id === request?.userId);

    if (!request || !user) {
      return;
    }

    setDeactivationQueue((currentItems) =>
      currentItems.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
    );

    if (status === 'approved') {
      setUserDirectory((currentUsers) =>
        currentUsers.map((entry) =>
          entry.id === request.userId ? { ...entry, status: 'deactivated', lastActive: 'Access removed' } : entry,
        ),
      );
    }

    appendAuditLogEntry({
      userId: request.userId,
      action: `${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Reviewed'} deactivation request for ${request.userName}`,
      branch: user.branch,
    });
  }

  /**
   * Saves a supplier record into the shared supplier directory.
   *
   * @param {object} formValues Supplier form payload.
   * @param {string|null} editingSupplierId Existing supplier identifier when editing.
   */
  function handleSaveSupplier(formValues, editingSupplierId) {
    if (editingSupplierId) {
      setSupplierDirectory((currentSuppliers) =>
        currentSuppliers.map((supplier) =>
          supplier.id === editingSupplierId ? { ...supplier, ...formValues } : supplier,
        ),
      );
      const supplier = supplierDirectory.find((entry) => entry.id === editingSupplierId);
      appendAuditLogEntry({
        userId: currentUser?.id ?? editingSupplierId,
        action: `Updated supplier profile for ${formValues.name}`,
        branch: formValues.branch ?? supplier?.branch ?? selectedBranch,
      });
      return;
    }

    setSupplierDirectory((currentSuppliers) => [
      {
        id: `sup-${currentSuppliers.length + 1}`,
        ...formValues,
      },
      ...currentSuppliers,
    ]);
    appendAuditLogEntry({
      userId: currentUser?.id ?? `sup-${supplierDirectory.length + 1}`,
      action: `Added supplier profile for ${formValues.name}`,
      branch: formValues.branch,
    });
  }

  /**
   * Updates a supplier's assigned branch from the supplier directory table.
   *
   * @param {string} id Supplier identifier.
   * @param {string} branch Updated branch key.
   */
  function handleSupplierBranchChange(id, branch) {
    setSupplierDirectory((currentSuppliers) =>
      currentSuppliers.map((supplier) => (supplier.id === id ? { ...supplier, branch } : supplier)),
    );
    appendAuditLogEntry({
      userId: currentUser?.id ?? id,
      action: `Reassigned supplier coverage to ${branch} branch`,
      branch,
    });
  }

  /**
   * Creates a purchase order in the shared procurement queue.
   *
   * @param {object} purchaseOrder Purchase order payload.
   */
  function handleCreatePurchaseOrder(purchaseOrder) {
    setPurchaseOrderDirectory((currentOrders) => [
      {
        id: `po-${currentOrders.length + 1}`,
        ...purchaseOrder,
        paidAmount: purchaseOrder.paidAmount ?? 0,
        receipts: purchaseOrder.receipts ?? [],
        items: purchaseOrder.items.map((item) => ({
          ...item,
          receivedQuantity: item.receivedQuantity ?? 0,
        })),
      },
      ...currentOrders,
    ]);
    appendAuditLogEntry({
      userId: currentUser?.id ?? purchaseOrder.supplierId,
      action: `Created purchase order ${purchaseOrder.poNumber}`,
      branch: purchaseOrder.branch,
    });
  }

  /**
   * Updates a purchase order lifecycle status.
   *
   * @param {string} id Purchase order identifier.
   * @param {string} status Updated purchase order status.
   */
  function handleUpdatePurchaseOrderStatus(id, status) {
    const order = purchaseOrderDirectory.find((entry) => entry.id === id);
    if (!order) {
      return;
    }

    setPurchaseOrderDirectory((currentOrders) =>
      currentOrders.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
    );
    appendAuditLogEntry({
      userId: currentUser?.id ?? id,
      action: `Updated ${order.poNumber} status to ${status}`,
      branch: order.branch,
    });
  }

  /**
   * Applies a goods receipt against a purchase order and updates receipt status.
   *
   * @param {string} id Purchase order identifier.
   * @param {object} receiptPayload Receipt details.
   * @param {string} receiptPayload.receivedAt Receipt date.
   * @param {string} receiptPayload.receivedBy Receiver name.
   * @param {string} receiptPayload.notes Receipt notes.
   * @param {Array<object>} receiptPayload.items Line receipt quantities.
   */
  function handleReceivePurchaseOrder(id, receiptPayload) {
    const order = purchaseOrderDirectory.find((entry) => entry.id === id);
    if (!order) {
      return;
    }

    let receivedAnyQuantity = false;
    const stockIncrements = [];
    const nextItems = order.items.map((item) => {
      const receiptLine = receiptPayload.items.find((entry) => entry.id === item.id);
      const addedQuantity = Math.max(0, Number(receiptLine?.receivedQuantity ?? 0));
      const currentReceived = item.receivedQuantity ?? 0;
      const nextReceived = Math.min(item.quantity, currentReceived + addedQuantity);

      if (addedQuantity > 0) {
        receivedAnyQuantity = true;
        stockIncrements.push({ id: item.id, quantity: nextReceived - currentReceived });
      }

      return {
        ...item,
        receivedQuantity: nextReceived,
      };
    });

    if (!receivedAnyQuantity) {
      return;
    }

    const allReceived = nextItems.every((item) => (item.receivedQuantity ?? 0) >= item.quantity);
    const nextStatus = allReceived ? 'received' : 'partial';
    const nextReceiptNumber = (order.receipts?.length ?? 0) + 11;
    const discrepancyType =
      receiptPayload.discrepancyType !== 'none' ? receiptPayload.discrepancyType : allReceived ? 'none' : 'shortage';
    const receiptEntry = {
      id: `${id}-grn-${(order.receipts?.length ?? 0) + 1}`,
      referenceNumber: `GRN-${order.branch.toUpperCase()}-2026-${String(nextReceiptNumber).padStart(3, '0')}`,
      receivedBy: receiptPayload.receivedBy,
      receivedAt: receiptPayload.receivedAt,
      notes: receiptPayload.notes,
      discrepancyType,
      discrepancyNotes: receiptPayload.discrepancyNotes,
    };

    setInventoryDirectory((currentInventory) =>
      currentInventory.map((product) => {
        const increment = stockIncrements.find((entry) => entry.id === product.id);
        if (!increment) {
          return product;
        }

        return {
          ...product,
          stock: {
            ...product.stock,
            [order.branch]: (product.stock[order.branch] ?? 0) + increment.quantity,
          },
        };
      }),
    );
    setPurchaseOrderDirectory((currentOrders) =>
      currentOrders.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: nextStatus,
              items: nextItems,
              receipts: [receiptEntry, ...(entry.receipts ?? [])],
            }
          : entry,
      ),
    );
    appendAuditLogEntry({
      userId: currentUser?.id ?? id,
      action: `Posted goods receipt ${receiptEntry.referenceNumber} for ${order.poNumber}`,
      branch: order.branch,
    });
  }

  useEffect(() => {
    if (!currentUserId && userDirectory[0]?.id) {
      setCurrentUserId(userDirectory[0].id);
      return;
    }

    const selectedUser = userDirectory.find((user) => user.id === currentUserId);
    if (selectedUser?.status === 'deactivated') {
      const nextActiveUser = userDirectory.find((user) => user.status !== 'deactivated');
      if (nextActiveUser) {
        setCurrentUserId(nextActiveUser.id);
      }
    }
  }, [currentUserId, userDirectory]);

  useEffect(() => {
    if (!visibleViewIds.length) {
      return;
    }

    if (!visibleViewIds.includes(activeView)) {
      setActiveView(visibleViewIds[0]);
    }
  }, [activeView, visibleViewIds]);

  useEffect(() => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        const product = inventoryDirectory.find((inventoryItem) => inventoryItem.id === item.id);
        return product ? { ...item, price: product.price[pricingTier] } : item;
      }),
    );
    setQuoteItems((currentItems) =>
      currentItems.map((item) => {
        const product = inventoryDirectory.find((inventoryItem) => inventoryItem.id === item.id);
        return product ? { ...item, price: product.price[pricingTier] } : item;
      }),
    );
  }, [inventoryDirectory, pricingTier]);

  useEffect(() => {
    if (!visibleCustomers.length) {
      setSelectedQuoteCustomerId('');
      return;
    }

    const selectedCustomerStillVisible = visibleCustomers.some((customer) => customer.id === selectedQuoteCustomerId);
    if (!selectedCustomerStillVisible) {
      setSelectedQuoteCustomerId(visibleCustomers[0].id);
    }
  }, [visibleCustomers, selectedQuoteCustomerId]);

  const views = {
    dashboard: (
      <DashboardView
        recentActivity={visibleActivity}
        kpis={kpis}
        selectedBranch={selectedBranch}
        pricingTier={pricingTier}
        trendLabels={salesTrendLabels}
        trendSeries={trendSeries}
        branchPerformance={branchPerformance}
        activeBranchProfile={activeBranchProfile}
      />
    ),
    'system-setup': <SystemSetupView users={userDirectory} branchCount={Object.keys(branchProfiles).length} />,
    'master-data': (
      <MasterDataView
        activeTab={masterDataTab}
        onTabChange={setMasterDataTab}
        users={visibleUsers}
        activityLog={visibleUserActivity}
        deactivationRequests={visibleDeactivationRequests}
        canManageUsers={canManageUsers}
        onSaveUser={handleSaveUser}
        onChangeUserBranch={handleUserBranchAssignmentChange}
        onRequestDeactivation={handleRequestUserDeactivation}
        onUpdateDeactivationRequest={handleUpdateDeactivationRequest}
        suppliers={visibleSuppliers}
        purchaseOrders={visiblePurchaseOrders}
        canManageSuppliers={canManageSuppliers}
        onSaveSupplier={handleSaveSupplier}
        onChangeSupplierBranch={handleSupplierBranchChange}
        customers={visibleCustomers}
        pricingTier={pricingTier}
        products={visibleInventory}
        searchTerm={inventorySearch}
        onSearchChange={setInventorySearch}
        isAddModalOpen={isAddModalOpen}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onCloseAddModal={() => setIsAddModalOpen(false)}
        selectedBranch={selectedBranch}
      />
    ),
    'sales-operations': (
      <SalesOperationsView
        activeTab={salesOperationsTab}
        onTabChange={setSalesOperationsTab}
        products={visibleInventory}
        customers={visibleCustomers}
        quoteHistory={quoteHistoryItems}
        quoteItems={quoteItems}
        selectedBranch={selectedBranch}
        pricingTier={pricingTier}
        quoteNumber={activeQuoteNumber}
        selectedCustomerId={selectedQuoteCustomerId}
        selectedCustomer={selectedQuoteCustomer}
        onCustomerChange={setSelectedQuoteCustomerId}
        discountPercent={quoteDiscountPercent}
        onDiscountChange={setQuoteDiscountPercent}
        quoteNotes={quoteNotes}
        onNotesChange={setQuoteNotes}
        onAddToQuote={handleAddToQuote}
        onUpdateQuoteQuantity={handleUpdateQuoteQuantity}
        onUpdateQuotePrice={handleUpdateQuotePrice}
        onRemoveQuoteItem={handleRemoveQuoteItem}
        onSaveDraft={handleSaveQuoteDraft}
        onGenerateQuotation={handleGenerateQuotation}
        onConvertToSale={handleConvertQuoteToSale}
        onUpdateApprovalStatus={handleUpdateQuoteApprovalStatus}
        onLoadDraft={handleLoadQuoteDraft}
        quoteMessage={quoteMessage}
        cart={cart}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
        onCompleteSale={handleCompleteSale}
        successMessage={successMessage}
      />
    ),
    procurement: (
      <ProcurementView
        purchaseOrders={visiblePurchaseOrders}
        suppliers={visibleSuppliers}
        products={visibleInventory}
        selectedBranch={selectedBranch}
        pricingTier={pricingTier}
        sequenceBase={purchaseOrderDirectory.length + 41}
        currentUser={currentUser}
        canManageProcurement={canManageProcurement}
        onCreatePurchaseOrder={handleCreatePurchaseOrder}
        onUpdatePurchaseOrderStatus={handleUpdatePurchaseOrderStatus}
        onReceivePurchaseOrder={handleReceivePurchaseOrder}
      />
    ),
    'inventory-operations': (
      <InventoryOperationsView
        activeTab={inventoryOperationsTab}
        onTabChange={setInventoryOperationsTab}
        products={visibleInventory}
        pricingTier={pricingTier}
        searchTerm={inventorySearch}
        onSearchChange={setInventorySearch}
        isAddModalOpen={isAddModalOpen}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onCloseAddModal={() => setIsAddModalOpen(false)}
        selectedBranch={selectedBranch}
        pendingTransfers={visibleTransfers}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-transparent p-4 text-zinc-900 lg:p-6">
      <div className="mx-auto grid max-w-[1700px] gap-6 xl:grid-cols-[280px_1fr]">
        <div className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
          <Sidebar activeView={activeView} onChange={setActiveView} visibleViewIds={visibleViewIds} />
        </div>

        <main className="space-y-6">
          <TopBar
            selectedBranch={selectedBranch}
            pricingTier={pricingTier}
            onBranchChange={setSelectedBranch}
            onPricingTierChange={setPricingTier}
            activeBranchProfile={activeBranchProfile}
            users={userDirectory}
            currentUserId={currentUserId}
            onCurrentUserChange={setCurrentUserId}
            currentUser={currentUser}
          />
          {views[activeView]}
        </main>
      </div>
    </div>
  );
}

export default App;
