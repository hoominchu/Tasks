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

    var similaritiesDict = {};

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
                    if (!taskScore[taskID]){
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
    console.log("Task Scores");
    console.log(taskScore);
}

function suggestProbableTask(tasks, similarURLsArray, similaritiesDict) {
    var taskScore = {};
    var taskToURLs = {};
    for (var key in tasks) {
        if (tasks.hasOwnProperty(key)) {
            if (key != 'lastAssignedId') {
                var currentTask = tasks[key];
                // Taking open tab urls. Can also take history urls.
                var urls = currentTask["tabs"];
                var urlsOfTask = [];
                var score = 0;
                console.log(typeof (urls));
                for (var j = 0; j < urls.length; j++) {
                    urlsOfTask.push(urls[j]["url"]);
                    if (similaritiesDict[urls[j]["url"]]) {
                        score = score + similaritiesDict[urls[j]["url"]]["frequency"]["total"];
                    }
                }
                taskToURLs[currentTask["id"]] = score;
            }
        }
    }
    var taskToURLArray = Object.keys(taskToURLs).map(function (key) {
        return [key, taskToURLs[key]];
    });

    console.log("Suggest task");
    console.log(taskToURLArray);
}

function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}