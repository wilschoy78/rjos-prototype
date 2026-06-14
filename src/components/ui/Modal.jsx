import { X } from 'lucide-react';

/**
 * Renders a generic modal shell for mock user actions.
 *
 * @param {object} props Component props.
 * @param {string} props.title Modal title.
 * @param {string} props.description Modal description text.
 * @param {() => void} props.onClose Closes the modal.
 * @param {React.ReactNode} props.children Modal body content.
 * @returns {JSX.Element} Modal overlay.
 */
function Modal({ title, description, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-zinc-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 p-2 text-zinc-500 transition hover:border-brand-300 hover:text-brand-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
