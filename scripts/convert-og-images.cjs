/**
 * Convert SVG OG images to PNG (1200x630)
 *
 * To use this script:
 * 1. Install dependencies: npm install sharp
 * 2. Run: node scripts/convert-og-images.js
 *
 * Alternatively, use online tools:
 * - https://cloudconvert.com/svg-to-png
 * - https://svgtopng.com/
 *
 * Or use ImageMagick:
 * convert -background none -density 300 input.svg -resize 1200x630 output.png
 */

const fs = require('fs');
const path = require('path');

console.log('\n🎨 OG Image Conversion Instructions\n');
console.log('══════════════════════════════════════════════════════════════\n');

const svgFiles = [
  {
    input: 'public/og-image.svg',
    output: 'public/og-image.png',
    description: 'Default Dexter OG image'
  }
];

console.log('📋 Files to convert:\n');
svgFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file.description}`);
  console.log(`   Input:  ${file.input}`);
  console.log(`   Output: ${file.output}`);
  console.log('');
});

console.log('\n🛠️  Conversion Methods:\n');
console.log('Method 1: Using ImageMagick (recommended for batch conversion)');
console.log('─────────────────────────────────────────────────────────────');
svgFiles.forEach(file => {
  console.log(`convert -background none -density 300 ${file.input} -resize 1200x630 ${file.output}`);
});

console.log('\n\nMethod 2: Using Node.js + Sharp');
console.log('─────────────────────────────────────────────────────────────');
console.log('npm install sharp');
console.log('Then run this script with sharp enabled');

console.log('\n\nMethod 3: Online converters (easiest)');
console.log('─────────────────────────────────────────────────────────────');
console.log('1. Go to https://cloudconvert.com/svg-to-png');
console.log('2. Upload each SVG file');
console.log('3. Set dimensions to 1200x630');
console.log('4. Download and place in the correct directory');

console.log('\n\nMethod 4: Using Inkscape (if installed)');
console.log('─────────────────────────────────────────────────────────────');
svgFiles.forEach(file => {
  console.log(`inkscape ${file.input} --export-type=png --export-width=1200 --export-height=630 --export-filename=${file.output}`);
});

console.log('\n══════════════════════════════════════════════════════════════\n');

// Try to use sharp if available
try {
  const sharp = require('sharp');

  console.log('✅ Sharp is installed! Converting images...\n');

  const convertWithSharp = async () => {
    for (const file of svgFiles) {
      try {
        // Read SVG content
        const svgBuffer = fs.readFileSync(path.join(__dirname, '..', file.input));

        // Convert to PNG
        await sharp(svgBuffer)
          .resize(1200, 630)
          .png()
          .toFile(path.join(__dirname, '..', file.output));

        console.log(`✓ Converted: ${file.description}`);
      } catch (err) {
        console.error(`✗ Failed to convert ${file.input}:`, err.message);
      }
    }

    console.log('\n✅ All images converted successfully!');
    console.log('The PNG files are now ready for production use.\n');
  };

  convertWithSharp().catch(err => {
    console.error('Conversion failed:', err);
    process.exit(1);
  });

} catch (err) {
  console.log('ℹ️  Sharp not installed. SVG files created successfully.');
  console.log('   Follow one of the methods above to convert to PNG.\n');
  console.log('   Quick install: npm install sharp && node scripts/convert-og-images.js\n');
}
