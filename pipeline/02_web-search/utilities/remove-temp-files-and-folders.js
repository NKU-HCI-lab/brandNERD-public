const fs = require('fs');
const path = require('path');
const os = require('os');

const tempDir = os.tmpdir(); // Automatically gets the current user's temp directory

console.log(`Using temp directory: ${tempDir}`);

fs.readdir(tempDir, (err, files) => {
  if (err) {
    console.error(`Error reading directory: ${tempDir}`, err);
    return;
  }

  files.forEach(file => {
    const fullPath = path.join(tempDir, file);

    if (file.startsWith('chrome_BITS_') || file.startsWith('scoped_dir')) {
      fs.stat(fullPath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for ${fullPath}`, err);
          return;
        }

        if (stats.isDirectory()) {
          fs.rm(fullPath, { recursive: true, force: true }, (err) => {
            if (err) {
              console.error(`Failed to delete ${fullPath}`, err);
            } else {
              console.log(`Deleted: ${fullPath}`);
            }
          });
        }
      });
    }
  });
});
