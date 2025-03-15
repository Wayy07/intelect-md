/**
 * Script to generate a dynamic sitemap for product pages
 *
 * This script can be run periodically (e.g., daily via cron job) to update
 * the product sitemap based on the latest products in your database.
 *
 * Usage:
 * 1. Install dependencies: npm install @prisma/client
 * 2. Run the script: node scripts/generate-product-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://intelect.md';

// Function to generate XML for a product URL
function generateProductXml(product) {
  const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  return `  <url>
    <loc>${baseUrl}/produs/${product.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
}

// Main function to generate the sitemap
async function generateSitemap() {
  try {
    console.log('Fetching products from database...');

    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        // Add any other filters you need
      },
      select: {
        id: true,
        updatedAt: true,
      }
    });

    console.log(`Found ${products.length} products`);

    // Generate sitemap XML content
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${products.map(product => generateProductXml(product)).join('\n')}
</urlset>`;

    // Write to file
    const sitemapPath = path.join(__dirname, '../public/product-sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapContent);

    console.log(`Product sitemap generated at: ${sitemapPath}`);

    // Update the main sitemap index to include product sitemap
    updateSitemapIndex();

  } catch (error) {
    console.error('Error generating product sitemap:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to update or create the sitemap index
function updateSitemapIndex() {
  const today = new Date().toISOString().split('T')[0];

  const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/product-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  const sitemapIndexPath = path.join(__dirname, '../public/sitemap-index.xml');
  fs.writeFileSync(sitemapIndexPath, sitemapIndexContent);

  console.log(`Sitemap index updated at: ${sitemapIndexPath}`);
}

// Run the generator
generateSitemap();
