const fs = require('fs');

let code = fs.readFileSync('src/pages/Companion.jsx', 'utf8');

code = code.replace(/import \{ useState, useEffect, useRef \} from 'react'/, 'import { useState, useEffect, useRef } from \'react\'\nimport { useTranslation } from \'react-i18next\'');
code = code.replace(/export default function Companion\(\) \{/, 'export default function Companion() {\n  const { t } = useTranslation()');

code = code.replace(/>Companion</g, '>{t(\'companion.title\')}<');
code = code.replace(/>Your private space to talk\.</g, '>{t(\'companion.subtitle\')}<');
code = code.replace(/placeholder="Share what's on your mind…"/g, 'placeholder={t(\'companion.inputPlaceholder\')}');
code = code.replace(/>Your Past Self Left Advice For You</g, '>{t(\'companion.pastAdvice\')}<');
code = code.replace(/>Reflecting with your story…</g, '>{t(\'companion.reflecting\')}<');

fs.writeFileSync('src/pages/Companion.jsx', code);
