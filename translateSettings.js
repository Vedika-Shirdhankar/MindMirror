const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

code = code.replace(/Settings &amp; Account/g, '{t(\'settings.title\')}');
code = code.replace(/Your data, your control — always\./g, '{t(\'settings.subtitle\')}');
code = code.replace(/>Profile</g, '>{t(\'settings.profile\')}<');
code = code.replace(/Display name/g, '{t(\'settings.displayName\')}');
code = code.replace(/"Your name\.\.\."/g, '{t(\'settings.namePlaceholder\')}');
code = code.replace(/>Password</g, '>{t(\'settings.password\')}<');
code = code.replace(/"Current password"/g, '{t(\'settings.currentPassword\')}');
code = code.replace(/"New password \(min\. 8 characters\)"/g, '{t(\'settings.newPassword\')}');
code = code.replace(/>AI Configuration</g, '>{t(\'settings.aiConfig\')}<');
code = code.replace(/MindMirror's reflections.*required\./gs, '{t(\'settings.aiConfigDesc\')}');
code = code.replace(/>Privacy &amp; Security</g, '>{t(\'settings.privacy\')}<');
code = code.replace(/>Export Your Data</g, '>{t(\'settings.exportData\')}<');
code = code.replace(/Download everything MindMirror has stored for you.*?JSON file\./gs, '{t(\'settings.exportDesc\')}');
code = code.replace(/>Download my data</g, '>{t(\'settings.downloadData\')}<');
code = code.replace(/>Session</g, '>{t(\'settings.session\')}<');
code = code.replace(/You're signed in on this device with a secure token\..*?log back in\./gs, '{t(\'settings.sessionDesc\')}');
code = code.replace(/>Delete Account</g, '>{t(\'settings.deleteAccount\')}<');
code = code.replace(/This permanently deletes your account.*?exporting your data first\./gs, '{t(\'settings.deleteAccountDesc\')}');
code = code.replace(/Enter your password to permanently delete your account\./g, '{t(\'settings.enterPasswordToDelete\')}');
code = code.replace(/placeholder="Password"/g, 'placeholder={t(\'settings.passwordPlaceholder\')}');
code = code.replace(/MindMirror — built with care, for you\./g, '{t(\'settings.footer\')}');

fs.writeFileSync('src/pages/Settings.jsx', code);
