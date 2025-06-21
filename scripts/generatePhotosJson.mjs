import fs from 'fs';
import path from 'path';

const poetsDir = path.join(process.cwd(), 'public', 'media', 'poets');
const output = {};

if (fs.existsSync(poetsDir)) {
  const poetIds = fs.readdirSync(poetsDir).filter((id) =>
    fs.statSync(path.join(poetsDir, id)).isDirectory()
  );

  for (const poetId of poetIds) {
    const photosDir = path.join(poetsDir, poetId, 'photos');
    if (fs.existsSync(photosDir)) {
      const photos = fs.readdirSync(photosDir).filter((f) =>
        /\.(jpe?g|png|webp|gif)$/i.test(f)
      );
      output[poetId] = photos;
    }
  }
}

const outPath = path.join(process.cwd(), 'photos.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`✅ photos.json сгенерирован в ${outPath}`);
