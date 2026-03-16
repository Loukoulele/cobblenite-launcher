const crypto = require('crypto')
const fs = require('fs')
const _badwordsPath = require('path').join(__dirname, 'assets', 'js', 'badwords.json')
let BADWORDS = []
try {
    BADWORDS = JSON.parse(fs.readFileSync(_badwordsPath, 'utf8'))
} catch(e) {
    console.error('Could not load badwords list:', e.message)
}

const offlineWarningStep = document.getElementById('offlineWarningStep')
const offlineFormStep = document.getElementById('offlineFormStep')
const offlineWarningContinue = document.getElementById('offlineWarningContinue')
const offlineWarningBack = document.getElementById('offlineWarningBack')

const offlineLoginUsername = document.getElementById('offlineLoginUsername')
const offlineLoginButton = document.getElementById('offlineLoginButton')
const offlineLoginError = document.getElementById('offlineLoginError')
const offlineFormBack = document.getElementById('offlineFormBack')

const OFFLINE_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/

function resetOfflineLogin() {
    offlineWarningStep.style.display = ''
    offlineFormStep.style.display = 'none'
    offlineLoginUsername.value = ''
    offlineLoginError.textContent = ''
    offlineLoginButton.disabled = true
}

function validateOfflineUsername(username) {
    if (username.length === 0) {
        offlineLoginError.textContent = ''
        offlineLoginButton.disabled = true
        return false
    }
    if (username.length < 3) {
        offlineLoginError.textContent = 'Minimum 3 caracteres'
        offlineLoginButton.disabled = true
        return false
    }
    if (!OFFLINE_USERNAME_REGEX.test(username)) {
        offlineLoginError.textContent = 'Lettres, chiffres et _ uniquement'
        offlineLoginButton.disabled = true
        return false
    }
    const lower = username.toLowerCase()
    if (BADWORDS.some(w => lower.includes(w))) {
        offlineLoginError.textContent = 'Ce pseudo contient un mot interdit'
        offlineLoginButton.disabled = true
        return false
    }
    offlineLoginError.textContent = ''
    offlineLoginButton.disabled = false
    return true
}

function generateOfflineUUID(username) {
    const md5 = crypto.createHash('md5').update('OfflinePlayer:' + username).digest()
    md5[6] = (md5[6] & 0x0f) | 0x30
    md5[8] = (md5[8] & 0x3f) | 0x80
    const hex = md5.toString('hex')
    return hex.substr(0, 8) + '-' + hex.substr(8, 4) + '-' + hex.substr(12, 4) + '-' + hex.substr(16, 4) + '-' + hex.substr(20, 12)
}

// Etape 1 : Warning
offlineWarningContinue.onclick = () => {
    offlineWarningStep.style.display = 'none'
    offlineFormStep.style.display = ''
    offlineLoginUsername.focus()
}

offlineWarningBack.onclick = () => {
    resetOfflineLogin()
    switchView(getCurrentView(), VIEWS.loginOptions, 500, 500)
}

// Etape 2 : Formulaire
offlineLoginUsername.addEventListener('input', () => {
    validateOfflineUsername(offlineLoginUsername.value)
})

offlineLoginButton.onclick = () => {
    const username = offlineLoginUsername.value.trim()
    if (!validateOfflineUsername(username)) return

    const uuid = generateOfflineUUID(username)
    const account = ConfigManager.addOfflineAuthAccount(uuid, username, username)
    ConfigManager.save()

    resetOfflineLogin()

    switchView(getCurrentView(), VIEWS.landing, 500, 500, () => {
        updateSelectedAccount(account)
    })
}

offlineFormBack.onclick = () => {
    resetOfflineLogin()
}
