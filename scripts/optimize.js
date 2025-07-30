import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../src/assets/images');
const outputDir = path.join(__dirname, '../public/optimized-images');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
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
    const originalSize = (await fs.stat(filePath)).size;
    const optimizedSize = (await fs.stat(outputPath)).size;
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
  const files = (await fs.readdir(inputDir))
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

