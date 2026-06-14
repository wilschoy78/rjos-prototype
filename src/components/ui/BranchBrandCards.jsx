/**
 * Renders branded branch cards for the active branch network.
 *
 * @param {object} props Component props.
 * @param {Array<object>} props.branches Branch profile records.
 * @param {string} props.selectedBranch Active branch key.
 * @returns {JSX.Element} Branch branding cards.
 */
function BranchBrandCards({ branches, selectedBranch }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {branches.map((branch) => {
        const isActive = selectedBranch === 'all' || selectedBranch === branch.key;

        return (
          <article
            key={branch.key}
            className={`rounded-2xl border p-5 transition ${
              isActive
                ? 'border-zinc-300 bg-white'
                : 'border-zinc-200 bg-zinc-50/80 opacity-80'
            }`}
            style={{
              boxShadow: isActive ? `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 24px ${branch.glow}` : undefined,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{branch.region}</p>
                <h4 className="mt-2 text-lg font-semibold text-zinc-950">{branch.label}</h4>
              </div>
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-semibold text-zinc-950"
                style={{
                  borderColor: `${branch.color}55`,
                  backgroundColor: `${branch.color}22`,
                }}
              >
                {branch.shortLabel.slice(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="mt-5 space-y-2 text-sm text-zinc-700">
              <p>{branch.city}</p>
              <p className="text-zinc-500">{branch.focus}</p>
            </div>

            <div className="mt-5 border-t border-zinc-200 pt-4">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Branch Lead</p>
              <p className="mt-2 text-sm font-medium text-zinc-950">{branch.manager}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default BranchBrandCards;
