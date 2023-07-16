(()=>{
    let ytLeftControls, ytPlayer, currVidId, currVidBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response)=>{
        const {type, value, videoId} = obj;
        // if new yt video loaded
        if(type === "NEW"){
            currVidId = videoId;
            newVidLoaded();
        }
    });

    // fetching all the bookmarks for the current video
    const fecthAllBookmars = ()=>{
        return new Promise((resolve)=>{
            chrome.storage.sync.get(([currVidId], obj) =>{
                resolve(obj[currVidId] ? JSON.parse(obj[currVidId]) : []);
            });
        })
    }

    const newVidLoaded = async()=>{
        // fetching all the bookmarks
        currVidBookmarks = await fecthAllBookmars();
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        if(!bookmarkBtnExists){// if bookmark button doesn't exist
            // creating boomark btn
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button "+"bookmark-btn";
            bookmarkBtn.title = "click to bookmark current timestamp";

            // fetching yt left control and player dom elements
            ytLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            ytPlayer = document.getElementsByClassName("video-stream")[0];

            // adding the bookmark btn to the yt player left control panel
            ytLeftControls.appendChild(bookmarkBtn);

            // adding event listener to bookmark clicks
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);

        }
    };

    // new bookmark event handler
    const addNewBookmarkEventHandler = async()=>{
        // fetching the current timestamp in secs
        const currTimeStamp = ytPlayer.currentTime;
        // creating jsob obj for the bookmark
        const newBookmark = {
            time: currTimeStamp,
            desc: "Bookmark at "+getTime(currTimeStamp)
        };

        // fetching all the bookmarks
        currVidBookmarks = await fecthAllBookmars();

        // synching the bookmars with chrome storage
        chrome.storage.sync.set({
            // appending new bookmark to the saved list of bookmarks and sorting them and then syncing
            [currVidId]: [...currVidBookmarks, newBookmark].sort((a, b)=>{
                a.time - b.time;
            })
        });

    };

    // js method for converting timestamp to time in hrs, mins and secs
    const getTime = (timestamp)=>{
        var time = new Date(0);
        time.setSeconds(timestamp);
        return time.toISOString().substring(11, 19);
    };

    newVidLoaded();

})();