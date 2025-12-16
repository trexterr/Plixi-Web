export default function ToggleSwitch({ checked, onChange, label, description, disabled, className = '' }) {
  const rootClassName = ['toggle-switch', disabled ? 'is-disabled' : '', className].filter(Boolean).join(' ');

  return (
    <label className={rootClassName}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <span className="track">
        <span className="thumb" />
      </span>
      <span className="toggle-copy">
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
    </label>
  );
}
