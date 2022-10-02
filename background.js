/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

const assign2tab = new Map();

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
    const activeTab = (await browser.tabs.query({currentWindow:true, active: true}))[0];
    const cmdId = parseInt(command);
    const isAssign = cmdId % 2;
    if (isAssign === 1) { // odd
        console.debug("assign: ", command, activeTab.id);
        assign2tab.set(cmdId+1,activeTab.id);
        notify(extname, "Assigned Shortcut to Tab "+ activeTab.id);
    }else{
        if(assign2tab.has(cmdId)){
            try {
                const focusTab = await browser.tabs.get(assign2tab.get(cmdId));
                console.log(focusTab.id);
                browser.tabs.highlight({tabs: [focusTab.index]});
                notify(extname, "Switched to Tab " + focusTab.id);
            }catch(e){
                console.error(e);
                notify(extname, "Tab to Focus not available anymore");
            }
        }else{
            notify(extname, "No Tab to Focus assigned (yet)");
        }
    }
});

