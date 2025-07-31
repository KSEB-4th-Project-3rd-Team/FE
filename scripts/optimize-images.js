const imagemin = require('imagemin').default;
const imageminWebp = require('imagemin-webp').default;
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const inputDir = 'public/images';
  const outputDir = 'public/images/optimized';
  
  // Create optimized directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const files = await imagemin([`${inputDir}/*.{jpg,png}`], {
      destination: outputDir,
      plugins: [
        imageminWebp({
          quality: 85,
          method: 6
        })
      ]
    });
    
    console.log('Optimized images:');
    files.forEach(file => {
      const originalPath = file.sourcePath;
      const optimizedPath = file.destinationPath;
      const originalStats = fs.statSync(originalPath);
      const optimizedStats = fs.statSync(optimizedPath);
      const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);
      
      console.log(`${path.basename(originalPath)} -> ${path.basename(optimizedPath)}`);
      console.log(`  ${(originalStats.size / 1024).toFixed(1)}KB -> ${(optimizedStats.size / 1024).toFixed(1)}KB (${savings}% savings)`);
    });
    
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages();