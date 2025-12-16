import { useState } from 'react';

export default function ModuleCard({ icon = '◆', title, description, status, statusTone = 'default', children }) {
  const [open, setOpen] = useState(false);
  const statusClass = statusTone === 'success' ? 'success' : statusTone === 'warning' ? 'warning' : '';

  return (
    <article className={`module-card ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="module-card__summary"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
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
          <span className="module-card__chevron" aria-hidden="true">
            {open ? '▴' : '▾'}
          </span>
        </div>
      </button>
      <div className="module-card__body" aria-hidden={!open}>
        {children}
      </div>
    </article>
  );
}
