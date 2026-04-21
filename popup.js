document.addEventListener('DOMContentLoaded', () => {
    const panicBtn = document.getElementById('panicBtn');
    const scanBtn = document.getElementById('scanBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const saveSettings = document.getElementById('saveSettings');
    const timerInput = document.getElementById('timerInput');
    const siteList = document.getElementById('siteList');

    // 1. Load saved timer on start
    chrome.storage.local.get(['logoutTimer'], (res) => {
        if (res.logoutTimer) timerInput.value = res.logoutTimer;
    });

    // 2. Settings Panel Toggle
    settingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
    });

    // 3. Save Settings
    saveSettings.addEventListener('click', () => {
        const time = parseInt(timerInput.value);
        chrome.storage.local.set({ logoutTimer: time }, () => {
            alert(`Timer saved: ${time} minutes`);
            settingsPanel.style.display = 'none';
        });
    });

    // 4. Deep Search Logic
    scanBtn.addEventListener('click', async () => {
        siteList.innerHTML = "Scanning sessions...";
        const domains = new Set();

        // Scan Cookies
        const cookies = await chrome.cookies.getAll({});
        cookies.forEach(c => domains.add(c.domain.startsWith('.') ? c.domain.substring(1) : c.domain));

        // Scan History (OAuth)
        const history = await chrome.history.search({ text: 'accounts.google.com', startTime: 0, maxResults: 50 });
        history.forEach(h => { try { domains.add(new URL(h.url).hostname); } catch(e){} });

        siteList.innerHTML = "";
        Array.from(domains).slice(0, 15).forEach(d => {
            const div = document.createElement('div');
            div.className = 'site-entry';
            div.innerText = `• ${d}`;
            siteList.appendChild(div);
        });
    });

    // 5. Main Action: Log Out Everywhere
    panicBtn.addEventListener('click', () => {
        chrome.storage.local.get(['logoutTimer'], (res) => {
            const delay = parseInt(res.logoutTimer) || 0;

            if (delay > 0) {
                chrome.alarms.create("panicLogout", { delayInMinutes: delay });
                alert(`Security Protocol: All sessions will be cleared in ${delay} minutes.`);
                window.close();
            } else {
                if(confirm("Are you sure you want to log out from all sites instantly?")) {
                    chrome.browsingData.remove({"since": 0}, {"cookies": true, "history": true}, () => {
                        alert("Shield Activated: All sessions wiped!");
                        window.close();
                    });
                }
            }
        });
    });
});