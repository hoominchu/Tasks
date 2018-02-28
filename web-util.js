function closeAllTabs(shouldPinnedClose, windowID) {

    if (windowID != null && !shouldPinnedClose) {
        chrome.tabs.query({"windowId": windowID}, function (allTabs) {
            for (var i = 0; i < allTabs.length; i++) {
                if (!allTabs[i].pinned) {
                    chrome.tabs.remove(allTabs[i].id);
                }
            }
        });
    }

    else if (windowID != null && shouldPinnedClose) {
        chrome.tabs.query({"windowId": windowID}, function (allTabs) {
            for (var i = 0; i < allTabs.length; i++) {
                chrome.tabs.remove(allTabs[i].id);
            }
        });
    }

    else if (windowID == null && !shouldPinnedClose) {
        chrome.tabs.query({}, function (allTabs) {
            for (var i = 0; i < allTabs.length; i++) {
                if (!allTabs[i].pinned) {
                    chrome.tabs.remove(allTabs[i].id);
                }
            }
        });
    }

    else {
        chrome.tabs.query({}, function (allTabs) {
            for (var i = 0; i < allTabs.length; i++) {
                chrome.tabs.remove(allTabs[i].id);
            }
        });
    }
}

function removeBookmarks() {
    chrome.bookmarks.getChildren("1", function (children) {
        for (var i = 0; i < children.length; i++) {
            chrome.bookmarks.removeTree(children[i].id)
        }
    });

    chrome.bookmarks.getChildren("2", function (children) {
        for (var i = 0; i < children.length; i++) {
            chrome.bookmarks.removeTree(children[i].id)
        }
    });
}

// function createBookmarks(bookmarksNode, parentId) {
//     for (var i = 0; i < bookmarksNode.length; i++) {
//         var bookmark = bookmarksNode[i];
//         var isRootFolder = !(bookmark.id > 2);
//         var isFolder = (bookmark.url == null);
//         var isParentRoot = !(bookmark.parentId > 2);
//
//         if (!isRootFolder && !isFolder && isParentRoot) {
//             chrome.bookmarks.create({
//                 "parentId": bookmark.parentId,
//                 "index": bookmark.index,
//                 "title": bookmark.title,
//                 "url": bookmark.url
//             });
//         }
//
//         else if ((!isRootFolder && !isFolder && !isParentRoot)) {
//             chrome.bookmarks.create({
//                 "parentId": parentId,
//                 "index": bookmark.index,
//                 "title": bookmark.title,
//                 "url": bookmark.url
//             });
//         }
//
//         else if (!isRootFolder && isFolder) {
//             if (bookmark.children.length > 0) {
//                 var children = bookmark.children;
//                 chrome.bookmarks.create({
//                     "parentId": bookmark.parentId,
//                     "index": bookmark.index,
//                     "title": bookmark.title
//                 }, function (result) {
//                     createBookmarks(children, result.id)
//                 });
//             }
//             else {
//                 chrome.bookmarks.create({
//                     "parentId": bookmark.parentId,
//                     "index": bookmark.index,
//                     "title": bookmark.title
//                 });
//             }
//         }
//
//         else if (isRootFolder) {
//             if (bookmark.children.length > 0) {
//                 createBookmarks(bookmark.children);
//             }
//         }
//     }
// }

function createBookmarks(bookmarks, parentId){

    var isRootFolder = !(bookmarks.id);
    var isParentRoot = (bookmarks.id<3)

    if(isRootFolder){
        if(bookmarks[0]) { // check if bookmarks is empty
            for (var i = 0; i < bookmarks[0].children.length; i++) {
                createBookmarks(bookmarks[0].children[i], bookmarks[0].id);
            }
        }

    }

    else if(isParentRoot){
        for(var i = 0; i<bookmarks.children.length; i++){
            createBookmarks(bookmarks.children[i], bookmarks.id)
        }
    }

    else if(!isRootFolder && !isParentRoot){
        if(bookmarks.url == null){
            chrome.bookmarks.create({
                "parentId": parentId,
                "index": bookmarks.index,
                "title": bookmarks.title
            }, function(newNode){
                for(var i =0; i<bookmarks.children.length; i++){
                    createBookmarks(bookmarks.children[i], newNode.id)
                }
            });
        }
        else{
            chrome.bookmarks.create({
                "parentId": parentId,
                "index": bookmarks.index,
                "title": bookmarks.title,
                "url": bookmarks.url
            });
        }
    }
}

// function createBookmarks(bookmarksNode, parentId) {
//     for (var i = 0; i < bookmarksNode.length; i++) {
//         var bookmark = bookmarksNode[i];
//         var isFolder = (bookmark.url == null);
//         var isRootFolder = !(bookmark.id > 2);
//         if (isRootFolder) {
//             createBookmarks(bookmark.children, bookmark.id);
//         }
//         else {
//             if (isFolder) {
//                 var children = bookmark.children;
//                 if (children.length > 0) {
//                     chrome.bookmarks.create({
//                         "parentId": parentId,
//                         "index": bookmark.index,
//                         "title": bookmark.title
//                     }, function (result) {
//                         createBookmarks(children, result.id)
//                     });
//                 }
//                 else {
//                     chrome.bookmarks.create({"parentId": parentId, "index": bookmark.index, "title": bookmark.title});
//                 }
//             }
//             else {
//                 chrome.bookmarks.create({
//                     "parentId": parentId,
//                     "index": bookmark.index,
//                     "title": bookmark.title,
//                     "url": bookmark.url
//                 });
//             }
//         }
//     }
// }

function returnQuery(selectorDict) {
    var query = "";

    for (var i = 0; i < selectorDict.length; i++) {
        var tagName, className, idName, attributeName, attributeValue;

        if (selectorDict[i]["tag"] != null) {
            tagName = selectorDict[i]["tag"];
        } else {
            tagName = null;
        }
        if (selectorDict[i]["class"] != null) {
            className = selectorDict[i]["class"];
        } else {
            className = null;
        }
        if (selectorDict[i]["id"] != null) {
            idName = selectorDict[i]["id"];
        } else {
            idName = null;
        }
        if (selectorDict[i]["attribute"] != null) {
            attributeName = selectorDict[i]["attribute"];
        } else {
            attributeName = null;
        }
        if (selectorDict[i]["value"] != null) {
            attributeValue = selectorDict[i]["value"];
        } else {
            attributeValue = null;
        }

        //Creating query for querySelector
        if (tagName != null) {
            query = query + tagName;
        }

        if (className != null) {
            var classes = className.replace(/\s/g, ".");
            query = query + "." + classes;
        }

        if (idName != null) {
            query = query + "#" + idName;
        }

        if (attributeName != null) {
            query = query + "[" + attributeName + "='" + attributeValue + "']";
        }

        if ((i + 1) < selectorDict.length) {
            query = query + " ";
        }
    }
    return query;

}

function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}

function getDomainFromURL(url) {
    var domain = "";
    var arr = url.split('/');
    if (url.search("http") != -1) {
        domain = arr[2];
    }
    else {
        domain = arr[0];
    }
    return domain;
}

function openTabs(arrayOfUrls){
  for(var i = 0; i<arrayOfUrls.length; i++){
    chrome.tabs.create({"url": arrayOfUrls[i]});
  }
}

function getIdsOfCurrentlyOpenTabs(windowId, callback){
   var ids = [];
   if(windowId){
     chrome.tabs.query({"windowId": windowId}, function(tabs){
       console.log(tabs)
       for(var i = 0; i < tabs.length; i++){
         ids.push(tabs[i].url);
       }
       callback(ids);
     });
   }
   else{
     chrome.tabs.query({}, function(tabs){
       console.log(tabs)
       for(var i = 0; i < tabs.length; i++){
         ids.push(tabs[i].url);
       }
       callback(ids);
     });
   }

}

function setBadgeText(windowId, text){
  var openTabsIds = [];
  getIdsOfCurrentlyOpenTabs(windowId, function(ids){openTabsIds = ids});
  for(var j = 0; j<openTabsIds.length; j++){
    var openTabsId = openTabsIds[j]
    chrome.browserAction.setBadgeText({"text": TASKS[CTASKID].name.slice(0, 4), openTabsId});
  }
}
