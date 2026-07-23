import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="settings-section">
      <header className="settings-section__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      <div className="settings-section__content">{children}</div>
    </section>
  );
}

interface SettingRowProps {
  title: string;
  description: string;
  badge?: string;
  children: ReactNode;
}

export function SettingRow({
  title,
  description,
  badge,
  children,
}: SettingRowProps) {
  return (
    <div className="setting-row">
      <div className="setting-row__copy">
        <div className="setting-row__title">
          <strong>{title}</strong>
          {badge ? <span>{badge}</span> : null}
        </div>
        <p>{description}</p>
      </div>
      <div className="setting-row__control">{children}</div>
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleField({
  label,
  checked,
  disabled = false,
  onChange,
}: ToggleFieldProps) {
  return (
    <label className={`toggle-field ${disabled ? "is-disabled" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
      />
      <span className="toggle-field__track" aria-hidden="true">
        <span />
      </span>
      <span className="sr-only">{label}</span>
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string | number;
  disabled?: boolean;
  options: ReadonlyArray<{
    value: string | number;
    label: string;
  }>;
  onChange: (value: string) => void;
}

export function SelectField({
  label,
  value,
  disabled = false,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <select
      className="select-field"
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface ChoiceGroupProps<T extends string | number> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}

export function ChoiceGroup<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="choice-group">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          className={option.value === value ? "is-selected" : ""}
          key={option.value}
        >
          <input
            type="radio"
            name={label}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onCommit: (value: number) => void;
}

export function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onCommit,
}: RangeFieldProps) {
  const [draft, setDraft] = useState(value);
  const timerRef = useRef<number | undefined>(undefined);
  const latestDraftRef = useRef(value);
  const lastCommittedRef = useRef(value);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    latestDraftRef.current = value;
    lastCommittedRef.current = value;
    setDraft(value);
  }, [value]);

  function commit(next: number) {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    if (Object.is(lastCommittedRef.current, next)) {
      return;
    }

    lastCommittedRef.current = next;
    onCommitRef.current(next);
  }

  function schedule(next: number) {
    latestDraftRef.current = next;
    setDraft(next);

    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      commit(latestDraftRef.current);
    }, 160);
  }

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return (
    <div className="range-field">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={draft}
        onChange={(event) => schedule(Number(event.target.value))}
        onPointerUp={() => commit(latestDraftRef.current)}
        onKeyUp={() => commit(latestDraftRef.current)}
        onBlur={() => commit(latestDraftRef.current)}
      />
      <output>{`${draft}${suffix}`}</output>
    </div>
  );
}

interface ComingSoonPanelProps {
  phase: string;
  title: string;
  description: string;
  items: readonly string[];
}

export function ComingSoonPanel({
  phase,
  title,
  description,
  items,
}: ComingSoonPanelProps) {
  return (
    <section className="coming-soon-panel">
      <span className="coming-soon-panel__phase">{phase}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="coming-soon-panel__items" aria-label="后续功能范围">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    cancelButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }

      if (event.key === "Tab") {
        const focusable = [
          cancelButtonRef.current,
          confirmButtonRef.current,
        ].filter(
          (element): element is HTMLButtonElement =>
            element !== null && !element.disabled,
        );

        if (focusable.length === 0) {
          event.preventDefault();
          dialogRef.current?.focus();
          return;
        }

        const currentIndex = focusable.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        const nextIndex = event.shiftKey
          ? currentIndex <= 0
            ? focusable.length - 1
            : currentIndex - 1
          : currentIndex < 0 || currentIndex === focusable.length - 1
            ? 0
            : currentIndex + 1;

        event.preventDefault();
        focusable[nextIndex].focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [busy, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop">
      <section
        ref={dialogRef}
        className="confirm-dialog"
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <span className="confirm-dialog__mark" aria-hidden="true">
          !
        </span>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-description">{description}</p>
        <div className="confirm-dialog__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="button button--ghost"
            disabled={busy}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className="button button--danger"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "正在恢复…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
