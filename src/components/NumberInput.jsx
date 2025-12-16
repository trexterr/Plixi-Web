import { forwardRef, useEffect, useState } from 'react';

const NumberInput = forwardRef(function NumberInput({ value, onChange, fallback, suffix, className = '', ...props }, ref) {
  const fallbackValue = typeof fallback === 'number' ? fallback : typeof props.min === 'number' ? Number(props.min) : 0;
  const [draft, setDraft] = useState(value ?? fallbackValue);

  useEffect(() => {
    if (value === '' || value === null || typeof value === 'undefined') {
      setDraft('');
    } else {
      setDraft(value);
    }
  }, [value]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setDraft(nextValue);

    if (nextValue === '' || nextValue === '-' || nextValue === '+') {
      return;
    }

    const parsed = Number(nextValue);
    if (!Number.isNaN(parsed)) {
      onChange?.(parsed);
    }
  };

  const handleBlur = () => {
    if (draft === '' || draft === null || typeof draft === 'undefined') {
      setDraft(fallbackValue);
      onChange?.(fallbackValue);
    }
  };

  const content = (
    <input
      {...props}
      ref={ref}
      type="number"
      value={draft === null || typeof draft === 'undefined' ? '' : draft}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );

  if (!suffix) {
    return content;
  }

  return (
    <div className={`number-input ${className}`}>
      {content}
      <span className="number-input__suffix">{suffix}</span>
    </div>
  );
});

export default NumberInput;
