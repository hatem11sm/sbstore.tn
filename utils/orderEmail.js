const RESEND_ENDPOINT = "https://api.resend.com/emails";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} Dt`;

const buildOrderEmailHtml = (order) => {
  const rows = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.price)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
      <h1 style="font-size:24px;margin-bottom:8px;">Merci pour votre commande</h1>
      <p style="margin-top:0;color:#4b5563;">
        Votre commande <strong>${order.orderNumber}</strong> a bien été enregistrée.
      </p>
      <p style="color:#4b5563;">
        Mode de paiement: <strong>${order.paymentMethodLabel}</strong><br />
        Statut paiement: <strong>${order.paymentStatusLabel}</strong>
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;">Produit</th>
            <th style="text-align:center;padding-bottom:8px;">Qté</th>
            <th style="text-align:right;padding-bottom:8px;">Prix</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:24px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;">Sous-total: <strong>${formatCurrency(order.subtotal)}</strong></p>
        <p style="margin:0 0 8px;">Livraison: <strong>${formatCurrency(order.shippingFee)}</strong></p>
        <p style="margin:0 0 8px;">Remise: <strong>-${formatCurrency(order.discount)}</strong></p>
        <p style="margin:0;font-size:18px;">Total: <strong>${formatCurrency(order.total)}</strong></p>
      </div>
    </div>
  `;
};

const buildInternalOrderHtml = ({ order, heading, intro }) => {
  const vendorRows = (order.vendorBreakdown || [])
    .map(
      (vendor) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${vendor.vendorName}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${vendor.itemCount}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(vendor.subtotal)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
      <h1 style="font-size:24px;margin-bottom:8px;">${heading}</h1>
      <p style="margin-top:0;color:#4b5563;">${intro}</p>
      <div style="margin-top:20px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;">Commande: <strong>${order.orderNumber}</strong></p>
        <p style="margin:0 0 8px;">Client: <strong>${order.customer?.fullName || "N/A"}</strong></p>
        <p style="margin:0 0 8px;">Téléphone: <strong>${order.customer?.phoneNumber || "N/A"}</strong></p>
        <p style="margin:0 0 8px;">Paiement: <strong>${order.paymentMethodLabel}</strong></p>
        <p style="margin:0;">Total: <strong>${formatCurrency(order.total)}</strong></p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;">Boutique</th>
            <th style="text-align:center;padding-bottom:8px;">Articles</th>
            <th style="text-align:right;padding-bottom:8px;">Sous-total</th>
          </tr>
        </thead>
        <tbody>${vendorRows}</tbody>
      </table>
    </div>
  `;
};

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from || !to?.length) {
    return {
      sent: false,
      skipped: true,
      reason: "Email provider not configured",
    };
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email sending failed: ${errorText}`);
  }

  return {
    sent: true,
  };
};

export const sendOrderConfirmationEmail = async (order) => {
  const to = order?.customer?.email;

  if (!to) {
    return {
      sent: false,
      skipped: true,
      reason: "Customer email missing",
    };
  }

  return sendEmail({
    to: [to],
    subject: `Confirmation de commande ${order.orderNumber}`,
    html: buildOrderEmailHtml(order),
  });
};

export const sendAdminOrderNotification = async (order, adminEmails = []) => {
  if (!adminEmails.length) {
    return {
      sent: false,
      skipped: true,
      reason: "No admin recipients",
    };
  }

  return sendEmail({
    to: adminEmails,
    subject: `Nouvelle commande ${order.orderNumber}`,
    html: buildInternalOrderHtml({
      order,
      heading: "Nouvelle commande reçue",
      intro: "Une nouvelle commande vient d’être créée sur la marketplace.",
    }),
  });
};

export const sendVendorOrderNotifications = async (
  order,
  vendorRecipients = []
) => {
  if (!vendorRecipients.length) {
    return {
      sent: false,
      skipped: true,
      reason: "No vendor recipients",
    };
  }

  return Promise.all(
    vendorRecipients.map(({ email, vendorName }) =>
      sendEmail({
        to: [email],
        subject: `Nouvelle commande pour ${vendorName} - ${order.orderNumber}`,
        html: buildInternalOrderHtml({
          order,
          heading: `Nouvelle commande pour ${vendorName}`,
          intro:
            "Une commande contenant des articles de votre boutique vient d’être confirmée.",
        }),
      })
    )
  );
};
