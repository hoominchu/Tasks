$(document).ready(function () {
    chrome.storage.local.get("TASKS", function (tasks) {
        tasks = tasks["TASKS"];
        chrome.storage.local.get("CTASKID", function (ctaskid) {
            ctaskid = ctaskid["CTASKID"];
            chrome.storage.local.get("Text Log", function (textlog) {
                textlog = textlog["Text Log"];
                chrome.storage.local.get("Debug Stopwords", function (debugStopwords) {
                    debugStopwords = debugStopwords["Debug Stopwords"];

                    showTasksPanel(tasks, ctaskid, textlog, debugStopwords);
                    clickOnCurrentTaskButton(ctaskid);

                    document.getElementById("showAddedStopwords").onclick = function (ev) {
                        showStopwords();
                    }

                });
            });
        });
    });
});

function removeElementFromArray(array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

function showStopwords() {
    chrome.storage.local.get("Debug Stopwords", function (debugStopwords) {
        debugStopwords = debugStopwords["Debug Stopwords"];

        var tagsArea = document.getElementById("tags_in_task");
        tagsArea.innerText = '';

        for (var i = 0; i < debugStopwords.length; i++) {
            var stopword = debugStopwords[i];
            var tagTextElement = "<strong>" + stopword + "</strong>";

            var tagButtonGroupElement = document.createElement("div");
            tagButtonGroupElement.className = "btn-group round-corner";
            tagButtonGroupElement.setAttribute("role", "group");
            tagButtonGroupElement.style.margin = "0.5em";

            var tagTextButton = document.createElement("button");
            tagTextButton.setAttribute("type", "button");
            tagTextButton.className = "btn btn-danger disabled round-corner-left";
            tagTextButton.innerHTML = tagTextElement;

            var tagCloseButton = document.createElement("button");
            tagCloseButton.setAttribute("type", "button");
            tagCloseButton.className = "btn btn-outline-danger round-corner-right";
            tagCloseButton.innerHTML = "&times;";
            tagCloseButton.onclick = function (ev) {
                var stopword = this.parentElement.getElementsByTagName("strong")[0].innerText;
                debugStopwords = removeElementFromArray(debugStopwords, stopword);
                $(this).parent().remove();
                updateStorage("Debug Stopwords", debugStopwords);
            };

            tagButtonGroupElement.appendChild(tagTextButton);
            tagButtonGroupElement.appendChild(tagCloseButton);

            tagsArea.appendChild(tagButtonGroupElement);
        }
    });
}

function clickOnCurrentTaskButton(ctaskid) {
    document.getElementById(ctaskid).click();
}

function showTagsInTask(taskid, tasks, taglog, debugStopwords, settings) {
    // <div class="btn-group" role="group" aria-label="Basic example">
//         <button type="button" class="btn btn-secondary">Left</button>
//         <button type="button" class="btn btn-secondary">Middle</button>
//         <button type="button" class="btn btn-secondary">Right</button>
//         </div>


    var tagsInTaskElement = document.getElementById("tags_in_task");
    tagsInTaskElement.innerText = '';
    var task = tasks[taskid];
    var showTagsFrom = "Open tabs"; //settings["showTagsFrom"];
    var pages = [];
    if (showTagsFrom == "Open tabs") {
        for (var i = 0; i < task["tabs"].length; i++) {
            pages.push(task["tabs"][i]["url"]);
        }
    } else if (showTagsFrom == "Archived pages") {
        for (var i = 0; i < task["likedPages"].length; i++) {
            pages.push(task["likedPages"][i]);
        }
    }

    for (var i = 0; i < pages.length; i++) {
        var url = pages[i];
        var tagsInURL = taglog[url];
        var urlTagsElement = document.createElement("div");
        urlTagsElement.style.marginBottom = "1.5em";

        var urlTextElement = document.createElement("h6");
        urlTextElement.innerHTML = "<a href=" + url + ">" + url + "</a>";
        var hrElement = document.createElement("hr");

        urlTagsElement.appendChild(urlTextElement);
        urlTagsElement.appendChild(hrElement);

        if (tagsInURL != null) {
            for (var key in tagsInURL) {
                var tag = tagsInURL[key];
                var tagText = tag["text"];

                if (debugStopwords.indexOf(tagText.toLowerCase()) < 0) {
                    var tagTextElement = "<strong>" + tag["text"] + "</strong>" + " | " + tag["frequency"];

                    var tagButtonGroupElement = document.createElement("div");
                    tagButtonGroupElement.className = "btn-group round-corner";
                    tagButtonGroupElement.setAttribute("role", "group");
                    tagButtonGroupElement.style.margin = "0.5em";

                    var tagTextButton = document.createElement("button");
                    tagTextButton.setAttribute("type", "button");
                    tagTextButton.className = "btn btn-secondary disabled round-corner-left";
                    tagTextButton.innerHTML = tagTextElement;

                    var tagCloseButton = document.createElement("button");
                    tagCloseButton.setAttribute("type", "button");
                    tagCloseButton.className = "btn btn-secondary round-corner-right";
                    tagCloseButton.innerHTML = "&times;";
                    tagCloseButton.onclick = function (ev) {
                        var stopword = this.parentElement.getElementsByTagName("strong")[0].innerText;
                        debugStopwords.push(stopword.toLowerCase());
                        $(this).parent().remove();
                        updateStorage("Debug Stopwords", debugStopwords);
                    };

                    tagButtonGroupElement.appendChild(tagTextButton);
                    tagButtonGroupElement.appendChild(tagCloseButton);

                    urlTagsElement.appendChild(tagButtonGroupElement);
                }
            }
        } else {
            var noTagsFoundElement = document.createElement("p");
            noTagsFoundElement.innerHTML = "<strong>No tags found on this page</strong>";
            urlTagsElement.appendChild(noTagsFoundElement);
        }

        urlTagsElement.appendChild(hrElement);

        tagsInTaskElement.appendChild(urlTagsElement);
    }
}

function showTasksPanel(tasks, clickedTaskId, textLog, debugStopwords) {
    var tasksPanelElement = document.getElementById("tasks-list");
    tasksPanelElement.innerText = '';
    for (var task_id in tasks) {
        if (task_id != "lastAssignedId") {
            var taskButton = document.createElement("button");
            var classString = "tasks btn";
            if (task_id == clickedTaskId) {
                classString = classString + " btn-primary";
            } else {
                classString = classString + " btn-outline-primary";
            }

            if (task_id == tasks["lastAssignedId"]) {
                classString = classString + " round-corner-bottom";
            }
            taskButton.className = classString;
            taskButton.setAttribute("type", "button");
            taskButton.id = task_id;
            taskButton.innerText = tasks[task_id]["name"];

            taskButton.onclick = function (ev) {
                var targetTaskId = this.id;
                showTasksPanel(tasks, targetTaskId, textLog, debugStopwords);
                showTagsInTask(targetTaskId, tasks, textLog, debugStopwords, {});
            };

            tasksPanelElement.appendChild(taskButton)
            // $("#tasks-list").append('<button type="button" class="tasks btn btn-outline-primary" id="' + tasks[task_id].id + '"> ' + tasks[task_id].name + '</button>');
        }
    }
}

function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}