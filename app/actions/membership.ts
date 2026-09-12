"use server";

export type MembershipFormValues = {
  organization: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  organizationType: string;
  areas: string[];
  message: string;
  consent: boolean;
};

export type MembershipFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<Record<keyof MembershipFormValues, string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const organizationTypes = new Set([
  "company",
  "startup",
  "academia",
  "public-sector",
  "investor",
  "nonprofit",
  "professional",
  "other",
]);

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

export async function submitMembershipApplication(
  _previousState: MembershipFormState,
  formData: FormData,
): Promise<MembershipFormState> {
  // Honeypot: bots tend to fill this visually hidden field.
  if (text(formData, "website", 200)) {
    return {
      status: "success",
      message: "Gracias. Hemos recibido su solicitud.",
      fieldErrors: {},
    };
  }

  const locale = text(formData, "locale", 2) === "en" ? "en" : "es";
  const errors = locale === "en"
    ? {
        organization: "Enter the organization name.",
        contactName: "Enter the contact name.",
        role: "Enter your role or title.",
        email: "Enter a valid email address.",
        organizationType: "Select the organization type.",
        areas: "Select at least one area of interest.",
        message: "Tell us briefly why you would like to participate.",
        consent: "We need your permission to contact you.",
        review: "Review the indicated fields and try again.",
        notConfigured: "The request cannot be sent right now. Please try again later.",
        sendFailed: "The request could not be sent. Your information was not delivered; please try again.",
        generic: "An error occurred while sending the request. Please try again.",
        success: "Thank you. We received your request and the CBIAT team will contact you soon.",
      }
    : {
        organization: "Ingrese el nombre de la organización.",
        contactName: "Ingrese el nombre de contacto.",
        role: "Ingrese su cargo o rol.",
        email: "Ingrese un correo electrónico válido.",
        organizationType: "Seleccione el tipo de organización.",
        areas: "Seleccione al menos un área de interés.",
        message: "Cuéntenos brevemente por qué desea participar.",
        consent: "Necesitamos su autorización para contactarle.",
        review: "Revise los campos indicados e intente nuevamente.",
        notConfigured: "No fue posible enviar la solicitud en este momento. Intente nuevamente más tarde.",
        sendFailed: "No fue posible enviar la solicitud. Sus datos no se enviaron; por favor intente nuevamente.",
        generic: "Ocurrió un error al enviar la solicitud. Por favor intente nuevamente.",
        success: "Gracias. Hemos recibido su solicitud y el equipo de CBIAT le contactará próximamente.",
      };

  const organization = text(formData, "organization", 160);
  const contactName = text(formData, "contactName", 120);
  const role = text(formData, "role", 120);
  const email = text(formData, "email", 200).toLowerCase();
  const phone = text(formData, "phone", 60);
  const organizationType = text(formData, "organizationType", 60);
  const areas = cleanAreas(formData);
  const message = text(formData, "message", 2000);
  const consent = formData.get("consent") === "on";

  const fieldErrors: MembershipFormState["fieldErrors"] = {};

  if (organization.length < 2) fieldErrors.organization = errors.organization;
  if (contactName.length < 2) fieldErrors.contactName = errors.contactName;
  if (role.length < 2) fieldErrors.role = errors.role;
  if (!EMAIL_RE.test(email)) fieldErrors.email = errors.email;
  if (!organizationTypes.has(organizationType)) fieldErrors.organizationType = errors.organizationType;
  if (areas.length === 0) fieldErrors.areas = errors.areas;
  if (message.length < 10) fieldErrors.message = errors.message;
  if (!consent) fieldErrors.consent = errors.consent;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: errors.review,
      fieldErrors,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CBIAT_FORM_FROM_EMAIL;
  const to = process.env.CBIAT_FORM_TO_EMAIL || "info@cbiat.org";

  if (!apiKey || !from) {
    console.error("Membership form email is not configured. Missing RESEND_API_KEY or CBIAT_FORM_FROM_EMAIL.");
    return {
      status: "error",
      message: errors.notConfigured,
      fieldErrors: {},
    };
  }

  const labels: Record<string, string> = {
    company: "Empresa",
    startup: "Startup",
    academia: "Academia",
    "public-sector": "Sector público",
    investor: "Inversionista",
    nonprofit: "Organización sin fines de lucro",
    professional: "Profesional / independiente",
    other: "Otro",
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
    organization: escapeHtml(organization),
    contactName: escapeHtml(contactName),
    role: escapeHtml(role),
    email: escapeHtml(email),
    phone: escapeHtml(phone || "No indicado"),
    organizationType: escapeHtml(labels[organizationType] ?? organizationType),
    areas: escapeHtml(areaText),
    message: escapeHtml(message).replaceAll("\n", "<br />"),
  };

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#102139">
      <div style="background:#061a38;color:white;padding:28px 32px;border-top:6px solid #dda62d">
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#dda62d">CBIAT Costa Rica</div>
        <h1 style="font-size:26px;margin:10px 0 0">Nueva solicitud de afiliación</h1>
      </div>
      <div style="padding:32px;border:1px solid #d9dfe6;border-top:0">
        <p><strong>Organización:</strong> ${safe.organization}</p>
        <p><strong>Contacto:</strong> ${safe.contactName}</p>
        <p><strong>Cargo / rol:</strong> ${safe.role}</p>
        <p><strong>Correo:</strong> ${safe.email}</p>
        <p><strong>Teléfono:</strong> ${safe.phone}</p>
        <p><strong>Tipo de organización:</strong> ${safe.organizationType}</p>
        <p><strong>Áreas de interés:</strong> ${safe.areas}</p>
        <hr style="border:0;border-top:1px solid #d9dfe6;margin:28px 0" />
        <p><strong>Motivo / mensaje:</strong></p>
        <p style="line-height:1.6">${safe.message}</p>
      </div>
    </div>
  `;

  const plainText = [
    "Nueva solicitud de afiliación CBIAT",
    "",
    `Organización: ${organization}`,
    `Contacto: ${contactName}`,
    `Cargo / rol: ${role}`,
    `Correo: ${email}`,
    `Teléfono: ${phone || "No indicado"}`,
    `Tipo de organización: ${labels[organizationType] ?? organizationType}`,
    `Áreas de interés: ${areaText}`,
    "",
    "Motivo / mensaje:",
    message,
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
        subject: `[CBIAT] Solicitud de afiliación — ${organization}`,
        html,
        text: plainText,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend membership email failed:", response.status, detail);
      return {
        status: "error",
        message: errors.sendFailed,
        fieldErrors: {},
      };
    }

    return {
      status: "success",
      message: errors.success,
      fieldErrors: {},
    };
  } catch (error) {
    console.error("Membership form submission failed:", error);
    return {
      status: "error",
      message: errors.generic,
      fieldErrors: {},
    };
  }
}
