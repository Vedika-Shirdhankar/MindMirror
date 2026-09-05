const fs = require('fs');
let code = fs.readFileSync('src/pages/VideoReflections.jsx', 'utf8');

if (!code.includes('useTranslation')) {
    code = code.replace(/import \{ useState, useEffect, useRef \} from 'react'/, 'import { useState, useEffect, useRef } from \'react\'\nimport { useTranslation } from \'react-i18next\'');
    code = code.replace(/export default function VideoReflections\(\) \{/, 'export default function VideoReflections() {\n  const { t } = useTranslation()');
    
    code = code.replace(/>Advice From Your Past Self</g, '>{t(\'videos.title\')}<');
    code = code.replace(/>Record messages during calm moments. MindMirror surfaces them when life feels overwhelming\.</g, '>{t(\'videos.subtitle\')}<');
    code = code.replace(/>Record Video</g, '>{t(\'videos.recordVideo\')}<');
    code = code.replace(/>Upload Reflection</g, '>{t(\'videos.uploadReflection\')}<');
    code = code.replace(/>Save Reflection</g, '>{t(\'videos.saveReflection\')}<');
    code = code.replace(/>Saving Reflection…</g, '>{t(\'videos.savingReflection\')}<');
    code = code.replace(/>Reflection Title</g, '>{t(\'videos.titleLabel\')}<');
    code = code.replace(/placeholder="e.g. Spiral about future exams"/g, 'placeholder={t(\'videos.titlePlaceholder\')}');
    code = code.replace(/>Optional Reflection Note</g, '>{t(\'videos.noteLabel\')}<');
    code = code.replace(/placeholder="Reflect on why you logged this…"/g, 'placeholder={t(\'videos.notePlaceholder\')}');
    code = code.replace(/>Analyzing…</g, '>{t(\'videos.analyzing\')}<');
    code = code.replace(/>AI Failed</g, '>{t(\'videos.aiFailed\')}<');
    code = code.replace(/>Processing</g, '>{t(\'videos.processing\')}<');
    code = code.replace(/>Retry AI Analysis</g, '>{t(\'videos.retryAnalysis\')}<');
    code = code.replace(/>One day, your future self may need today's encouragement</g, '>{t(\'videos.noVideos\')}<');
    code = code.replace(/>Record a short video reflection when you feel clear-headed or hopeful\.</g, '>{t(\'videos.noVideosHint\')}<');
    code = code.replace(/>Record your first reflection</g, '>{t(\'videos.recordFirst\')}<');
    code = code.replace(/>Transcript</g, '>{t(\'videos.transcript\')}<');
    code = code.replace(/>No transcript generated\.</g, '>{t(\'videos.noTranscript\')}<');
    
    fs.writeFileSync('src/pages/VideoReflections.jsx', code);
}
