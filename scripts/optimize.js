const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

const inputDir = path.join(__dirname, '../src/assets/images');
const outputDir = path.join(__dirname, '../public/optimized-images');

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath, ext);
  const outputPath = path.join(outputDir, `${fileName}.webp`);
  
  try {
    await sharp(filePath).webp({ quality: 80 }).toFile(outputPath);
    const originalSize = (await stat(filePath)).size;
    const optimizedSize = (await stat(outputPath)).size;
    return {
      file: fileName,
      original: `${(originalSize / 1024).toFixed(2)}KB`,
      optimized: `${(optimizedSize / 1024).toFixed(2)}KB`,
      savings: `${((1 - (optimizedSize / originalSize)) * 100).toFixed(2)}%`
    };
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error.message);
    return null;
  }
}

async function main() {
  await ensureDir(outputDir);
  const files = (await readdir(inputDir))
    .filter(f => ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase()));
  
  console.log(`\n🔄 Optimizing ${files.length} images...\n`);
  
  const results = [];
  for (const file of files) {
    const result = await optimizeImage(path.join(inputDir, file));
    if (result) {
      console.log(`✅ ${result.file}: ${result.original} → ${result.optimized} (${result.savings} saved)`);
      results.push(result);
    }
  }
  
  console.log('\n✨ Image optimization complete!');
}

main().catch(console.error);
