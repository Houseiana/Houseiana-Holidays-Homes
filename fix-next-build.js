/**
 * Fix for Next.js 14.2.x crypto.randomUUID build error
 * This script patches the generate-build-id.js file to handle undefined generateBuildId config
 */

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'node_modules/next/dist/build/generate-build-id.js');

try {
  let content = fs.readFileSync(file, 'utf8');

  // Replace the problematic function
  const original = `async function generateBuildId(generate, fallback) {
    let buildId = await generate();`;

  const fixed = `async function generateBuildId(generate, fallback) {
    let buildId = generate ? await generate() : null;`;

  if (content.includes(original)) {
    content = content.replace(original, fixed);
    fs.writeFileSync(file, content, 'utf8');
    console.log('✅ Successfully patched Next.js generate-build-id.js');
  } else {
    console.log('⚠️  File already patched or structure changed');
  }
} catch (error) {
  console.error('❌ Error patching file:', error.message);
  process.exit(1);
}
