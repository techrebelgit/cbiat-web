"use client";

import { useActionState, useId, useState, type ReactNode } from "react";
import { submitMembershipApplication, type MembershipFormState } from "@/app/actions/membership";

type Option = { value: string; label: string };

export type ApplicationCopy = {
  form: {
    organization: string;
    organizationPlaceholder: string;
    contactName: string;
    contactNamePlaceholder: string;
    role: string;
    rolePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    organizationType: string;
    organizationTypePlaceholder: string;
    organizationTypes: Option[];
    areas: string;
    areasHelp: string;
    areaOptions: Option[];
    message: string;
    messagePlaceholder: string;
    consent: string;
    submit: string;
    submitting: string;
    required: string;
    optional: string;
  };
  successTitle: string;
};

const initialState: MembershipFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export function MembershipApplicationForm({ copy, locale }: { copy: ApplicationCopy; locale: "es" | "en" }) {
  const [state, formAction, isPending] = useActionState(submitMembershipApplication, initialState);
  const honeypotId = useId();
  const [values, setValues] = useState({
    organization: "",
    contactName: "",
    role: "",
    email: "",
    phone: "",
    organizationType: "",
    areas: [] as string[],
    message: "",
    consent: false,
  });

  if (state.status === "success") {
    return (
      <div className="application-success" role="status">
        <span>✓</span>
        <h2>{copy.successTitle}</h2>
        <p>{state.message}</p>
      </div>
    );
  }

  const updateArea = (area: string, checked: boolean) => {
    setValues((current) => ({
      ...current,
      areas: checked ? [...current.areas, area] : current.areas.filter((item) => item !== area),
    }));
  };

  return (
    <form action={formAction} className="application-form" noValidate>
      <input type="hidden" name="locale" value={locale} suppressHydrationWarning />
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} name="website" type="text" tabIndex={-1} autoComplete="off" suppressHydrationWarning />
      </div>

      {state.status === "error" && state.message && (
        <div className="form-alert" role="alert">{state.message}</div>
      )}

      <div className="form-grid">
        <Field
          label={copy.form.organization}
          required={copy.form.required}
          error={state.fieldErrors.organization}
        >
          <input
            suppressHydrationWarning
            name="organization"
            value={values.organization}
            onChange={(e) => setValues({ ...values, organization: e.target.value })}
            placeholder={copy.form.organizationPlaceholder}
            maxLength={160}
            required
          />
        </Field>

        <Field
          label={copy.form.organizationType}
          required={copy.form.required}
          error={state.fieldErrors.organizationType}
        >
          <select
            suppressHydrationWarning
            name="organizationType"
            value={values.organizationType}
            onChange={(e) => setValues({ ...values, organizationType: e.target.value })}
            required
          >
            <option value="">{copy.form.organizationTypePlaceholder}</option>
            {copy.form.organizationTypes.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>

        <Field label={copy.form.contactName} required={copy.form.required} error={state.fieldErrors.contactName}>
          <input
            suppressHydrationWarning
            name="contactName"
            value={values.contactName}
            onChange={(e) => setValues({ ...values, contactName: e.target.value })}
            placeholder={copy.form.contactNamePlaceholder}
            maxLength={120}
            autoComplete="name"
            required
          />
        </Field>

        <Field label={copy.form.role} required={copy.form.required} error={state.fieldErrors.role}>
          <input
            suppressHydrationWarning
            name="role"
            value={values.role}
            onChange={(e) => setValues({ ...values, role: e.target.value })}
            placeholder={copy.form.rolePlaceholder}
            maxLength={120}
            autoComplete="organization-title"
            required
          />
        </Field>

        <Field label={copy.form.email} required={copy.form.required} error={state.fieldErrors.email}>
          <input
            suppressHydrationWarning
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            placeholder={copy.form.emailPlaceholder}
            maxLength={200}
            autoComplete="email"
            required
          />
        </Field>

        <Field label={copy.form.phone} optional={copy.form.optional}>
          <input
            suppressHydrationWarning
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => setValues({ ...values, phone: e.target.value })}
            placeholder={copy.form.phonePlaceholder}
            maxLength={60}
            autoComplete="tel"
          />
        </Field>
      </div>

      <fieldset className="areas-fieldset">
        <legend>{copy.form.areas} <small>{copy.form.required}</small></legend>
        <p>{copy.form.areasHelp}</p>
        <div className="areas-grid">
          {copy.form.areaOptions.map((option) => (
            <label className="check-card" key={option.value}>
              <input
            suppressHydrationWarning
                type="checkbox"
                name="areas"
                value={option.value}
                checked={values.areas.includes(option.value)}
                onChange={(e) => updateArea(option.value, e.target.checked)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {state.fieldErrors.areas && <p className="field-error">{state.fieldErrors.areas}</p>}
      </fieldset>

      <Field label={copy.form.message} required={copy.form.required} error={state.fieldErrors.message}>
        <textarea
          suppressHydrationWarning
          name="message"
          value={values.message}
          onChange={(e) => setValues({ ...values, message: e.target.value })}
          placeholder={copy.form.messagePlaceholder}
          rows={6}
          maxLength={2000}
          required
        />
      </Field>

      <label className="consent-row">
        <input
            suppressHydrationWarning
          type="checkbox"
          name="consent"
          checked={values.consent}
          onChange={(e) => setValues({ ...values, consent: e.target.checked })}
          required
        />
        <span>{copy.form.consent}</span>
      </label>
      {state.fieldErrors.consent && <p className="field-error">{state.fieldErrors.consent}</p>}

      <button className="button button-dark application-submit" type="submit" disabled={isPending} suppressHydrationWarning>
        {isPending ? copy.form.submitting : copy.form.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  required?: string;
  optional?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="form-field">
      <span>{label} <small>{required ?? optional}</small></span>
      {children}
      {error && <em className="field-error">{error}</em>}
    </label>
  );
}
