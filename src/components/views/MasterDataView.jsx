import { Boxes, Building2, ShieldCheck, Users2 } from 'lucide-react';
import CustomersView from './CustomersView';
import InventoryView from './InventoryView';
import SuppliersView from './SuppliersView';
import UsersView from './UsersView';

const TABS = [
  { id: 'users', label: 'Users', icon: ShieldCheck },
  { id: 'suppliers', label: 'Suppliers', icon: Building2 },
  { id: 'customers', label: 'Customers', icon: Users2 },
  { id: 'products', label: 'Products', icon: Boxes },
];

/**
 * Renders the grouped master-data workspace for setup and administration.
 *
 * @param {object} props Component props.
 * @param {string} props.activeTab Active master data tab identifier.
 * @param {(tab: string) => void} props.onTabChange Updates the active master data tab.
 * @param {Array<object>} props.users Visible user records.
 * @param {Array<object>} props.activityLog Visible audit log entries.
 * @param {Array<object>} props.deactivationRequests Visible deactivation requests.
 * @param {boolean} props.canManageUsers Enables user administration actions.
 * @param {(formValues: object, editingUserId: string | null) => void} props.onSaveUser Saves a user profile.
 * @param {(id: string, branch: string) => void} props.onChangeUserBranch Updates user branch assignment.
 * @param {(userId: string) => void} props.onRequestDeactivation Raises a deactivation request.
 * @param {(id: string, status: string) => void} props.onUpdateDeactivationRequest Updates deactivation status.
 * @param {Array<object>} props.suppliers Visible supplier records.
 * @param {Array<object>} props.purchaseOrders Visible purchase orders for supplier history.
 * @param {boolean} props.canManageSuppliers Enables supplier administration actions.
 * @param {(formValues: object, editingSupplierId: string | null) => void} props.onSaveSupplier Saves a supplier record.
 * @param {(id: string, branch: string) => void} props.onChangeSupplierBranch Updates supplier branch assignment.
 * @param {Array<object>} props.customers Visible customer records.
 * @param {string} props.pricingTier Active pricing tier.
 * @param {Array<object>} props.products Visible inventory product records.
 * @param {string} props.searchTerm Inventory search term.
 * @param {(value: string) => void} props.onSearchChange Updates the product search term.
 * @param {boolean} props.isAddModalOpen Controls the add product modal.
 * @param {() => void} props.onOpenAddModal Opens the add product modal.
 * @param {() => void} props.onCloseAddModal Closes the add product modal.
 * @param {string} props.selectedBranch Active branch filter.
 * @returns {JSX.Element} Master data workspace.
 */
function MasterDataView({
  activeTab,
  onTabChange,
  users,
  activityLog,
  deactivationRequests,
  canManageUsers,
  onSaveUser,
  onChangeUserBranch,
  onRequestDeactivation,
  onUpdateDeactivationRequest,
  suppliers,
  purchaseOrders,
  canManageSuppliers,
  onSaveSupplier,
  onChangeSupplierBranch,
  customers,
  pricingTier,
  products,
  searchTerm,
  onSearchChange,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  selectedBranch,
}) {
  const tabContent = {
    users: (
      <UsersView
        users={users}
        activityLog={activityLog}
        deactivationRequests={deactivationRequests}
        canManageUsers={canManageUsers}
        onSaveUser={onSaveUser}
        onChangeUserBranch={onChangeUserBranch}
        onRequestDeactivation={onRequestDeactivation}
        onUpdateDeactivationRequest={onUpdateDeactivationRequest}
      />
    ),
    suppliers: (
      <SuppliersView
        suppliers={suppliers}
        purchaseOrders={purchaseOrders}
        canManageSuppliers={canManageSuppliers}
        onSaveSupplier={onSaveSupplier}
        onChangeSupplierBranch={onChangeSupplierBranch}
      />
    ),
    customers: <CustomersView customers={customers} pricingTier={pricingTier} />,
    products: (
      <InventoryView
        products={products}
        pricingTier={pricingTier}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        isModalOpen={isAddModalOpen}
        onOpenModal={onOpenAddModal}
        onCloseModal={onCloseAddModal}
        selectedBranch={selectedBranch}
        showAddProductAction
        sectionLabel="Master Data"
        sectionTitle="Product catalog and commercial item setup"
      />
    ),
  };

  return (
    <section className="space-y-5">
      <article className="panel p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-zinc-500">Master Data</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">SuperAdmin and Admin setup workspace</h3>
            <p className="mt-2 max-w-3xl text-sm leading-5 text-zinc-500">
              Maintain users, suppliers, customers, and products in one place before branch operations start.
            </p>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            Setup once, reuse across every branch workflow
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

export default MasterDataView;
