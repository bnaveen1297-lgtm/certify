const { execSync } = require('child_process')
// Find ALL copies of certificate-renderer.tsx on the system
try {
  const r = execSync("find / -name 'certificate-renderer.tsx' 2>/dev/null", { timeout: 10000 }).toString().trim()
  console.log('Found:', r)
} catch(e) {
  console.log('find error:', e.message)
}
console.log('cwd:', process.cwd())
