function refreshContextMenu() {
    chrome.contextMenus.removeAll(function () {
        chrome.contextMenus.create({"title": "Add to task", "id": "rootMenu", "contexts": ["link"]});
        for (var task_id in TASKS) {
            if (task_id != "lastAssignedId") {
                chrome.contextMenus.create({
                    "title": TASKS[task_id].name,
                    "parentId": "rootMenu",
                    "id": TASKS[task_id].id.toString(),
                    "contexts": ["link"]
                });
            }
        }
        chrome.contextMenus.create({"title": "Save to Sailboat", "id": "saveToSailboat", "contexts": ["link"]});

    })
}



chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.parentMenuItemId == "rootMenu") {
        addToTask(info.linkUrl, info.menuItemId);
    }
});
