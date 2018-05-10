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
                        showStopwords(tasks, textlog);
                    }

                });
            });
        });
    });
});

function Tag(str, tasksList, correctOccurences, incorrectOccurences) {

    this.text = str;
    this.textLowerCase = str.toLowerCase();

    this.tasks = tasksList || {};

    this.frequency = 0;

    this.correctOccurences = correctOccurences || 0;
    this.incorrectOccurences = incorrectOccurences ||0;

    this.positiveFactor = 0.5;
    this.negativeFactor = -0.5;

    // Use this if separate frequency of html tags is not needed. Using this for now as we are extracting "nes" from a page.
    this.increaseFrequency = function (url, taskid) {

        this.frequency++;

        if (taskid != 0) {
            if (!this.tasks[taskid]) {
                this.tasks[taskid] = {};
            }
            if (!this.tasks[taskid][url]) {
                this.tasks[taskid][url] = 1;
            } else {
                this.tasks[taskid][url]++;
            }
        }
    };

    this.getTaskWeightsNew = function (taskURLs) {
        var taskScores = {};
        var taskFrequencies = {};
        var maxTaskFrequency = 0;

        for (var taskid in this.tasks) {
            var urls = taskURLs[taskid];
            var totalTagFrequencyInTask = 0;
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0) {
                    if (typeof (this.tasks[taskid][urls[i]]) == typeof (3)) {
                        totalTagFrequencyInTask = totalTagFrequencyInTask + this.tasks[taskid][urls[i]];
                    }
                }
            }
            taskFrequencies[taskid] = totalTagFrequencyInTask;
            if (totalTagFrequencyInTask > maxTaskFrequency) {
                maxTaskFrequency = totalTagFrequencyInTask;
            }
        }

        for (var taskid in taskFrequencies) {
            taskScores[taskid] = (taskFrequencies[taskid] - maxTaskFrequency) / maxTaskFrequency;
        }

        return taskScores;
    };

    this.getTaskWeight = function (taskid, taskURLs) {
        if (this.tasks.hasOwnProperty(taskid)) {
            var urls = taskURLs[taskid];
            var totalTagFrequencyInTask = 0;
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0) {
                    if (typeof (this.tasks[taskid][urls[i]]) == typeof (3)) {
                        totalTagFrequencyInTask = totalTagFrequencyInTask + this.tasks[taskid][urls[i]];
                    }
                }
            }

            var weight = totalTagFrequencyInTask / Object.keys(this.tasks).length;

            if (this.correctOccurences != null) {
                weight = weight + (this.correctOccurences * this.positiveFactor);
            }
            if (this.incorrectOccurences != null) {
                weight = weight + (this.incorrectOccurences * this.negativeFactor); // negative factor is negative so the weight will get decreased.
            }

            return weight;
        }

        return 0;
    };

    this.getTaskWeights = function (taskURLs) {

        var taskScores = {};

        for (var tid in taskURLs) {
            taskScores[tid] = 0;
        }

        for (var taskid in this.tasks) {
            var urls = taskURLs[taskid];
            var totalTagFrequencyInTask = 0;
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0) {
                    if (typeof (this.tasks[taskid][urls[i]]) == typeof (3)) {
                        totalTagFrequencyInTask = totalTagFrequencyInTask + this.tasks[taskid][urls[i]];
                    }
                }
            }
            var weight = totalTagFrequencyInTask / Object.keys(this.tasks).length;

            if (this.correctOccurences != null) {
                weight = weight + (this.correctOccurences * this.positiveFactor);
            }
            if (this.incorrectOccurences != null) {
                weight = weight + (this.incorrectOccurences * this.negativeFactor); // negative factor is negative so the weight will get decreased.
            }

            taskScores[taskid] = weight;
        }

        return taskScores;
    };

}

function getTaskTags(taskid, textLog, taskURLs) {
    var taskTags = {};

    for (var key in textLog) {
        var tag = new Tag(key, textLog[key]["tasks"]);
        var taskWeight = tag.getTaskWeight(taskid, taskURLs);

        if (taskWeight > 0) {
            taskTags[tag["text"]] = taskWeight;
        }
    }

    // Create items array
    var items = Object.keys(taskTags).map(function(key) {
        return [key, taskTags[key]];
    });

// Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    return items;

}

function removeElementFromArray(array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

function showStopwords(tasks, textLog) {
    document.getElementById("all_tags_in_task").innerText = '';
    chrome.storage.local.get("Debug Stopwords", function (debugStopwords) {
        debugStopwords = debugStopwords["Debug Stopwords"];

        document.getElementById("showAddedStopwords").className = "btn btn-danger round-corner";

        showTasksPanel(tasks, -1, textLog, debugStopwords);

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

function getTaskURLs(tasks) {
    var taskURLs = {};
    for (var taskID in tasks) {
        if (taskID != "lastAssignedId" && taskID > 0 && tasks[taskID]["archived"] == false) {
            var task = tasks[taskID];
            var tabs = task["tabs"];
            var urls = task["likedPages"];
            for (var i = 0; i < tabs.length; i++) {
                urls.push(tabs[i]["url"]);
            }
            taskURLs[taskID] = urls;
        }
    }
    return taskURLs;
}

function showTagsInTask(taskid, tasks, taglog, debugStopwords, settings) {
    // <div class="btn-group" role="group" aria-label="Basic example">
//         <button type="button" class="btn btn-secondary">Left</button>
//         <button type="button" class="btn btn-secondary">Middle</button>
//         <button type="button" class="btn btn-secondary">Right</button>
//         </div>

    var allTags = {};

    document.getElementById("all_tags_in_task").innerText = '';
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

    if (pages.length < 1) {
        alert("This task has no tabs open.");
    }

    for (var i = 0; i < pages.length; i++) {

        var allPageTags = {};

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

                    allPageTags[tagText.toLowerCase()] = tag;

                    if (allTags.hasOwnProperty(tagText.toLowerCase())){
                        allTags[tagText.toLowerCase()]["positiveWeight"] = allTags[tagText.toLowerCase()]["positiveWeight"] + tag["positiveWeight"];
                    } else {
                        allTags[tagText.toLowerCase()] = tag;
                    }

                }
            }

            var sortedTags = sortTagsByFrequency(allPageTags);

            for (var j = 0; j < sortedTags.length; j++) {

                tag = sortedTags[j][1];

                var tagTextElement = "<strong>" + tag["text"] + "</strong>" + " | " + tag["positiveWeight"];

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

            urlTagsElement.appendChild(hrElement);

            tagsInTaskElement.appendChild(urlTagsElement);

        } else {
            var noTagsFoundElement = document.createElement("p");
            noTagsFoundElement.innerHTML = "<strong>No tags found on this page</strong>";
            urlTagsElement.appendChild(noTagsFoundElement);
        }
    }

    var taskURLs = getTaskURLs(tasks);

    var allTagsSorted = getTaskTags(taskid, taglog, taskURLs);

    var allTagsInTaskElement = document.getElementById("all_tags_in_task");

    for (var k = 0; k < allTagsSorted.length; k++) {
        var tagText = allTagsSorted[k][0];
        var tagWeight = allTagsSorted[k][1];

        var tagTextElement = "<strong>" + tagText + "</strong>" + " | " + tagWeight;

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

        allTagsInTaskElement.appendChild(tagButtonGroupElement);
    }

}

function sortTagsByFrequency(tags) {
    // Create items array
    var items = Object.keys(tags).map(function (key) {
        return [key, tags[key]];
    });

// Sort the array based on the second element
    items.sort(function (first, second) {
        return second[1]["positiveWeight"] - first[1]["positiveWeight"];
    });

    return items;
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
                document.getElementById("showAddedStopwords").className = "btn btn-secondary round-corner";
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