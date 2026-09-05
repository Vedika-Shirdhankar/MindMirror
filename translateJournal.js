const fs = require('fs');
let code = fs.readFileSync('src/pages/Journal.jsx', 'utf8');

code = code.replace(/import \{ useState, useEffect \} from 'react'/, 'import { useState, useEffect } from \'react\'\nimport { useTranslation } from \'react-i18next\'');
code = code.replace(/export default function Journal\(\) \{/, 'export default function Journal() {\n  const { t } = useTranslation()');

code = code.replace(/>Your Quiet Space</g, '>{t(\'journal.title\')}<');
code = code.replace(/>Pour your thoughts freely.*?reflections\)</g, '>{t(\'journal.subtitle\')}<');
code = code.replace(/>Write reflection</g, '>{t(\'journal.newEntry\')}<');
code = code.replace(/placeholder="What's on your mind today.*?automatically\."/g, 'placeholder={t(\'journal.placeholder\')}');
code = code.replace(/>What helped\? \(optional\)</g, '>{t(\'journal.copingLabel\')}<');
code = code.replace(/>Save entry</g, '>{t(\'journal.saveEntry\')}<');
code = code.replace(/>Analyzing & saving…</g, '>{t(\'journal.saving\')}<');
code = code.replace(/>Every journey begins with a single page</g, '>{t(\'journal.noEntries\')}<');
code = code.replace(/>Write your first reflection today.*?gratitude\.</g, '>{t(\'journal.noEntriesHint\')}<');
code = code.replace(/>AI reflection</g, '>{t(\'journal.aiReflection\')}<');

fs.writeFileSync('src/pages/Journal.jsx', code);
