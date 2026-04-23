const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('ToastrService')) {
        let depth = fullPath.split(path.sep).length - path.resolve('C:/Sandeep/CodeBase/InventoryManagmentUI/IMS/src/app').split(path.sep).length;
        let p = depth === 1 ? './services/notification.service' : '../'.repeat(depth - 1) + 'services/notification.service';
        if (fullPath.includes('auth.guard.ts')) { 
            p = './notification.service'; 
        }
        
        content = content.replace(/import\s*\{\s*ToastrService\s*\}\s*from\s*['"]ngx-toastr['"];?/g, `import { NotificationService } from '${p}';`);
        content = content.replace(/:\s*ToastrService/g, ': NotificationService');
        content = content.replace(/inject\(ToastrService\)/g, 'inject(NotificationService)');
        
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir('C:/Sandeep/CodeBase/InventoryManagmentUI/IMS/src/app');
