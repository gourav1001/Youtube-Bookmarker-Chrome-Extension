import { getActiveTabURL } from "./utils.js";

const populateNewBookmark = (bookmarksContainer, bookmark) => {
    // creating new bookmark element
    const bookmarkTitle = document.createElement("div");
    const newBookmark = document.createElement("div");
    const bookmarkControlElems = document.createElement("div");
    // adding bookmark title element text content and class
    bookmarkTitle.textContent = bookmark['desc'];
    bookmarkTitle.className = "bookmark-title";
    bookmarkControlElems.className = "bookmark-controls";
    // adding bookmark element id and class and setting time stamp attribute
    newBookmark.id = "bookmark-at-" + bookmark['time'];
    newBookmark.className = "bookmark";
    newBookmark.setAttribute("time-stamp", bookmark['time']);
    // setting play and delete bookmark control attributes
    setBookmarkAttributes("play", onPlay, bookmarkControlElems);
    setBookmarkAttributes("delete", onDelete, bookmarkControlElems);
    // appending title and control element to the new bookmark element and appending it to the parent container
    newBookmark.appendChild(bookmarkTitle);
    newBookmark.appendChild(bookmarkControlElems);
    bookmarksContainer.appendChild(newBookmark);
};

const populateAllBookmarks = (currentVidBookmarks = []) => {
    //   getting the html container for all the bookmarks  
    const content = document.getElementsByClassName("content")[0];
    content.innerHTML = "";
    if (currentVidBookmarks.length > 0) {// if bookmarks for the video exists
        // setting the title
        const title = document.getElementsByClassName("title")[0];
        title.innerHTML = "Bookmarks for "+currentVidBookmarks[0]['title'];
        // for each bookmark add new bookmark
        for (let i = 0; i < currentVidBookmarks.length; i++) {
            const bookmark = currentVidBookmarks[i];
            populateNewBookmark(content, bookmark);
        }
    } else {// if there is no bookmarks for the video
        content.innerHTML = "<i class='content'>No bookmarks to show</i>";
    }
};

const onPlay = async(e) => {
    // getting the chrome active tab details
    const activeTab = await getActiveTabURL();
    const bookmarkTimeStamp = e.target.parentNode.parentNode.getAttribute("time-stamp");
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTimeStamp
    });
};

const onDelete = async(e) => {
    // getting the chrome active tab details
    const activeTab = await getActiveTabURL();
    // fetching the bookmark to be deleted
    const bookmarkTimeStamp = e.target.parentNode.parentNode.getAttribute("time-stamp");
    const bookmarkToDelete = document.getElementById("bookmark-at-"+bookmarkTimeStamp);
    // deleting the bookmark from the dom
    bookmarkToDelete.parentNode.removeChild(bookmarkToDelete);
    // sending message to content script to remove the bookmark from the chrome storage and re-populating all the bookmarks
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTimeStamp
    }, populateAllBookmarks);

 };

const setBookmarkAttributes = (action, eventListener, controlParentElem) => {
    // creating bookmark action attribute and appending to the parent container
    const controlElem = document.createElement("img");
    controlElem.src = "assets/" + action + ".png";
    controlElem.title = action;
    controlElem.addEventListener("click", eventListener);
    controlParentElem.appendChild(controlElem);
};

// adding event listener to the window dom to load all the bookmarks
document.addEventListener("DOMContentLoaded", async () => {
    // getting the active details
    const activeTab = await getActiveTabURL();
    const queryParams = activeTab.url.split("?")[1];
    const urlParams = new URLSearchParams(queryParams);
    const currVidId = urlParams.get("v");

    if (activeTab.url.includes("youtube.com/watch") && currVidId) {
        // get the bookmarks from the chrome storage and display
        chrome.storage.sync.get([currVidId], (bookmarksObj) => {
            // parsing
            const currentVidBookmarks = bookmarksObj[currVidId] ? bookmarksObj[currVidId] : [];
            // populate all the bookmarks
            populateAllBookmarks(currentVidBookmarks);
        });
    } else {
        // if youtube video is not watched
        const title = document.getElementsByClassName("title")[0];
        title.innerHTML = "You are not watching any youtube video :)";
        const content = document.getElementsByClassName("content")[0];
        content.innerHTML = "<i class='content'>No bookmarks to show</i>";
    }
});
