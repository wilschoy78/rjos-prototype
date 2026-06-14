import { useMemo, useState } from 'react';
import { Activity, CheckCheck, KeyRound, Pencil, ShieldCheck, UserPlus, UsersRound, XCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { branches, rolePermissionMatrix } from '../../data/mockData';
import { formatBranchLabel } from '../../utils/format';

const USER_STATUS_STYLES = {
  active: 'border-green-200 bg-green-50 text-signal-500',
  suspended: 'border-brand-200 bg-brand-50 text-brand-700',
  invited: 'border-sky-200 bg-sky-50 text-sky-700',
  deactivated: 'border-zinc-300 bg-zinc-100 text-zinc-600',
};

const DEACTIVATION_STATUS_STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  review: 'border-sky-200 bg-sky-50 text-sky-700',
  approved: 'border-green-200 bg-green-50 text-signal-500',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
};

/**
 * Renders the user management module with branch-aware account listings.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.users Visible system users.
 * @param {Array<object>} props.activityLog Visible user activity entries.
 * @param {Array<object>} props.deactivationRequests Visible user deactivation requests.
 * @param {boolean} props.canManageUsers Determines whether admin user actions are enabled.
 * @param {(formValues: object, editingUserId: string | null) => void} props.onSaveUser Saves a user profile.
 * @param {(id: string, branch: string) => void} props.onChangeUserBranch Updates a user's branch assignment.
 * @param {(userId: string) => void} props.onRequestDeactivation Raises a deactivation request.
 * @param {(id: string, status: 'pending'|'review'|'approved'|'rejected') => void} props.onUpdateDeactivationRequest Updates a deactivation request state.
 * @returns {JSX.Element} User management view.
 */
function UsersView({
  users,
  activityLog,
  deactivationRequests,
  canManageUsers,
  onSaveUser,
  onChangeUserBranch,
  onRequestDeactivation,
  onUpdateDeactivationRequest,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    role: 'Sales Encoder',
    branch: 'cebu',
    department: 'Sales',
    status: 'invited',
  });
  const activeCount = users.filter((user) => user.status === 'active').length;
  const pendingDeactivationCount = deactivationRequests.filter((request) => request.status !== 'approved').length;
  const totalPermissionEntries = useMemo(
    () => rolePermissionMatrix.reduce((sum, role) => sum + role.permissions.length, 0),
    [],
  );
  const openRequestsByUser = useMemo(
    () =>
      deactivationRequests.reduce((map, request) => {
        if (['pending', 'review'].includes(request.status)) {
          map[request.userId] = true;
        }
        return map;
      }, {}),
    [deactivationRequests],
  );

  /**
   * Opens the modal for creating a new user.
   */
  function handleOpenAddModal() {
    setEditingUserId(null);
    setFormValues({
      name: '',
      email: '',
      role: 'Sales Encoder',
      branch: 'cebu',
      department: 'Sales',
      status: 'invited',
    });
    setIsModalOpen(true);
  }

  /**
   * Opens the modal for editing an existing user.
   *
   * @param {object} user User record.
   */
  function handleOpenEditModal(user) {
    setEditingUserId(user.id);
    setFormValues({
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      department: user.department,
      status: user.status,
    });
    setIsModalOpen(true);
  }

  /**
   * Saves the mock user form into the local demo state.
   */
  function handleSaveUser() {
    if (!formValues.name || !formValues.email) {
      return;
    }

    onSaveUser(formValues, editingUserId);
    setIsModalOpen(false);
  }

  return (
    <section className="space-y-5">
      <article className="panel p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] text-zinc-500">User Management</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Accounts, roles, and branch access controls</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              {users.length} total accounts
            </span>
            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] text-signal-500">
              {activeCount} active
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700">
              {pendingDeactivationCount} deactivation approvals open
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <ShieldCheck size={16} />
              <p className="text-sm font-medium text-zinc-950">Role Governance</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Branch managers, inventory controllers, sales encoders, and finance officers are separated by access scope.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <KeyRound size={16} />
              <p className="text-sm font-medium text-zinc-950">Access Coverage</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              User access can be limited to inventory, quotations, POS, or full branch operations based on role.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
            <div className="flex items-center gap-2 text-brand-700">
              <UserPlus size={16} />
              <p className="text-sm font-medium text-zinc-950">Onboarding Flow</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">
              Invited users remain pending until branch onboarding and permission review are completed.
            </p>
          </div>
        </div>
      </article>

      <article className="panel p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-[13px] text-zinc-500">Role Permission Matrix</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Access coverage by role</h3>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
            {totalPermissionEntries} permission mappings
          </span>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {rolePermissionMatrix.map((role) => (
            <div key={role.role} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="flex items-center gap-2">
                <UsersRound size={16} className="text-brand-700" />
                <p className="text-sm font-medium text-zinc-950">{role.role}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-[13px] text-zinc-500">Accounts Directory</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Branch user registry</h3>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            disabled={!canManageUsers}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition ${
              canManageUsers ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-zinc-300'
            }`}
          >
            <UserPlus size={15} />
            Add User
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-700">
            <thead>
              <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Branch</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3 pr-4">Access Level</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-200 last:border-b-0">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-zinc-950">{user.name}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{user.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-700">{user.role}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={user.branch}
                      disabled={!canManageUsers}
                      onChange={(event) => onChangeUserBranch(user.id, event.target.value)}
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
                  <td className="py-3 pr-4 text-[13px] text-zinc-500">{user.department}</td>
                  <td className="py-3 pr-4 text-[13px] text-zinc-500">{user.accessLevel}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                        USER_STATUS_STYLES[user.status]
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={!canManageUsers}
                        onClick={() => handleOpenEditModal(user)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                          canManageUsers
                            ? 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:text-brand-700'
                            : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={!canManageUsers || openRequestsByUser[user.id] || user.status === 'deactivated'}
                        onClick={() => onRequestDeactivation(user.id)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                          !canManageUsers || openRequestsByUser[user.id] || user.status === 'deactivated'
                            ? 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                            : 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:text-brand-700'
                        }`}
                      >
                        <XCircle size={12} />
                        {openRequestsByUser[user.id] ? 'Queued' : user.status === 'deactivated' ? 'Removed' : 'Deactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[13px] text-zinc-500">Deactivation Approval Queue</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Approval-based account removal flow</h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              {deactivationRequests.length} requests in scope
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {deactivationRequests.length ? (
              deactivationRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-950">{request.userName}</p>
                      <p className="mt-0.5 text-[13px] text-zinc-500">
                        Requested by {request.requestedBy} on {request.requestedAt}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                        DEACTIVATION_STATUS_STYLES[request.status]
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <p className="mt-3 text-[13px] leading-5 text-zinc-600">{request.reason}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {request.status === 'pending' ? (
                      <button
                        type="button"
                        disabled={!canManageUsers}
                        onClick={() => onUpdateDeactivationRequest(request.id, 'review')}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                          canManageUsers
                            ? 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:text-brand-700'
                            : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        <Activity size={12} />
                        Move To Review
                      </button>
                    ) : null}
                    {request.status !== 'approved' && request.status !== 'rejected' ? (
                      <>
                        <button
                          type="button"
                          disabled={!canManageUsers}
                          onClick={() => onUpdateDeactivationRequest(request.id, 'approved')}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                            canManageUsers
                              ? 'border-green-200 bg-green-50 text-signal-500 hover:border-green-300'
                              : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                          }`}
                        >
                          <CheckCheck size={12} />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={!canManageUsers}
                          onClick={() => onUpdateDeactivationRequest(request.id, 'rejected')}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                            canManageUsers
                              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300'
                              : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                          }`}
                        >
                          <XCircle size={12} />
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
                No deactivation requests are visible for the active branch scope.
              </div>
            )}
          </div>
        </article>

        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[13px] text-zinc-500">User Activity Audit Log</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Administrative and branch access trail</h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700">
              {activityLog.length} events in scope
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-zinc-700">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  <th className="pb-3 pr-4">Actor</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Branch</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activityLog.map((entry) => (
                  <tr key={entry.id} className="border-b border-zinc-200 last:border-b-0">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-zinc-950">{entry.actor}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        {users.find((user) => user.id === entry.userId)?.name ?? 'Branch-scope account'}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-zinc-700">{entry.action}</td>
                    <td className="py-3 pr-4 text-[13px] text-zinc-500">{formatBranchLabel(entry.branch)}</td>
                    <td className="py-3 text-[13px] text-zinc-500">{entry.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {isModalOpen ? (
        <Modal
          title={editingUserId ? 'Edit User Account' : 'Add User Account'}
          description="Mock administration flow for maintaining user identities, branch assignment, and role access."
          onClose={() => setIsModalOpen(false)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="control"
              placeholder="Full name"
              value={formValues.name}
              onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="control"
              placeholder="Email address"
              value={formValues.email}
              onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
            />
            <select
              className="control"
              value={formValues.role}
              onChange={(event) => setFormValues((current) => ({ ...current, role: event.target.value }))}
            >
              {rolePermissionMatrix.map((role) => (
                <option key={role.role} value={role.role}>
                  {role.role}
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
              placeholder="Department"
              value={formValues.department}
              onChange={(event) => setFormValues((current) => ({ ...current, department: event.target.value }))}
            />
            <select
              className="control"
              value={formValues.status}
              onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="invited">Invited</option>
            </select>
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
              disabled={!canManageUsers}
              onClick={handleSaveUser}
              className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                canManageUsers ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-zinc-300'
              }`}
            >
              Save User
            </button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

export default UsersView;
