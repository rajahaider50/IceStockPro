import { useState, useEffect } from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A number input that behaves like professional apps:
 * - Shows empty instead of "0" so user can type freely
 * - No leading zeros ("0100" never happens)
 * - Selects all text on focus so typing replaces the value
 * - Falls back to 0 if left empty
 */
export default function NumberInput({ value, onChange, placeholder, className }: Props) {
  const [text, setText] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    // Keep in sync if value changes externally (e.g. editing a different item)
    setText(value === 0 ? '' : String(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value;

    // Allow only digits and a single decimal point
    raw = raw.replace(/[^0-9.]/g, '');

    // Strip leading zeros (but keep "0." for decimals like 0.5)
    if (raw.length > 1 && raw[0] === '0' && raw[1] !== '.') {
      raw = raw.replace(/^0+/, '');
    }

    // Prevent multiple decimal points
    const parts = raw.split('.');
    if (parts.length > 2) {
      raw = parts[0] + '.' + parts.slice(1).join('');
    }

    setText(raw);
    const num = parseFloat(raw);
    onChange(isNaN(num) ? 0 : num);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
  }

  function handleBlur() {
    if (text === '' || text === '.') {
      setText('');
      onChange(0);
    }
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder ?? '0'}
      className={className ?? 'input-field'}
    />
  );
}
