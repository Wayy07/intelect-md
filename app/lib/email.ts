import nodemailer from 'nodemailer';

// Email configuration object type
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  }
}

// Base email configuration
const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Order item type for the email template
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

// Order details for the email
interface OrderDetails {
  orderNumber: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  items: OrderItem[];
  total: number;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(orderDetails: OrderDetails) {
  // Format currency for email
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ro-MD') + ' MDL';
  };

  // Generate items HTML for email
  const itemsHTML = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaef;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaef; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaef; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaef; text-align: right;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  // Decide what address information to show based on payment method
  const isPickup = orderDetails.paymentMethod === 'Ridicare din magazin';
  const addressHTML = isPickup
    ? `
      <div style="margin-top: 15px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0 0 5px 0;"><strong>Adresa magazinului pentru ridicare:</strong></p>
        <p style="margin: 0 0 5px 0;">Intelect Store</p>
        <p style="margin: 0 0 5px 0;">Str. Ștefan cel Mare 1, Chișinău, Moldova</p>
        <p style="margin: 0;">Program: Luni-Vineri 9:00-18:00, Sâmbătă 10:00-16:00</p>
      </div>
    `
    : `<p><strong>Adresă livrare:</strong> ${orderDetails.customer.address}</p>`;

  // Create the HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmare comandă</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; padding: 20px; text-align: center; color: white; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #f3f4f6; }
        .order-info { margin-bottom: 20px; }
        .order-items { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .order-items th { padding: 10px; text-align: left; background-color: #f3f4f6; font-weight: 600; }
        .total { margin-top: 20px; text-align: right; font-weight: bold; }
        .thank-you { margin-top: 30px; font-size: 16px; color: #4f46e5; font-weight: bold; }
        .contact { margin-top: 20px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Confirmare comandă</h1>
        </div>
        <div class="content">
          <p>Salut <strong>${orderDetails.customer.name}</strong>,</p>
          <p>Îți mulțumim pentru comandă! Mai jos găsești detaliile comenzii tale:</p>

          <div class="order-info">
            <p><strong>Număr comandă:</strong> ${orderDetails.orderNumber}</p>
            <p><strong>Data:</strong> ${orderDetails.date}</p>
            <p><strong>Metodă de plată:</strong> ${orderDetails.paymentMethod}</p>
            ${addressHTML}
          </div>

          <h2>Produse comandate</h2>
          <table class="order-items">
            <thead>
              <tr>
                <th>Produs</th>
                <th style="text-align: center;">Cantitate</th>
                <th style="text-align: right;">Preț unitar</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="total">
            <p>Total: ${formatCurrency(orderDetails.total)}</p>
          </div>

          <p class="thank-you">Îți mulțumim pentru încredere!</p>

          <p class="contact">
            Dacă ai întrebări sau nelămuriri, nu ezita să ne contactezi la
            <a href="mailto:contact@intelect.md">contact@intelect.md</a> sau la numărul de telefon <a href="tel:+37378123456">+373 78 123 456</a>.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Intelect.md - Toate drepturile rezervate</p>
          <p>Acest email a fost trimis către ${orderDetails.customer.email} deoarece ai plasat o comandă pe site-ul nostru.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Email options
  const mailOptions = {
    from: `Intelect.md <${emailConfig.auth.user}>`,
    to: orderDetails.customer.email,
    subject: `Confirmare comandă #${orderDetails.orderNumber}`,
    html: htmlContent,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
