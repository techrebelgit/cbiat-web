"use client";

import { useId, useRef } from "react";
import {
  MembershipApplicationForm,
  type ApplicationCopy,
} from "@/components/membership-application-form";

type ModalCopy = ApplicationCopy & {
  kicker: string;
  title: string;
  intro: string;
  noteTitle: string;
  noteBody: string;
};

export function MembershipApplicationModal({
  copy,
  locale,
  triggerLabel,
  triggerClassName = "button button-dark",
  showArrow = false,
}: {
  copy: ModalCopy;
  locale: "es" | "en";
  triggerLabel: string;
  triggerClassName?: string;
  showArrow?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className={triggerClassName} onClick={open}>
        {triggerLabel}{showArrow ? " ↗" : ""}
      </button>

      <dialog
        ref={dialogRef}
        className="membership-modal"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="membership-modal-card">
          <button
            type="button"
            className="modal-close"
            onClick={close}
            aria-label={locale === "es" ? "Cerrar formulario" : "Close form"}
          >
            ×
          </button>

          <div className="membership-modal-intro">
            <p className="kicker">{copy.kicker}</p>
            <h2 id={titleId}>{copy.title}</h2>
            <p>{copy.intro}</p>
            <div className="application-note">
              <strong>{copy.noteTitle}</strong>
              <span>{copy.noteBody}</span>
            </div>
          </div>

          <MembershipApplicationForm copy={copy} locale={locale} />
        </div>
      </dialog>
    </>
  );
}
