import { useState, useEffect } from 'react';

export default function ModuleCard({
  icon = '◆',
  title,
  description,
  status,
  statusTone = 'default',
  lockedOpen = false,
  children,
}) {
  const [open, setOpen] = useState(lockedOpen);
  const statusClass = statusTone === 'success' ? 'success' : statusTone === 'warning' ? 'warning' : '';

  useEffect(() => {
    if (lockedOpen) {
      setOpen(true);
    }
  }, [lockedOpen]);

  const handleToggle = () => {
    if (!lockedOpen) {
      setOpen((prev) => !prev);
    }
  };

  return (
    <article className={`module-card ${open ? 'is-open' : ''} ${lockedOpen ? 'is-locked-open' : ''}`}>
      <button
        type="button"
        className="module-card__summary"
        onClick={handleToggle}
        aria-expanded={open}
        aria-disabled={lockedOpen}
      >
        <div className="module-card__header">
          <div className="module-card__icon" aria-hidden="true">
            {icon}
          </div>
          <div className="module-card__copy">
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        <div className="module-card__meta">
          {status && <span className={`status-pill ${statusClass}`}>{status}</span>}
          {!lockedOpen && (
            <span className="module-card__chevron" aria-hidden="true">
              {open ? '▴' : '▾'}
            </span>
          )}
        </div>
      </button>
      <div className="module-card__body" aria-hidden={!open}>
        {children}
      </div>
    </article>
  );
}
