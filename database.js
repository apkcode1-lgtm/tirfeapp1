let localDB = { tenants: {}, buyers: {}, revenueAuthorities: {}, adminSettings: { tgToken: '', tgChatId: '', bankAccount: '', vatRate: 0 }, tariffs: { low: 500, medium: 1000, high: 2000 } };
let isOnline = true;

window.addEventListener('online', handleOnlineStatus);
window.addEventListener('offline', handleOnlineStatus);

function handleOnlineStatus() {
    isOnline = navigator.onLine;
    const tag = document.getElementById('syncIndicator');
    const criticalScreen = document.getElementById('criticalOfflineScreen');
    if(!isOnline) {
        if(tag) tag.classList.remove('hidden');
        if(criticalScreen) criticalScreen.classList.remove('hidden');
    } else {
        if(tag) tag.classList.add('hidden');
        if(criticalScreen) criticalScreen.classList.add('hidden');
        pushToFirebase();
    }
}

function loadLocalStorageBackup() {
    let backup = localStorage.getItem('tirfe_local_db');
    if(backup) {
        localDB = JSON.parse(backup);
        if(!localDB.buyers) localDB.buyers = {};
        if(!localDB.revenueAuthorities) localDB.revenueAuthorities = {};
        if(!localDB.tariffs) localDB.tariffs = { low: 500, medium: 1000, high: 2000 };
        if(!localDB.adminSettings) localDB.adminSettings = { tgToken: '', tgChatId: '', bankAccount: '', vatRate: 0 };
    }
}

function saveToLocalStorage() {
    localStorage.setItem('tirfe_local_db', JSON.stringify(localDB));
}

function pushToFirebase() { 
    if(isOnline) { 
        if(typeof db !== 'undefined') db.ref('tirfe_system').set(localDB); 
    } 
}

function sendAdminTelegramAlert(message) {
    if (!localDB.adminSettings || !localDB.adminSettings.tgToken || !localDB.adminSettings.tgChatId) return;
    const token = localDB.adminSettings.tgToken;
    const chatId = localDB.adminSettings.tgChatId;
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
    fetch(url).catch(err => console.log("Admin Telegram Error: ", err));
}

function sendTelegramAlert(message) {
    if (typeof currentTenant === 'undefined' || !currentTenant || !currentTenant.telegramToken || !currentTenant.telegramChatId) return;
    const token = currentTenant.telegramToken;
    const chatId = currentTenant.telegramChatId;
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
    fetch(url).catch(err => console.log("Telegram Error: ", err));
}

if(typeof db !== 'undefined') {
    db.ref('tirfe_system').on('value', (snapshot) => {
        if(snapshot.exists()) {
            localDB = snapshot.val();
            if(!localDB.tenants) localDB.tenants = {};
            if(!localDB.buyers) localDB.buyers = {};
            if(!localDB.revenueAuthorities) localDB.revenueAuthorities = {};
            if(!localDB.tariffs) localDB.tariffs = { low: 500, medium: 1000, high: 2000 };
            if(!localDB.adminSettings) localDB.adminSettings = { tgToken: '', tgChatId: '', bankAccount: '', vatRate: 0 };
            saveToLocalStorage();
            
            if(typeof currentTenant !== 'undefined' && currentTenant) {
                let checkTenant = localDB.tenants[currentTenant.username];
                if(!checkTenant || checkTenant.status === "blocked") { logout(); return; }
                currentTenant = checkTenant;
                if(typeof renderApp === 'function') renderApp();
            }
         
            if(typeof currentBuyer !== 'undefined' && currentBuyer) {
                let checkBuyer = localDB.buyers[currentBuyer.username];
                if(checkBuyer) currentBuyer = checkBuyer;
            }
            if(typeof renderBuyerCatalog === 'function') renderBuyerCatalog();

            if(typeof currentRevenueOfficer !== 'undefined' && currentRevenueOfficer) {
                if(typeof renderRevenuePanel === 'function') renderRevenuePanel();
            }
            
            let adminPage = document.getElementById('adminPage');
            if(adminPage && !adminPage.classList.contains('hidden')) { 
                if(typeof renderAdminPanel === 'function') renderAdminPanel();
            }
        }
    }, (error) => {
        console.log("Firebase Error, running offline mode.");
        isOnline = false;
        handleOnlineStatus();
    });
}

