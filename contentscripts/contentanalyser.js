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
            elemText = cleanTag(elemText);
            if (isValidTag(elemText)) {
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
    var JaccardCounts = {};
    var JaccardSimilarityScores = {};

    for (var i = 0; i < tagsToLog.length; i++) {
        var logTag = tagsToLog[i];
        var elems = document.getElementsByTagName(logTag);
        var ITsOfCurrentPage = [];

        for (var count = 0; count < elems.length; count++) {
            var it = elems[count].innerText;
            it = cleanTag(it);
            if (isValidTag(it)) {
                ITsOfCurrentPage.push(it.toLowerCase());
            }
        }

        for (var taskID in tasks) {

            if (tasks.hasOwnProperty(taskID)) {
                if (taskID != 'lastAssignedId' && taskID > 0) {

                    var ITsUnion = ITsOfCurrentPage;
                    var ITsIntersection = [];

                    var currentTask = tasks[taskID];
                    // Taking open tab urls. Can also take history URLs or URLs of liked pages.
                    var taskURLs = currentTask["tabs"];
                    if (!taskScore[taskID]) {
                        taskScore[taskID] = {};
                    }
                    if (!taskScore[taskID][logTag]) {
                        taskScore[taskID][logTag] = 0;
                    }

                    if (!JaccardCounts[taskID]) {
                        JaccardCounts[taskID]={};
                        JaccardCounts[taskID]["Intersection"] = 0;
                        JaccardCounts[taskID]["Union"] = 0;

                        JaccardSimilarityScores[taskID] = 0;
                    }

                    for (var j = 0; j < taskURLs.length; j++) {
                        var urlInTask = taskURLs[j]["url"];
                        if (textLog[urlInTask]) {
                            var ITsOfURL = textLog[urlInTask];
                            for (var k = 0; k < ITsOfCurrentPage.length; k++) {
                                var innerText = ITsOfCurrentPage[k];
                                if (ITsUnion.indexOf(innerText) < 0) {
                                    ITsUnion.push(innerText);
                                }
                                if (ITsOfURL[innerText]) {
                                    if (ITsIntersection.indexOf(innerText) < 0) {
                                        ITsIntersection.push(innerText);
                                    }
                                    taskScore[taskID][logTag]++;
                                }
                            }
                        }
                    }

                }
            }

            // Logging common tags
            // console.log(ITsIntersection);
            if (JaccardCounts[taskID]) {
                JaccardCounts[taskID]["Intersection"] = JaccardCounts[taskID]["Intersection"] + ITsIntersection.length;
                JaccardCounts[taskID]["Union"] = JaccardCounts[taskID]["Union"] + ITsUnion.length;
            }
        }
    }

    for (var id in JaccardCounts) {
        JaccardSimilarityScores[id] = JaccardCounts[id]["Intersection"]/JaccardCounts[id]["Union"];
    }

    console.log(JaccardSimilarityScores);

    chrome.storage.local.get("CTASKID", function (ctaskid) {
        ctaskid = ctaskid["CTASKID"];
        // suggestProbableTask(tagsToLog, taskScore, ctaskid, tasks);
        suggestJaccardTask(JaccardSimilarityScores,ctaskid,tasks);
    });

}

// Takes Jaccard Scores of page and tasks and calls load suggestion function with the most probable task.
function suggestJaccardTask(JaccardScores, currentTaskID, tasks) {
    var JaccardScores = Object.keys(JaccardScores).map(function (key) {
        return [key, JaccardScores[key]];
    });
    JaccardScores.sort(function (o1, o2) {
        return o2[1] - o1[1];
    });
    var mostProbableTaskID = JaccardScores[0][0];
    if (currentTaskID != mostProbableTaskID) {
        var mostProbableTask = tasks[JaccardScores[0][0]]["name"];
        console.log("This page looks like it belongs to task " + mostProbableTask);
        // alert("Change task!");
        loadSuggestion(1, JaccardScores, tasks)
    }
}

// Takes simple HTMLtag-wise scores of page and tasks and calls load suggestion function with the most probable task.
function suggestProbableTask(tagsList, taskScores, currentTaskID, tasks) {
    // console.log(currentTaskID);
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

// Shows chrome notification.
function loadSuggestion(tab, probableTasks, tasks) {

    var mostProbableTask = tasks[probableTasks[0][0]]["name"];
    chrome.runtime.sendMessage({"type": "task suggestion", "probable task": mostProbableTask, "probable task id":probableTasks[0][0]});

}

// Takes an uncleaned tag and cleans it. Add any required condition in this condition.
function cleanTag(str) {

    if(str == null) {
        return str;
    }

    str.replace(/\r?\n|\r/g, "");

    // Replaces spaces at the beginning
    str = str.replace(/^\s+/g, '');
    // Replaces spaces at the end
    str = str.replace(/\s+$/g, '');

    // Replaces " at the beginning
    str = str.replace(/^"+/g, '');
    // Replaces " at the end
    str = str.replace(/"+$/g, '');

    return str;
}

// Checks if a tag should be indexed. Add more conditions here if required.
function isValidTag(tag) {
    return tag.length < 20 && tag.length > 3 && /.*[a-zA-Z].*/g.test(tag);
}

// Updates chrome.storage.local with key and object.
function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}