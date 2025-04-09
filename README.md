# Intelect MD

## Overview

This is a Next.js application with React, Shadcn UI, and Tailwind CSS. The database connections and API routes have been removed to allow integration with a custom API.

## Product Data Integration

The application now uses mock product data instead of fetching from an external API. Products are loaded at build time and stored in memory for efficient access.

### Features

- Server-side mock data loaded at build time
- Filtering by product categories
- Multi-language product data (Romanian/Russian)
- In-memory caching for performance

### Configuration

- Configure product categories in `lib/server-init.ts`
- Set `REVALIDATION_SECRET` for the cache refresh API
- Mock product data is defined in `app/utils/mock-data.ts`

## Changes Made

The following components were removed:

1. **API Routes**: All routes in `/app/api` were removed
2. **Prisma Integration**:
   - Removed Prisma schema and migrations
   - Removed Prisma client dependencies
   - Removed database-specific code
3. **Authentication**:
   - Simplified auth flow for development purposes
   - Removed database authentication logic
4. **Admin Interface**:
   - Simplified to show placeholder content
   - Removed database-dependent components

## Integrating Your Custom API

To integrate your own API with this application:

1. **Authentication**: Update `lib/auth.ts` to use your authentication API
2. **Admin Pages**:
   - Implement API calls in admin components to fetch and display data
   - Update forms to submit to your API endpoints
3. **Frontend Components**:
   - Update client components to fetch data from your API
   - Implement data mutations through your API

## Available Scripts

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS, Shadcn UI, Framer Motion
- **UI Components**: Radix UI primitives with Shadcn UI styling
- **Forms**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js (simplified)
- **Email Notifications**: Nodemailer for order confirmation and admin notifications

## Email Notification System

The application includes a comprehensive email notification system:

1. **Customer Order Confirmation**: Automatically sends a detailed order confirmation to customers
   after an order is placed, including order details, products, and payment information.

2. **Admin Order Notifications**: Sends internal notifications to store administrators when new
   orders or credit applications are submitted.

3. **Configuration**:
   - Set the `ADMIN_EMAIL` environment variable in `.env.local` to specify where admin notifications should be sent.
   - Email templates are defined in `app/lib/email.ts` and can be customized as needed.
   - Test the email system using `npm run test-emails` command.

4. **Email Types**:
   - Regular order confirmations
   - Credit application confirmations
   - Admin notifications for regular orders
   - Admin notifications for credit applications

## Development Notes

The admin interface is currently set up with placeholder components. You'll need to implement your API integration to restore functionality.

1. The admin dashboard is at `/admin`
2. Original routes for inventory management were at `/admin/inventar`
3. Original routes for orders management were at `/admin/comenzi`

All of these routes now contain placeholder UI waiting for API integration.









##  Local JSON Data:
Since you only need specific products, we're now using mock data instead of making external API calls.
