const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const nextDir = path.join(root, '.next')

function rmrf(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (fs.lstatSync(full).isDirectory()) rmrf(full)
    else fs.unlinkSync(full)
  }
  fs.rmdirSync(dir)
}

console.log('Clearing .next cache...')
rmrf(nextDir)
console.log('Done. .next directory removed.')

// Also verify elements-panel.tsx line count
const panelPath = path.join(root, 'components/editor/elements-panel.tsx')
const content = fs.readFileSync(panelPath, 'utf8')
const lines = content.split('\n').length
console.log(`elements-panel.tsx has ${lines} lines on disk`)
const dupeCheck = content.match(/ADD_ITEMS/g) || []
console.log(`ADD_ITEMS occurrences: ${dupeCheck.length} (should be 1)`)
