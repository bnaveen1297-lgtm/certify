const fs = require('fs')
const path = require('path')

const target = path.join(process.cwd(), 'components', 'certificate-renderer.tsx')

// Read current content
let content = fs.readFileSync(target, 'utf8')

// Replace the comment version bump to change the file hash
content = content.replace(
  /\/\/ certificate-renderer v\d+[^\n]*/,
  `// certificate-renderer v${Date.now()}`
)

fs.writeFileSync(target, content, 'utf8')
console.log('Touched certificate-renderer.tsx')

// Clear turbopack cache
const cacheDir = path.join(process.cwd(), '.next')
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true })
  console.log('Cleared .next cache')
} else {
  console.log('.next not found, skipping')
}
