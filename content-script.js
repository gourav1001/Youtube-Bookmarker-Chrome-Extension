(() => {
    let ytLeftControls,
        ytPlayer,
        currVidId = "",
        currVidBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        if (type === "NEW") {// if new yt video loaded
            currVidId = videoId;
            newVidLoaded();
        } else if (type === "PLAY") {// if play btn clicked then set yt player to the bookmarked time stamp
            ytPlayer.currentTime = value;
        } else if (type === "DELETE") {
            // if delete btn clicked then delete the bookmark and sync to chrome storage
            currVidBookmarks = currVidBookmarks.filter((a) => {
                return String(a.time) !== value;// all bookmarks except for the deleted one
            });
            // sync to chrome storage the updated bookmark list
            chrome.storage.sync.set({
                [currVidId]: currVidBookmarks
            });
            // send the updated bookmark list to the populateAllBookmarks function in pop up js
            response(currVidBookmarks);
        }
    });

    // fetching all the bookmarks for the current video
    const fecthAllBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currVidId], (obj) => {
                resolve(obj[currVidId] ? obj[currVidId] : []);
            });
        });
    };

    const newVidLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        // fetching all the bookmarks
        currVidBookmarks = await fecthAllBookmarks();
        if (!bookmarkBtnExists) {
            // if bookmark button doesn't exist
            // creating boomark btn
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "click to bookmark current timestamp";
            bookmarkBtn.style.maxWidth = "25px";
            bookmarkBtn.style.maxHeight = "30px";
            bookmarkBtn.style.padding = "9px";

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
    const addNewBookmarkEventHandler = async () => {
        // fetching the video title
        let ytVidTitle = "";
        const elems = document.getElementsByClassName("style-scope ytd-watch-metadata");
        for (let i = 0; i < elems.length; i++) {
            if(elems[i]["id"] && elems[i]["id"] === "title"){
                ytVidTitle = elems[i].outerText;
                break;
            }
        }
        // fetching the current timestamp in secs
        const currTimeStamp = ytPlayer.currentTime;
        // creating jsob obj for the bookmark
        const newBookmark = {
            title: ytVidTitle,
            time: currTimeStamp,
            desc: "Bookmark at " + getTime(currTimeStamp),
        };

        // fetching all the bookmarks
        currVidBookmarks = await fecthAllBookmarks();

        // synching the bookmars with chrome storage
        chrome.storage.sync.set({
            // appending new bookmark to the saved list of bookmarks and sorting them and then syncing
            [currVidId]: [...currVidBookmarks, newBookmark].sort((a, b) => {
                return a.time - b.time;
            }),
        });
    };

    newVidLoaded();
})();

// js method for converting timestamp to time in hrs, mins and secs
const getTime = (timestamp) => {
    var time = new Date(0);
    time.setSeconds(timestamp);
    return time.toISOString().substring(11, 19);
};
