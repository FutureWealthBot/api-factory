import fs from 'fs'
const path = 'package.json'
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts.dev = 'concurrently -k -n CLI,WEB -c auto "pnpm dev:cli" "pnpm dev:web"'
fs.writeFileSync(path, JSON.stringify(pkg, null, 2))
console.log('✅ package.json scripts.dev set to concurrent CLI+WEB')
