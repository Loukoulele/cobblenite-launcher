const { execSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
    if (context.electronPlatformName !== 'win32') return;

    const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
    const iconPath = path.join(__dirname, 'build', 'icon.ico');
    const rcedit = path.join(__dirname, 'node_modules', 'electron-winstaller', 'vendor', 'rcedit.exe');

    console.log(`  • afterPack: Setting icon on ${path.basename(exePath)}`);
    try {
        execSync(`"${rcedit}" "${exePath}" --set-icon "${iconPath}"`, { stdio: 'inherit' });
        console.log('  • afterPack: Icon set successfully');
    } catch (e) {
        console.error('  • afterPack: Failed to set icon:', e.message);
    }
};
