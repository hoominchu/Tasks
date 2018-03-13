$(document).ready(function () {
    chrome.storage.local.get("Text Log", function (textLogDict) {
        var logDict = textLogDict["Text Log"];

        chrome.storage.local.get("TASKS", function (tasksDict) {
            var tasksObject = tasksDict["TASKS"];
            newTaskDetector(tasksObject, logDict);
        });

        // newTaskDetector(logDict);
        logContent(window.location.href, logDict);
    });

});


function logContent(url, logDict) {
    var logObject = logDict;
    var tagsToLog = ["div", "span", "a", "h1", "h2", "th", "td"];

    var texts = {};

    for (var j = 0; j < tagsToLog.length; j++) {
        var logTag = tagsToLog[j];
        var elems = document.getElementsByTagName(logTag);
        for (var i = 0; i < elems.length; i++) {
            var currentElem = elems[i];
            var elemText = currentElem.innerText;
            elemText = elemText.replace(/\r?\n|\r/g, "");
            if (elemText.length < 20 && elemText.length > 3 && /.*[a-zA-Z].*/g.test(elemText)) {
                elemText = elemText.toLowerCase();
                if (texts[elemText]) {
                    // console.log(texts[elemText]);
                    // console.log(texts[elemText]["frequency"]);
                    if (texts[elemText]["frequency"][logTag]) {
                        texts[elemText]["frequency"][logTag]++;
                    } else {
                        texts[elemText]["frequency"][logTag] = 1;
                    }
                } else {
                    var tempobj = {};
                    tempobj["frequency"] = {};
                    tempobj["frequency"][logTag] = 1;
                    texts[elemText] = tempobj;
                }
            }
        }
    }
    logObject[url] = texts;
    // console.log(logObject);
    updateStorage("Text Log", logObject);
}

function newTaskDetector(tasks, textLog) {
    var tagsToLog = ["div", "span", "a", "h1", "h2", "th", "td"];

    var taskScore = {};

    for (var i = 0; i < tagsToLog.length; i++) {
        var logTag = tagsToLog[i];
        var elems = document.getElementsByTagName(logTag);
        var ITsOfCurrentPage = [];

        for (var count = 0; count < elems.length; count++) {
            var it = elems[count].innerText;
            it = it.replace(/\r?\n|\r/g, "");
            if (it.length < 20 && it.length > 3 && /.*[a-zA-Z].*/g.test(it)) {
                ITsOfCurrentPage.push(it.toLowerCase());
            }
        }

        for (var taskID in tasks) {

            if (tasks.hasOwnProperty(taskID)) {
                if (taskID != 'lastAssignedId' && taskID > 0) {
                    var currentTask = tasks[taskID];
                    // Taking open tab urls. Can also take history URLs or URLs of liked pages.
                    var taskURLs = currentTask["tabs"];
                    if (!taskScore[taskID]) {
                        taskScore[taskID] = {};
                    }
                    if (!taskScore[taskID][logTag]) {
                        taskScore[taskID][logTag] = 0;
                    }

                    for (var j = 0; j < taskURLs.length; j++) {
                        var urlInTask = taskURLs[j]["url"];
                        if (textLog[urlInTask]) {
                            var ITsOfURL = textLog[urlInTask];
                            for (var k = 0; k < ITsOfCurrentPage.length; k++) {
                                var innerText = ITsOfCurrentPage[k];
                                if (ITsOfURL[innerText]) {
                                    taskScore[taskID][logTag]++;
                                }
                            }
                        }
                    }

                }
            }
        }
    }

    chrome.storage.local.get("CTASKID", function (ctaskid) {
        ctaskid = ctaskid["CTASKID"];
        suggestProbableTask(tagsToLog, taskScore, ctaskid, tasks);
    });

}

function suggestProbableTask(tagsList, taskScores, currentTaskID, tasks) {
    console.log(currentTaskID);
    var taskFinalScore = {};
    for (var taskID in taskScores) {
        taskFinalScore[taskID] = 0;
        // var task = taskScores[taskID];
        for (var i = 0; i < tagsList.length; i++) {
            taskFinalScore[taskID] = taskFinalScore[taskID] + taskScores[taskID][tagsList[i]];
        }
    }

    // Create probableTasks array
    var probableTasks = Object.keys(taskFinalScore).map(function (key) {
        return [key, taskFinalScore[key]];
    });

    // Sorting probableTasks array
    probableTasks.sort(function (o1, o2) {
        return o2[1] - o1[1];
    });

    var mostProbableTaskID = probableTasks[0][0];
    if (currentTaskID != mostProbableTaskID) {
        var mostProbableTask = tasks[probableTasks[0][0]]["name"];
        console.log("This page looks like it belongs to task " + mostProbableTask);
        // alert("Change task!");
        loadSuggestion(1, probableTasks, tasks)
    }
}

function loadSuggestion(tab, probableTasks, tasks) {

    var mostProbableTask = tasks[probableTasks[0][0]]["name"];
    // chrome.extension.sendRequest({msg: "Sup?"}, function(response) { // optional callback - gets response
    //     console.log(response.returnMsg);
    // });

    chrome.runtime.sendMessage({"type":"task suggestion","probable task":mostProbableTask});

    // alert("This page looks like it belongs to task " + mostProbableTask + "!");
    // var suggestNotification = $('<div class="alert alert-dismissible alert-light float" style="width: 10em; height: 4em; font-size: 10pt">\n' +
    //     '  <button type="button" class="close" data-dismiss="alert">&times;</button>\n' +
    //     '  This page looks like it belongs to task "' + mostProbableTask + '"' +
    //     '</div>');
    // $('body').append(suggestNotification);
}

function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}