const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.spec.ts')) {
            if (fullPath.includes('storage.service.spec.ts') || fullPath.includes('auth-service.service.spec.ts')) {
                 continue; // skip the ones we already fixed
            }
            let content = fs.readFileSync(fullPath, 'utf8');

            // Add necessary imports if they don't exist
            let importsToAdd = [];
            if (!content.includes('HttpClientTestingModule')) {
                importsToAdd.push("import { HttpClientTestingModule } from '@angular/common/http/testing';");
            }
            if (!content.includes('RouterTestingModule')) {
                importsToAdd.push("import { RouterTestingModule } from '@angular/router/testing';");
            }
            if (!content.includes('BrowserAnimationsModule')) {
                importsToAdd.push("import { BrowserAnimationsModule } from '@angular/platform-browser/animations';");
            }
            if (!content.includes('ToastrModule')) {
                importsToAdd.push("import { ToastrModule } from 'ngx-toastr';");
            }
            if (!content.includes('NO_ERRORS_SCHEMA')) {
                importsToAdd.push("import { NO_ERRORS_SCHEMA } from '@angular/core';");
            }
            if (!content.includes('FormsModule')) {
                importsToAdd.push("import { FormsModule, ReactiveFormsModule } from '@angular/forms';");
            }
            if (!content.includes('HttpClientModule')) {
                 importsToAdd.push("import { HttpClientModule } from '@angular/common/http';");
            }

            if (importsToAdd.length > 0) {
                // Find first non-empty line or insert at top
                content = importsToAdd.join('\n') + '\n' + content;
            }

            // Replace TestBed.configureTestingModule
            content = content.replace(/imports:\s*\[([\s\S]*?)\]/, (match, p1) => {
                let existing = p1.trim();
                if (existing.length > 0 && !existing.endsWith(',')) {
                     existing += ',';
                }
                return `imports: [${existing} HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule, ToastrModule.forRoot(), FormsModule, ReactiveFormsModule, HttpClientModule],\n      schemas: [NO_ERRORS_SCHEMA]`;
            });
            
            // For services, there are usually no imports array in TestBed.configureTestingModule, so we should add imports if it's `{}`
            content = content.replace(/configureTestingModule\(\{\s*\}\)/, "configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule, ToastrModule.forRoot()], schemas: [NO_ERRORS_SCHEMA] })");

            fs.writeFileSync(fullPath, content);
            console.log(`Updated ${fullPath}`);
        }
    }
}

processDir(path.join(__dirname, 'src', 'app'));
console.log('Done!');
