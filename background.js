/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

const group2tab = new Map();

function notify(title, message = "", iconUrl = "icon.png") {
    return browser.notifications.create(""+Date.now(),
        {
           "type": "basic"
            ,iconUrl
            ,title
            ,message
        }
    );
}

browser.commands.onCommand.addListener(async (command) => {
    console.log('onCommand', command);
    const parts = command.split(' ');
    if(parts.length !== 2){ return; }
    const cmdId = parts[1];
    const groupId = parts[0];

    switch(cmdId){
        case 'Assign':
            try {
                const activeTab = (await browser.tabs.query({currentWindow:true, active: true}))[0];
                group2tab.set(groupId,activeTab.id);
                notify(extname, "Assigned Focus Shortcut");
            }catch(e){
                console.error(e);
                notify(extname, "Failed to assign Focus Shortcut");
            }
            break;
        case 'Focus':
            if(group2tab.has(groupId)){
                const tabId = group2tab.get(groupId);
                try {
                    const focusTab = await browser.tabs.get(tabId);
                    browser.tabs.highlight({tabs: [focusTab.index]});
                    notify(extname, "Switched to assigned Tab");
                }catch(e){
                    console.error(e);
                    notify(extname, "Assigned Tab not available anymore");
                }
            }else{
                notify(extname, "Focus Shortcut has no assigned Tab yet");
            }
            break;
    }
});

