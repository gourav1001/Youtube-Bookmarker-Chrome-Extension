chrome.tabs.onUpdated.addListener((tabId, tab)=>{
    if(tab.url && tab.url.includes("youtube.com/watch")){
        // fetching the yt video id
        const queryParams = tab.url.split("?")[1];// fetches video id with v
        const urlParams = new URLSearchParams(queryParams);// an iterface to get exact video id

        // sending message to the content script
        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParams.get("v"),
        });

    }
})