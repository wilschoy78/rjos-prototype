import { BarChart3, Boxes, LayoutGrid, PackageSearch, Settings2, ShoppingCart } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'master-data', label: 'Master Data', icon: Settings2 },
  { id: 'sales-operations', label: 'Sales Operations', icon: ShoppingCart },
  { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
  { id: 'inventory-operations', label: 'Inventory Ops', icon: Boxes },
  { id: 'system-setup', label: 'System Setup', icon: PackageSearch },
];

/**
 * Renders the main dashboard navigation for switching demo views.
 *
 * @param {object} props Component props.
 * @param {string} props.activeView Active view identifier.
 * @param {(view: string) => void} props.onChange Updates the active view.
 * @param {string[]} props.visibleViewIds Visible view identifiers for the current RBAC scope.
 * @returns {JSX.Element} Sidebar navigation.
 */
function Sidebar({ activeView, onChange, visibleViewIds }) {
  return (
    <aside className="panel flex h-full flex-col gap-6 p-5">
      <div className="flex items-center gap-3 border-b border-zinc-200 pb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-brand-200 bg-brand-50 text-brand-700">
          <div className="flex flex-col items-center leading-none">
            <span className="text-sm font-semibold tracking-[0.28em]">RJO</span>
            <BarChart3 size={16} className="mt-1" />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">RJO Industrial</p>
          <h1 className="text-lg font-semibold text-zinc-950">Operations Cloud</h1>
          <p className="mt-1 text-xs text-zinc-500">Role-based operational workspace</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems
          .filter((item) => visibleViewIds.includes(item.id))
          .map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-brand-300 bg-brand-50 text-brand-800'
                  : 'border-transparent bg-white text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-brand-600' : 'text-zinc-400'} />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        <p className="font-medium text-zinc-950">Simplified Process</p>
        <p className="mt-2 leading-6 text-zinc-500">
          SuperAdmin and Admin own setup, while branch teams move through sales, procurement, inventory, transfers, and receiving from grouped workspaces.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
