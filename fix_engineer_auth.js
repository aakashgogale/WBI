const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'Frontend', 'src', 'modules', 'engineer');

const replacements = [
  { from: /workerAuthService/g, to: 'engineerAuthService' },
  { from: /workerAccessToken/g, to: 'engineerAccessToken' },
  { from: /workerRefreshToken/g, to: 'engineerRefreshToken' },
  { from: /workerData/g, to: 'engineerData' },
  { from: /WorkerLogin/g, to: 'EngineerLogin' },
  { from: /WorkerSignup/g, to: 'EngineerSignup' },
  { from: /localWorkerData/g, to: 'localEngineerData' },
  { from: /setWorkerData/g, to: 'setEngineerData' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const r of replacements) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(targetDir);
console.log("Done.");
