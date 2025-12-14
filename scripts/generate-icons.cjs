const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [32, 72, 96, 128, 144, 152, 192, 384, 512];
const APPLE_TOUCH_SIZES = [180]; // iOS requires 180x180 specifically

const SOURCE_IMAGE = path.join(__dirname, '../public/logo-source.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

async function generateIcons() {
  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found!');
    console.log('Please save your logo image to: public/logo-source.png');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🎨 Generating PWA icons from source image...\n');

  // Generate standard PWA icons
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated: icon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon (180x180)
  for (const size of APPLE_TOUCH_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `apple-touch-icon.png`);

    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Solid white background for iOS
      })
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated: apple-touch-icon.png (${size}x${size})`);
  }

  // Also copy the 512x512 as favicon
  const faviconPath = path.join(__dirname, '../public/favicon.ico');
  await sharp(SOURCE_IMAGE)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));

  console.log('✅ Generated: favicon.png (32x32)');

  console.log('\n🎉 All icons generated successfully!');
  console.log('\nIcons saved to: public/icons/');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
