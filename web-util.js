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

function createBookmarks(bookmarksNode, parentId){
  for(var i=0; i<bookmarksNode.length; i++){
    var bookmark = bookmarksNode[i];
    var isRootFolder = !(bookmark.id>2);
    var isFolder = (bookmark.url == null);
    var isParentRoot = !(bookmark.parentId>2);

    if(!isRootFolder && !isFolder && isParentRoot){
      chrome.bookmarks.create({"parentId":bookmark.parentId, "index": bookmark.index, "title": bookmark.title, "url":bookmark.url});
    }

    else if((!isRootFolder && !isFolder && !isParentRoot)){
      chrome.bookmarks.create({"parentId":parentId, "index": bookmark.index, "title": bookmark.title, "url":bookmark.url});
    }

    else if (!isRootFolder && isFolder){
      if(bookmark.children.length>0){
        var children = bookmark.children;
        chrome.bookmarks.create({"parentId":bookmark.parentId, "index": bookmark.index, "title": bookmark.title}, function(result){createBookmarks(children, result.id)});
      }
      else{
        chrome.bookmarks.create({"parentId":bookmark.parentId, "index": bookmark.index, "title": bookmark.title});
      }
    }

    else if (isRootFolder){
      if(bookmark.children.length > 0){
        createBookmarks(bookmark.children);
      }
    }
  }
}

function createBookmarks(bookmarksNode, parentId){
  for(var i =0; i<bookmarksNode.length; i++){
    var bookmark = bookmarksNode[i];
    var isFolder = (bookmark.url == null);
    var isRootFolder = !(bookmark.id>2);
    if(isRootFolder){
      createBookmarks(bookmark.children, bookmark.id);
    }
    else{
      if(isFolder){
        var children = bookmark.children;
        if(children.length>0){
          chrome.bookmarks.create({"parentId": parentId, "index": bookmark.index, "title": bookmark.title}, function(result){createBookmarks(children, result.id)});
        }
        else{
          chrome.bookmarks.create({"parentId": parentId, "index": bookmark.index, "title": bookmark.title});
        }
      }
      else{
        chrome.bookmarks.create({"parentId": parentId, "index": bookmark.index, "title": bookmark.title, "url": bookmark.url});
      }
    }
  }
}

function returnQuery(selectorDict){
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
    var arr = url.split('/');
    var domain = arr[2];
    return domain;
}