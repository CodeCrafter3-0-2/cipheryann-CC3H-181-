chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith("logout_")) {
        const domain = alarm.name.split("_")[1];
        chrome.cookies.getAll({ domain: domain }, (cookies) => {
            cookies.forEach(c => {
                let url = "http" + (c.secure ? "s" : "") + "://" + c.domain + c.path;
                chrome.cookies.remove({ url: url, name: c.name });
            });
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "CyberShield Alert",
                message: `${domain} session has been terminated safely.`,
                priority: 1
            });
        });
    }
});