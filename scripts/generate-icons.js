/**
 * Script to generate favicons and other necessary icon files for SEO
 *
 * Usage:
 * 1. Make sure Sharp is installed: npm install sharp
 * 2. Run the script: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create directories if they don't exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Source logo file
const sourceLogo = path.join(__dirname, '../public/logo.jpg');

// Create directories
createDirIfNotExists(path.join(__dirname, '../public/icons'));
createDirIfNotExists(path.join(__dirname, '../public/images'));

// Function to resize and save an image
async function resizeAndSave(inputPath, outputPath, width, height = null) {
  const resizeOptions = { width };
  if (height) resizeOptions.height = height;

  try {
    await sharp(inputPath)
      .resize(resizeOptions)
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating ${outputPath}:`, error);
  }
}

// Generate icons for different purposes
async function generateIcons() {
  try {
    if (!fs.existsSync(sourceLogo)) {
      console.error(`Source logo not found at ${sourceLogo}`);
      return;
    }

    // Favicon and standard icons
    const icons = [
      { size: 16, name: 'icon-16x16.png' },
      { size: 32, name: 'icon-32x32.png' },
      { size: 96, name: 'icon-96x96.png' },
      { size: 192, name: 'icon-192x192.png' },
      { size: 512, name: 'icon-512x512.png' },
    ];

    // Apple touch icons
    const appleIcons = [
      { size: 180, name: 'apple-icon-180x180.png' },
    ];

    // Generate favicon.ico (a multi-size ICO file)
    await sharp(sourceLogo)
      .resize(32, 32)
      .toFile(path.join(__dirname, '../public/favicon.ico'));
    console.log('Generated favicon.ico');

    // Generate standard icons
    for (const icon of icons) {
      await resizeAndSave(
        sourceLogo,
        path.join(__dirname, `../public/icons/${icon.name}`),
        icon.size
      );
    }

    // Generate Apple touch icons
    for (const icon of appleIcons) {
      await resizeAndSave(
        sourceLogo,
        path.join(__dirname, `../public/icons/${icon.name}`),
        icon.size
      );
    }

    // Generate OG and Twitter images
    await resizeAndSave(
      sourceLogo,
      path.join(__dirname, '../public/images/og-image.jpg'),
      1200,
      630
    );

    await resizeAndSave(
      sourceLogo,
      path.join(__dirname, '../public/images/twitter-image.jpg'),
      1200,
      600
    );

    console.log('All icons and images generated successfully');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Generate manifest.json
function generateManifest() {
  const manifest = {
    name: 'Intelect MD',
    short_name: 'Intelect',
    description: 'Magazin online de tehnică și electronice în Moldova',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  // Write manifest.json
  fs.writeFileSync(
    path.join(__dirname, '../public/manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('Generated manifest.json');
}

// Run the scripts
(async () => {
  await generateIcons();
  generateManifest();
})();
