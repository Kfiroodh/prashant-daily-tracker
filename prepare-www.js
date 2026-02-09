const fs = require('fs');
const path = require('path');

// copies project files to ./www folder
const src = path.resolve(__dirname);
const dest = path.resolve(__dirname, 'www');

function copyRecursive(srcDir, destDir){
  if(!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const items = fs.readdirSync(srcDir);
  for(const it of items){
    if(it === 'node_modules' || it === 'www' || it === '.git') continue;
    const s = path.join(srcDir,it);
    const d = path.join(destDir,it);
    const stat = fs.statSync(s);
    if(stat.isDirectory()){
      copyRecursive(s,d);
    } else {
      fs.copyFileSync(s,d);
    }
  }
}

try{
  // clean dest
  if(fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
  copyRecursive(src,dest);
  console.log('www prepared');
}catch(e){
  console.error('error preparing www', e);
  process.exit(1);
}