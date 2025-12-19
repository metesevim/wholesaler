import fs from 'fs';
import { specs } from './src/swagger.js';

// Export the Swagger specification to a JSON file
const outputPath = './openapi.json';

fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2), 'utf-8');

console.log(`✅ Swagger JSON exported successfully to: ${outputPath}`);
console.log(`📄 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

