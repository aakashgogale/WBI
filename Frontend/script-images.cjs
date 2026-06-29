const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.git', 'build', 'dist'].includes(file)) {
        walkSync(filePath, filelist);
      }
    } else if (file.endsWith('.jsx')) {
      filelist.push(filePath);
    }
  });
  return filelist;
};

const srcDir = 'c:/Users/XIAOMI/WBI/Frontend/src';
const files = walkSync(srcDir);

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  content = content.replace(/<img\s/g, (match, offset, str) => {
    // Look ahead to see if this img tag closes
    let closingIndex = str.indexOf('>', offset);
    if (closingIndex === -1) return match;
    
    // Just a heuristic to check if it's already optimized
    const tagContent = str.substring(offset, closingIndex + 50); // a bit of leeway for multiline
    
    if (tagContent.includes('fetchPriority') || tagContent.includes('fetchpriority') || tagContent.includes('loading=')) {
      return match;
    }
    
    return '<img fetchPriority="low" loading="lazy" ';
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log(`Updated images in ${modifiedCount} files safely.`);
