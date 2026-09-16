"use server";

export type ConnectionFormValues = {
  organization: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  areas: string[];
  message: string;
  consent: boolean;
};

export type ConnectionFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<keyof ConnectionFormValues, string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const interestAreas = new Set([
  "ai-governance",
  "blockchain-digital-assets",
  "digital-identity",
  "public-sector-innovation",
  "talent-competitiveness",
  "education-research",
  "international-cooperation",
]);

function text(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanAreas(formData: FormData) {
  return formData
    .getAll("areas")
    .filter((value): value is string => typeof value === "string")
    .filter((value) => interestAreas.has(value));
}

export async function submitConnectionRegistration(
  _previousState: ConnectionFormState,
  formData: FormData,
): Promise<ConnectionFormState> {
  const locale = text(formData, "locale", 2) === "en" ? "en" : "es";
  const errors = locale === "en"
    ? {
        contactName: "Enter your name.",
        email: "Enter a valid email address.",
        areas: "Select at least one topic of interest.",
        consent: "We need your authorization to send you CBIAT information.",
        review: "Review the indicated fields and try again.",
        notConfigured: "The registration cannot be sent right now. Please try again later.",
        sendFailed: "The registration could not be sent. Please try again.",
        generic: "An error occurred while sending the registration. Please try again.",
        success: "Your registration was completed successfully. We will send news and invitations to the email address provided.",
      }
    : {
        contactName: "Ingrese su nombre.",
        email: "Ingrese un correo electrónico válido.",
        areas: "Seleccione al menos un tema de interés.",
        consent: "Necesitamos su autorización para enviarle información de CBIAT.",
        review: "Revise los campos indicados e intente nuevamente.",
        notConfigured: "No fue posible completar el registro en este momento. Intente nuevamente más tarde.",
        sendFailed: "No fue posible completar el registro. Por favor intente nuevamente.",
        generic: "Ocurrió un error al enviar el registro. Por favor intente nuevamente.",
        success: "Su registro se completó correctamente. Le enviaremos novedades e invitaciones al correo indicado.",
      };

  // Honeypot: bots tend to fill this visually hidden field.
  if (text(formData, "website", 200)) {
    return { status: "success", message: errors.success, fieldErrors: {} };
  }

  const organization = text(formData, "organization", 160);
  const contactName = text(formData, "contactName", 120);
  const role = text(formData, "role", 120);
  const email = text(formData, "email", 200).toLowerCase();
  const phone = text(formData, "phone", 60);
  const areas = cleanAreas(formData);
  const message = text(formData, "message", 2000);
  const consent = formData.get("consent") === "on";

  const fieldErrors: ConnectionFormState["fieldErrors"] = {};

  if (contactName.length < 2) fieldErrors.contactName = errors.contactName;
  if (!EMAIL_RE.test(email)) fieldErrors.email = errors.email;
  if (areas.length === 0) fieldErrors.areas = errors.areas;
  if (!consent) fieldErrors.consent = errors.consent;

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: errors.review, fieldErrors };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CBIAT_FORM_FROM_EMAIL;
  const to = process.env.CBIAT_FORM_TO_EMAIL || "info@cbiat.org";

  if (!apiKey || !from) {
    console.error("CBIAT connection form email is not configured. Missing RESEND_API_KEY or CBIAT_FORM_FROM_EMAIL.");
    return { status: "error", message: errors.notConfigured, fieldErrors: {} };
  }

  const labels: Record<string, string> = {
    "ai-governance": "IA y gobernanza",
    "blockchain-digital-assets": "Blockchain, tokenización y activos digitales",
    "digital-identity": "Identidad y soberanía digital",
    "public-sector-innovation": "Innovación y modernización del Estado",
    "talent-competitiveness": "Talento y competitividad tecnológica",
    "education-research": "Educación, investigación y estándares",
    "international-cooperation": "Innovación e internacionalización",
  };

  const areaText = areas.map((area) => labels[area] ?? area).join(", ");
  const safe = {
    organization: escapeHtml(organization || "No indicado"),
    contactName: escapeHtml(contactName),
    role: escapeHtml(role || "No indicado"),
    email: escapeHtml(email),
    phone: escapeHtml(phone || "No indicado"),
    areas: escapeHtml(areaText),
    message: escapeHtml(message || "Sin mensaje adicional").replaceAll("\n", "<br />"),
  };

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#102139">
      <div style="background:#061a38;color:white;padding:28px 32px;border-top:6px solid #dda62d">
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#dda62d">CBIAT Costa Rica</div>
        <h1 style="font-size:26px;margin:10px 0 0">Nuevo registro informativo</h1>
      </div>
      <div style="padding:32px;border:1px solid #d9dfe6;border-top:0">
        <p><strong>Nombre:</strong> ${safe.contactName}</p>
        <p><strong>Correo:</strong> ${safe.email}</p>
        <p><strong>Teléfono:</strong> ${safe.phone}</p>
        <p><strong>Organización:</strong> ${safe.organization}</p>
        <p><strong>Cargo / rol:</strong> ${safe.role}</p>
        <p><strong>Temas de interés:</strong> ${safe.areas}</p>
        <hr style="border:0;border-top:1px solid #d9dfe6;margin:28px 0" />
        <p><strong>Tema o actividad de interés:</strong></p>
        <p style="line-height:1.6">${safe.message}</p>
      </div>
    </div>
  `;

  const plainText = [
    "Nuevo registro informativo CBIAT",
    "",
    `Nombre: ${contactName}`,
    `Correo: ${email}`,
    `Teléfono: ${phone || "No indicado"}`,
    `Organización: ${organization || "No indicado"}`,
    `Cargo / rol: ${role || "No indicado"}`,
    `Temas de interés: ${areaText}`,
    "",
    "Tema o actividad de interés:",
    message || "Sin mensaje adicional",
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[CBIAT] Nuevo registro informativo — ${contactName}`,
        html,
        text: plainText,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend CBIAT connection email failed:", response.status, detail);
      return { status: "error", message: errors.sendFailed, fieldErrors: {} };
    }

    return { status: "success", message: errors.success, fieldErrors: {} };
  } catch (error) {
    console.error("CBIAT connection form submission failed:", error);
    return { status: "error", message: errors.generic, fieldErrors: {} };
  }
}
