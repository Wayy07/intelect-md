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
  paymentMethodType?: string;
  isCredit?: boolean;
  financingTerm?: number;
  items: OrderItem[];
  total: number;
  shippingFee: number;
  trackingNumber?: string;  // Added for shipping emails
  trackingUrl?: string;     // Added for shipping emails
  estimatedDeliveryDate?: string; // Added for shipping emails
  shippingMethod?: string;   // Added for shipping emails
}

// Define a minimal type for the Prisma order item structure
interface PrismaOrderItem {
  quantity: number;
  price: number;
  name?: string;
  code?: string;
  product?: {
    name: string;
  };
}

interface OrderItemWithTotal extends OrderItem {
  total: number;
}

/**
 * Convert Prisma order model to OrderDetails format
 */
function convertPrismaOrderToEmailFormat(order: any): OrderDetails {
  console.log('Converting Prisma order to email format:', order.orderNumber);

  // Handle null/undefined gracefully
  const firstName = order.customer?.firstName || '';
  const lastName = order.customer?.lastName || '';

  // Create a formatted date string
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = createdAt.toLocaleDateString('ro-MD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Build the order details object
  return {
    orderNumber: order.orderNumber || 'Unknown',
    date: formattedDate,
    customer: {
      name: `${firstName} ${lastName}`.trim() || 'Client',
      email: order.customer?.email || '',
      phone: order.customer?.phone || '',
      address: order.customer?.address || ''
    },
    paymentMethod: order.paymentMethod || 'Unknown',
    paymentMethodType: order.paymentMethod?.toLowerCase() || 'unknown',
    isCredit: order.paymentMethod === 'CREDIT',
    financingTerm: order.financingTerm || 12,
    items: Array.isArray(order.items) ? order.items.map((item: PrismaOrderItem) => ({
      name: item.name || 'Produs', // Direct access name without product relation
      quantity: item.quantity || 1,
      price: item.price || 0,
      total: (item.price || 0) * (item.quantity || 1)
    })) : [],
    total: order.total || 0,
    shippingFee: 0, // Default shipping fee if not available
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    shippingMethod: order.shippingMethod
  };
}

/**
 * Send order confirmation email - accepts either OrderDetails or Prisma order
 */
export async function sendOrderConfirmation(orderData: any) {
  // Convert Prisma order to our format if needed
  const orderDetails = orderData.orderNumber && orderData.items && orderData.customer
    ? convertPrismaOrderToEmailFormat(orderData)
    : orderData;

  // Format currency for email
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ro-MD') + ' MDL';
  };

  // Get payment method type
  const paymentMethodType = orderDetails.paymentMethodType || '';
  const isCredit = orderDetails.isCredit || paymentMethodType === 'credit' || orderDetails.paymentMethod?.toLowerCase() === 'credit';
  const isPickup = paymentMethodType === 'pickup' || orderDetails.paymentMethod?.toLowerCase() === 'pickup';
  const isCash = paymentMethodType === 'cash' || orderDetails.paymentMethod?.toLowerCase() === 'cash';

  // Subject line based on payment method
  let emailSubject = `Confirmare comandă #${orderDetails.orderNumber}`;
  if (isCredit) {
    emailSubject = `Confirmare solicitare credit #${orderDetails.orderNumber}`;
  }

  // Get financing term if credit
  const financingTerm = orderDetails.financingTerm || 12;
  const monthlyPayment = Math.round(orderDetails.total / financingTerm);

  // Create the HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isCredit ? 'Solicitare credit' : 'Confirmare comandă'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .header { background-color: #000; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .success-icon {
          background-color: #000;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 40px;
          text-align: center;
          line-height: 80px;
        }
        .success-message { text-align: center; margin-bottom: 30px; }
        .order-details { background-color: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 24px; margin-bottom: 24px; }
        .order-number { display: inline-block; padding: 6px 12px; background-color: #000; color: white; border-radius: 20px; font-size: 14px; font-weight: 500; }
        .badge { display: inline-block; padding: 3px 6px; border-radius: 12px; font-size: 12px; background-color: rgba(99, 102, 241, 0.1); color: #4f46e5; }
        .info-box { padding: 16px; border-radius: 8px; margin-bottom: 16px; background-color: #f3f4f6; border: 1px solid #e5e7eb; }
        .divider { border-top: 1px solid #e5e7eb; margin: 16px 0; }
        .item-row { padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
        .footer { padding: 20px; text-align: center; background-color: #f3f4f6; color: #6b7280; font-size: 12px; }
        .btn { display: inline-block; background-color: #000; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 24px; }
        .payment-info { background-color: #f8f9ff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 16px; margin-bottom: 16px; }
        .term-highlight { background-color: #ede9fe; color: #4f46e5; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">${isCredit ? `Solicitare credit înregistrată${financingTerm ? ` (${financingTerm} luni)` : ''}` : 'Comanda a fost plasată cu succes'}</h1>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Success message -->
          <div class="success-message">
            <div class="success-icon" style="text-align: center;">
              <span style="display: inline-block; line-height: 80px; width: 100%; text-align: center;">✓</span>
            </div>
            <h2 style="font-size: 22px; margin-bottom: 16px;">
              ${isCredit ? `Solicitarea de credit pentru ${financingTerm} luni înregistrată!` : 'Comanda a fost plasată cu succes!'}
            </h2>
            <p style="color: #6b7280; margin-bottom: 24px;">
              ${isCredit
                ? 'Îți mulțumim pentru solicitarea de credit. Vei fi contactat în curând pentru a continua procesul.'
                : 'Îți mulțumim pentru comandă. Mai jos găsești detaliile comenzii tale.'}
            </p>
          </div>

          <!-- Order details -->
          <div class="order-details">
            <!-- Order number and heading -->
            <table width="100%" style="margin-bottom: 16px;">
              <tr>
                <td>
                  <h3 style="margin: 0; font-size: 18px;">${isCredit ? 'Detalii solicitare' : 'Detalii comandă'}</h3>
                </td>
                <td align="right">
                  <span class="order-number">${orderDetails.orderNumber}</span>
                </td>
              </tr>
            </table>

            <!-- Order info -->
            <table width="100%" style="margin-bottom: 20px; font-size: 14px;">
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Data:</td>
                <td align="right" style="font-weight: 500; padding: 4px 0;">${orderDetails.date}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Metoda de plată:</td>
                <td align="right" style="font-weight: 500; padding: 4px 0; display: flex; align-items: center; justify-content: flex-end;">
                  ${orderDetails.paymentMethod}
                  ${isCredit ? '<span class="badge" style="margin-left: 6px;">0%</span>' : ''}
                </td>
              </tr>
              ${isCredit ? `
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Perioada:</td>
                <td align="right" style="font-weight: 500; padding: 4px 0;">
                  <span class="term-highlight">${financingTerm} luni</span>
                </td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Rata lunară:</td>
                <td align="right" style="font-weight: 500; padding: 4px 0; color: #4f46e5;">${formatCurrency(monthlyPayment)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="color: #6b7280; padding: 4px 0; font-weight: 500;">Total:</td>
                <td align="right" style="font-weight: 700; padding: 4px 0;">${formatCurrency(orderDetails.total)}</td>
              </tr>
            </table>

            <!-- Divider -->
            <div class="divider"></div>

            <!-- Customer information -->
           <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px;">Informații client</h3>
          <div class="customer-info">
            <p style="margin: 0 0 8px 0;"><strong>Nume:</strong> ${orderDetails.customer.name}</p>
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${orderDetails.customer.email}" style="color: #3b82f6;">${orderDetails.customer.email}</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Telefon:</strong> <a href="tel:${orderDetails.customer.phone}" style="color: #3b82f6;">${orderDetails.customer.phone}</a></p>
            ${orderDetails.customer.address ? `<p style="margin: 0;"><strong>Adresă:</strong> ${orderDetails.customer.address}${orderDetails.customer.city ? `, ${orderDetails.customer.city}` : ''}</p>` : ''}
          </div>

            <!-- Ordered products -->
            <h4 style="font-size: 16px; margin-top: 0; margin-bottom: 12px;">Produse comandate</h4>
            <div style="max-height: 300px; overflow: auto;">
              ${orderDetails.items.map((item: any) => `
                <div class="item-row">
                  <p style="font-weight: 500; margin: 0 0 8px 0;">${item.name}</p>
                  <table width="100%" style="font-size: 14px; color: #6b7280;">
                    <tr>
                      <td>${item.quantity} x ${formatCurrency(item.price)}</td>
                      <td align="right" style="font-weight: 500;">${formatCurrency(item.total || (item.price * item.quantity))}</td>
                    </tr>
                  </table>
                </div>
              `).join('')}
            </div>

            <!-- Total -->
            <table width="100%" style="margin-top: 12px; border-top: 1px solid #e5e7eb;">
              <tr>
                <td style="font-weight: 500; padding-top: 8px;">Total comandă:</td>
                <td align="right" style="font-weight: 700; font-size: 18px; padding-top: 8px;">${formatCurrency(orderDetails.total)}</td>
              </tr>
            </table>
          </div>

          <!-- Payment method specific info -->
          ${isCredit ? `
          <div class="payment-info">
            <h4 style="margin-top: 0; margin-bottom: 12px; font-size: 16px; display: flex; align-items: center;">
              <span style="margin-right: 8px;">💳</span> Solicitare credit pentru <span class="term-highlight" style="margin-left: 5px;">${financingTerm} luni</span>
            </h4>
            <p style="margin-top: 0; margin-bottom: 12px; font-size: 14px;">
              Un reprezentant te va contacta în decurs de 24 de ore pentru a continua procesul de creditare.
            </p>
            <div style="background-color: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px;">
              <p style="margin: 0 0 8px 0;"><strong>Perioada:</strong> ${financingTerm} luni</p>
              <p style="margin: 0 0 8px 0;"><strong>Rata lunară:</strong> ${formatCurrency(monthlyPayment)}</p>
              <div class="divider"></div>
              <p style="font-weight: bold; margin: 8px 0;">Pașii următori:</p>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280;">
                <li style="margin-bottom: 4px;">Vei primi un email cu detaliile solicitării și documentele necesare</li>
                <li style="margin-bottom: 4px;">Un consultant te va contacta pentru verificarea datelor</li>
                <li style="margin-bottom: 4px;">După aprobarea creditului, produsele vor fi pregătite pentru ridicare</li>
                <li>Vei semna contractul de creditare la ridicarea produselor</li>
              </ol>
            </div>
          </div>
          ` : isPickup ? `
          <div class="payment-info">
            <h4 style="margin-top: 0; margin-bottom: 12px; font-size: 16px; display: flex; align-items: center;">
              <span style="margin-right: 8px;">🏪</span> Ridicare din magazin
            </h4>
            <p style="margin-top: 0; margin-bottom: 12px; font-size: 14px;">
              Comanda ta a fost înregistrată și va fi pregătită pentru ridicare.
              Vei fi notificat când comanda este disponibilă.
            </p>
            <div style="background-color: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px;">
              <p style="margin: 0 0 8px 0;"><strong>Adresa magazinului:</strong><br>
              Strada Calea Orheiului 37, MD-2059, Chișinău</p>
              <p style="margin: 0;"><strong>Program:</strong><br>
              Luni-Vineri: 9:00-18:00<br>
              Sâmbătă: 10:00-16:00<br>
              Duminică: Închis</p>
            </div>
          </div>
          ` : isCash ? `
          <div class="payment-info">
            <h4 style="margin-top: 0; margin-bottom: 12px; font-size: 16px; display: flex; align-items: center;">
              <span style="margin-right: 8px;">🚚</span> Livrare la adresa
            </h4>
            <p style="margin-top: 0; margin-bottom: 12px; font-size: 14px;">
              Comanda ta va fi livrată la adresa indicată. Vei fi contactat telefonic înainte de livrare.
            </p>
            <div style="background-color: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px;">
              <p style="margin: 0 0 8px 0;"><strong>Adresa de livrare:</strong><br>
              ${orderDetails.customer.address}${orderDetails.customer.city ? `, ${orderDetails.customer.city}` : ''}</p>
              <p style="margin: 0;"><strong>Termen de livrare:</strong><br>
              1-3 zile lucrătoare</p>
            </div>
          </div>
          ` : ''}

          <!-- Thank you message -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 18px; color: #000; font-weight: bold;">Îți mulțumim pentru încredere!</p>
            <a href="https://intelect.md" class="btn">Continuă cumpărăturile</a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p style="margin-top: 0;">© ${new Date().getFullYear()} Intelect.md - Toate drepturile rezervate</p>
          <p style="margin-bottom: 0;">Acest email a fost trimis către ${orderDetails.customer.email} deoarece ai ${isCredit ? 'făcut o solicitare de credit' : 'plasat o comandă'} pe site-ul nostru.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Email options
  const mailOptions = {
    from: `Intelect.md <${emailConfig.auth.user}>`,
    to: orderDetails.customer.email,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to customer:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email to customer:', error);
    return { success: false, error };
  }
}

/**
 * Send order notification email to admin
 * This is separate from the customer confirmation email
 */
export async function sendOrderNotification(orderData: any) {
  // Convert Prisma order to our format if needed
  const orderDetails = orderData.orderNumber && orderData.items && orderData.customer
    ? convertPrismaOrderToEmailFormat(orderData)
    : orderData;

  // Format currency for email
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ro-MD') + ' MDL';
  };

  // Get payment method type and details
  const paymentMethodType = orderDetails.paymentMethodType || '';
  const isCredit = orderDetails.isCredit || paymentMethodType === 'credit' || orderDetails.paymentMethod?.toLowerCase() === 'credit';
  const isPickup = paymentMethodType === 'pickup' || orderDetails.paymentMethod?.toLowerCase() === 'pickup';
  const isCash = paymentMethodType === 'cash' || orderDetails.paymentMethod?.toLowerCase() === 'cash';
  const financingTerm = orderDetails.financingTerm || 12;

  // Generate the email subject
  const emailSubject = isCredit
    ? `[CREDIT] Nouă solicitare de credit #${orderDetails.orderNumber}`
    : `[COMANDĂ NOUĂ] #${orderDetails.orderNumber}`;

  // Create the HTML email template for admin
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isCredit ? 'Nouă solicitare credit' : 'Comandă nouă'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .header { background-color: ${isCredit ? '#6366f1' : '#000'}; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .order-info { margin-bottom: 24px; background-color: #f3f4f6; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb; }
        .alert { background-color: ${isCredit ? '#ede9fe' : '#f3f4f6'}; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid ${isCredit ? '#8b5cf6' : '#000'}; }
        .customer-info { background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e5e7eb; }
        .products-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .products-table th { background-color: #f3f4f6; text-align: left; padding: 12px; }
        .products-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 20px; font-size: 12px; }
        .badge-credit { background-color: #ede9fe; color: #8b5cf6; }
        .badge-pickup { background-color: #e0f2fe; color: #0ea5e9; }
        .badge-cash { background-color: #dcfce7; color: #16a34a; }
        .footer { padding: 20px; text-align: center; background-color: #f3f4f6; color: #6b7280; font-size: 12px; }
        .btn { display: inline-block; background-color: #000; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 12px; }
        .btn-credit { background-color: #8b5cf6; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">
            ${isCredit
              ? '🔔 Nouă solicitare de credit'
              : '🔔 Comandă nouă primită'}
          </h1>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Alert Box -->
          <div class="alert">
            <h2 style="margin-top: 0; margin-bottom: 8px; font-size: 18px;">
              ${isCredit
                ? 'Avem o nouă solicitare de credit care necesită atenția ta'
                : 'Avem o comandă nouă care trebuie procesată'}
            </h2>
            <p style="margin: 0; color: #4b5563;">
              ${isCredit
                ? 'Clientul așteaptă să fie contactat pentru a continua procesul de creditare.'
                : 'Te rugăm să procesezi această comandă cât mai curând posibil.'}
            </p>
          </div>

          <!-- Order Info Summary -->
          <div class="order-info">
            <table width="100%" cellpadding="4" cellspacing="0">
              <tr>
                <td width="40%" style="font-weight: bold;">Număr comandă:</td>
                <td width="60%">${orderDetails.orderNumber}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Data:</td>
                <td>${orderDetails.date}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Metodă plată:</td>
                <td>
                  <span class="badge ${isCredit ? 'badge-credit' : isPickup ? 'badge-pickup' : 'badge-cash'}">
                    ${orderDetails.paymentMethod}
                  </span>
                  ${isCredit ? `<span style="margin-left: 6px; font-size: 12px;">(${financingTerm} luni)</span>` : ''}
                </td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Total:</td>
                <td style="font-weight: bold; font-size: 16px;">${formatCurrency(orderDetails.total)}</td>
              </tr>
            </table>
          </div>

          <!-- Customer Information -->
          <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px;">Informații client</h3>
          <div class="customer-info">
            <p style="margin: 0 0 8px 0;"><strong>Nume:</strong> ${orderDetails.customer.name}</p>
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${orderDetails.customer.email}" style="color: #3b82f6;">${orderDetails.customer.email}</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Telefon:</strong> <a href="tel:${orderDetails.customer.phone}" style="color: #3b82f6;">${orderDetails.customer.phone}</a></p>
            ${orderDetails.customer.address ? `<p style="margin: 0;"><strong>Adresă:</strong> ${orderDetails.customer.address}${orderDetails.customer.city ? `, ${orderDetails.customer.city}` : ''}</p>` : ''}
          </div>

          <!-- Products List -->
          <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px;">Produse comandate</h3>
          <table class="products-table">
            <thead>
              <tr>
                <th>Produs</th>
                <th>Cantitate</th>
                <th>Preț</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.items.map((item: any) => `
                <tr>
                  <td style="font-weight: 500;">${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td style="text-align: right; font-weight: 500;">${formatCurrency(item.total || (item.price * item.quantity))}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold; padding-top: 16px;">Total:</td>
                <td style="text-align: right; font-weight: bold; padding-top: 16px;">${formatCurrency(orderDetails.total)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Call to Action -->
          <div style="text-align: center; margin-top: 30px;">
            <p style="margin: 0 0 12px 0; font-weight: bold;">Procesează rapid această ${isCredit ? 'solicitare' : 'comandă'}</p>
            <a href="https://intelect.md/dashboard" class="btn ${isCredit ? 'btn-credit' : ''}">
              Accesează panoul de administrare
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} Intelect.md - Sistem automat de notificare</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Get admin email from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'ionmoisei755@gmail.com';

  // Email options for admin
  const mailOptions = {
    from: `Intelect.md System <${emailConfig.auth.user}>`,
    to: adminEmail,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    // Send email to admin
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error };
  }
}

/**
 * Send shipping notification email to customer about their order being shipped
 */
export async function sendShippingNotification(orderData: any) {
  // Convert Prisma order to our format if needed
  const orderDetails = orderData.orderNumber && orderData.items && orderData.customer
    ? convertPrismaOrderToEmailFormat(orderData)
    : orderData;

  // Format currency for email
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ro-MD') + ' MDL';
  };

  // Generate tracking information (this would come from the order in a real scenario)
  const trackingNumber = orderDetails.trackingNumber || 'TRK-' + Math.floor(100000 + Math.random() * 900000);
  const trackingUrl = orderDetails.trackingUrl || 'https://intelect.md/tracking/' + trackingNumber;

  // Generate estimated delivery date (3 business days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const estimatedDeliveryDate = orderDetails.estimatedDeliveryDate ||
    deliveryDate.toLocaleDateString('ro-MD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  // Subject line
  const emailSubject = `Comanda #${orderDetails.orderNumber} a fost expediată`;

  // Create the HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comanda dvs. a fost expediată</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
            }
            .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #eaeaea;
                background-color: #000;
                color: white;
            }
            .logo {
                max-width: 150px;
                height: auto;
            }
            .order-info {
                padding: 20px 0;
                border-bottom: 1px solid #eaeaea;
            }
            .shipping-details {
                padding: 20px 0;
                border-bottom: 1px solid #eaeaea;
            }
            .product-list {
                padding: 20px 0;
            }
            .product {
                display: flex;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eaeaea;
            }
            .product-details {
                flex: 1;
            }
            .tracking {
                background-color: #f3f4f6;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #000;
            }
            .button {
                display: inline-block;
                background-color: #000;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .footer {
                padding: 20px 0;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
                background-color: #f3f4f6;
            }
            .delivery-icon {
                font-size: 48px;
                text-align: center;
                margin-bottom: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Comanda dvs. a fost expediată!</h1>
            </div>

            <div style="text-align: center; padding: 30px 0;">
                <div class="delivery-icon">🚚</div>
                <h2>Comanda ta este în drum spre tine!</h2>
                <p>Produsele tale au fost expediate și sunt în drum spre adresa ta.</p>
            </div>

            <div class="order-info">
                <h2>Detaliile comenzii #${orderDetails.orderNumber}</h2>
                <p>Dragă ${orderDetails.customer.name},</p>
                <p>Vă informăm că comanda dvs. cu numărul <strong>#${orderDetails.orderNumber}</strong> plasată pe data <strong>${orderDetails.date}</strong> a fost expediată și este în drum spre dvs.</p>
            </div>

            <div class="shipping-details">
                <h3>Detalii expediere:</h3>
                <p><strong>Adresa de livrare:</strong> ${orderDetails.customer.address}</p>
                <p><strong>Metoda de livrare:</strong> ${orderDetails.shippingMethod || 'Livrare standard'}</p>
                <p><strong>Data estimată de livrare:</strong> ${estimatedDeliveryDate}</p>
            </div>



            <div class="product-list">
                <h3>Produse expediate:</h3>
                ${orderDetails.items.map((item: any) => `
                <div class="product">
                    <div class="product-details">
                        <p><strong>${item.name}</strong></p>
                        <p>Cantitate: ${item.quantity}</p>
                        <p>Preț: ${formatCurrency(item.price)}</p>
                    </div>
                </div>
                `).join('')}

                <div style="margin-top: 20px; border-top: 1px solid #eaeaea; padding-top: 15px;">
                    <table width="100%">
                        <tr>
                            <td style="font-weight: bold;">Total:</td>
                            <td align="right" style="font-weight: bold;">${formatCurrency(orderDetails.total)}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Ai nevoie de ajutor?</h3>
                <p>Dacă aveți întrebări sau nelămuriri cu privire la comanda dvs., vă rugăm să ne contactați la <a href="mailto:intelectmd@gmail.com">intelectmd@gmail.com</a> sau la numărul de telefon +373 601 75 111.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p>Vă mulțumim că ați ales Intelect MD!</p>
                <a href="https://intelect.md" class="button" style="margin-top: 10px;">Continuă cumpărăturile</a>
            </div>

            <div class="footer">
                <p>© ${new Date().getFullYear()} Intelect MD. Toate drepturile rezervate.</p>
                <p>Strada Calea Orheiului 37, MD-2059, Chișinău</p>
            </div>
        </div>
    </body>
    </html>
  `;

  // Email options
  const mailOptions = {
    from: `Intelect.md <${emailConfig.auth.user}>`,
    to: orderDetails.customer.email,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Shipping notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending shipping notification email:', error);
    return { success: false, error };
  }
}

/**
 * Send credit information email to customer with details about their credit application
 */
export async function sendCreditInfo(orderData: any) {
  // Convert Prisma order to our format if needed
  const orderDetails = orderData.orderNumber && orderData.items && orderData.customer
    ? convertPrismaOrderToEmailFormat(orderData)
    : orderData;

  // Format currency for email
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ro-MD') + ' MDL';
  };

  // Get financing term
  const financingTerm = orderDetails.financingTerm || 12;
  const monthlyPayment = Math.round(orderDetails.total / financingTerm);

  // Generate payment schedule
  const paymentSchedule = [];
  const firstPaymentDate = new Date();
  firstPaymentDate.setDate(firstPaymentDate.getDate() + 30); // First payment 30 days from now

  for (let i = 0; i < financingTerm; i++) {
    const dueDate = new Date(firstPaymentDate);
    dueDate.setMonth(firstPaymentDate.getMonth() + i);

    paymentSchedule.push({
      paymentNumber: i + 1,
      dueDate: dueDate.toLocaleDateString('ro-MD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      amount: monthlyPayment
    });
  }

  // Subject line
  const emailSubject = `Informații despre creditul dvs. - Comanda #${orderDetails.orderNumber}`;

  // Create the HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Informații despre creditul dvs.</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
            }
            .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #eaeaea;
                background-color: #6366f1;
                color: white;
            }
            .logo {
                max-width: 150px;
                height: auto;
            }
            .credit-banner {
                background-color: #9333ea;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                text-align: center;
                margin: 20px 0;
            }
            .order-info {
                padding: 20px 0;
                border-bottom: 1px solid #eaeaea;
            }
            .credit-details {
                padding: 20px 0;
                border-bottom: 1px solid #eaeaea;
            }
            .credit-summary {
                background-color: #f3f4f6;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .payment-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .payment-table th, .payment-table td {
                padding: 10px;
                border: 1px solid #eaeaea;
                text-align: left;
            }
            .payment-table th {
                background-color: #f3f4f6;
            }
            .button {
                display: inline-block;
                background-color: #6366f1;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .important-info {
                background-color: #fffbeb;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
            }
            .footer {
                padding: 20px 0;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
                background-color: #f3f4f6;
            }
            .credit-icon {
                font-size: 48px;
                text-align: center;
                margin-bottom: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Informații despre creditul dvs.</h1>
            </div>

            <div style="text-align: center; padding: 30px 0;">
                <div class="credit-icon">💳</div>
                <h2>Detaliile creditului tău</h2>
                <p>Mai jos găsești toate informațiile despre creditul solicitat pentru comanda ta.</p>
            </div>

            <div class="credit-banner">
                <h2>0% DOBÂNDĂ</h2>
                <p>Rate fără dobândă până la ${financingTerm} de luni</p>
            </div>

            <div class="order-info">
                <h2>Detaliile comenzii #${orderDetails.orderNumber}</h2>
                <p>Dragă ${orderDetails.customer.name},</p>
                <p>Vă mulțumim pentru comanda dvs. cu numărul <strong>#${orderDetails.orderNumber}</strong>. Mai jos găsiți detaliile creditului ales pentru această achiziție.</p>
            </div>

            <div class="credit-details">
                <h3>Rezumatul creditului:</h3>
                <div class="credit-summary">
                    <p><strong>Valoarea totală:</strong> ${formatCurrency(orderDetails.total)}</p>
                    <p><strong>Perioada de creditare:</strong> ${financingTerm} luni</p>
                    <p><strong>Rata lunară:</strong> ${formatCurrency(monthlyPayment)}</p>
                    <p><strong>Dobândă:</strong> 0%</p>
                    <p><strong>Data primei plăți:</strong> ${paymentSchedule[0]?.dueDate || 'În aproximativ 30 de zile'}</p>
                </div>
            </div>

            <h3>Grafic de plăți estimativ:</h3>
            <table class="payment-table">
                <thead>
                    <tr>
                        <th>Nr. plată</th>
                        <th>Data scadentă</th>
                        <th>Suma de plată</th>
                    </tr>
                </thead>
                <tbody>
                    ${paymentSchedule.slice(0, 3).map((payment) => `
                    <tr>
                        <td>${payment.paymentNumber}</td>
                        <td>${payment.dueDate}</td>
                        <td>${formatCurrency(payment.amount)}</td>
                    </tr>
                    `).join('')}
                    <tr>
                        <td colspan="3" style="text-align: center; font-style: italic;">Și așa mai departe până la ${financingTerm} rate</td>
                    </tr>
                </tbody>
            </table>

            <div class="important-info">
                <h3>Informații importante:</h3>
                <ul>
                    <li>Finanțare disponibilă pentru produse de peste 1.000 lei</li>
                    <li>Aprobare rapidă, în aceeași zi</li>
                    <li>Posibilitatea plății anticipate fără penalități</li>
                </ul>
            </div>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Pașii următori:</h3>
                <ol style="padding-left: 20px;">
                    <li>Un reprezentant vă va contacta în curând pentru a confirma detaliile creditului</li>
                    <li>Va fi necesară prezentarea unui act de identitate la momentul ridicării produsului</li>
                    <li>După semnarea contractului, veți putea primi produsele pe loc</li>
                </ol>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Ai nevoie de ajutor?</h3>
                <p>Dacă aveți întrebări sau nelămuriri cu privire la creditul dvs., vă rugăm să ne contactați la <a href="mailto:intelectmd@gmail.com">intelectmd@gmail.com</a> sau la numărul de telefon +373 601 75 111.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p>Vă mulțumim că ați ales Intelect MD!</p>
                <a href="https://intelect.md" class="button" style="margin-top: 10px;">Continuă cumpărăturile</a>
            </div>

            <div class="footer">
                <p>© ${new Date().getFullYear()} Intelect MD. Toate drepturile rezervate.</p>
                <p>Strada Calea Orheiului 37, MD-2059, Chișinău</p>
            </div>
        </div>
    </body>
    </html>
  `;

  // Email options
  const mailOptions = {
    from: `Intelect.md <${emailConfig.auth.user}>`,
    to: orderDetails.customer.email,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Credit information email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending credit information email:', error);
    return { success: false, error };
  }
}
