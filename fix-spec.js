const fs = require('fs');
const path = require('path');
function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.spec.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('ToastrModule')) {
        content = content.replace(/import\s*\{\s*ToastrModule\s*\}\s*from\s*['"]ngx-toastr['"];?/g, "import { MatSnackBarModule } from '@angular/material/snack-bar';");
        content = content.replace(/ToastrModule\.forRoot\(\)/g, "MatSnackBarModule");
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}
processDir('C:/Sandeep/CodeBase/InventoryManagmentUI/IMS/src/app');
