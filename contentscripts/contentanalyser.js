$(document).ready(function () {
    chrome.storage.local.get("Text Log", function (textLogDict) {
        var logDict = textLogDict["Text Log"];

        chrome.storage.local.get("TASKS", function (tasksDict) {
            var tasksObject = tasksDict["TASKS"];
            newTaskDetector(tasksObject, logDict);
            logContent(window.location.href, logDict);
        });

        // newTaskDetector(logDict);

    });

});

var HTML_TAGS_TO_LOG = ["div", "span", "a", "h1", "h2", "th", "td"];

var DOMAINS_TO_BE_IGNORED = ["www.google.com", "www.google.co.in", "www.facebook.com"];
var TAGS_NOT_TO_COMPARE = [];
var DOMAIN_WISE_TAGS_TO_BE_IGNORED = {"www.google.com": ["search"]};
var URL_ENDINGS_TO_BE_IGNORED = [".pdf"];

function shouldDetectTaskForPage(url) {
    var page_URL = url;
    var page_domain = getDomainFromURL(page_URL);
    if (DOMAINS_TO_BE_IGNORED.indexOf(page_domain) > 0) {
        return false;
    }
    for (var ending in URL_ENDINGS_TO_BE_IGNORED) {
        if (page_URL.endsWith(ending)) {
            return false;
        }
    }
    return true;
}

function logContent(url, logDict) {
    var logObject = logDict;

    var current_page_URL = location.href;
    var current_page_domain = getDomainFromURL(current_page_URL);
    var tags_to_be_ignored = [];
    if (DOMAIN_WISE_TAGS_TO_BE_IGNORED.hasOwnProperty(current_page_domain)) {
        tags_to_be_ignored = DOMAIN_WISE_TAGS_TO_BE_IGNORED[current_page_domain];
    }

    var texts = {};

    for (var j = 0; j < HTML_TAGS_TO_LOG.length; j++) {
        var logTag = HTML_TAGS_TO_LOG[j];
        var elems = document.getElementsByTagName(logTag);
        for (var i = 0; i < elems.length; i++) {
            var currentElem = elems[i];
            var elemText = currentElem.innerText;
            elemText = cleanTag(elemText);
            if (tags_to_be_ignored.indexOf(elemText) < 0) {
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

}

function getTagsOnCurrentPage() {

    var tags = [];

    for (var i = 0; i < HTML_TAGS_TO_LOG.length; i++) {
        var logTag = HTML_TAGS_TO_LOG[i];
        var elems = document.getElementsByTagName(logTag);

        for (var count = 0; count < elems.length; count++) {
            var it = elems[count].innerText;
            it = cleanTag(it);
            if (isValidTag(it) && tags.indexOf(it) < 0) {
                tags.push(it.toLowerCase());
            }
        }
    }

    tags = removeDuplicatesInArray(tags);

    return tags;
}

function getCommonTags(tags, task, tagLog) {
    var commonTags = [];
    var taskURLs = [];

    for (var tab in task["tabs"]) {
        taskURLs.push(task["tabs"][tab]["url"]);
    }

    for (var i = 0; i < taskURLs.length; i++) {
        var url = taskURLs[i];
        if (tagLog.hasOwnProperty(url)) {
            var tagsInURL = tagLog[url];

            for (var j = 0; j < tags.length; j++) {
                var tag = tags[j];
                if (tagsInURL.hasOwnProperty(tag)) {
                    if (commonTags.indexOf(tag) < 0) {
                        commonTags.push(tag);
                    }
                }
            }
        }
    }

    return commonTags;
}

function getTaskWiseCommonTags(tags, tasks, tagLog) {
    var taskwiseCommonTags = {};

    for (var taskID in tasks) {
        if (taskID !== 'lastAssignedId' && taskID > 0 && tasks[taskID]["archived"] === false) {
            var commonTags = getCommonTags(tags, tasks[taskID], tagLog);
            taskwiseCommonTags[taskID] = commonTags;
        }
    }

    return taskwiseCommonTags;
}

function newTaskDetector(tasks, textLog) {
    var current_page_URL = location.href;
    var current_page_domain = getDomainFromURL(current_page_URL);

    if (shouldDetectTaskForPage(current_page_URL)) {

        console.log("Executing detector");

        var tagsOfCurrentPage = getTagsOnCurrentPage();

        var taskwiseCommonTags = getTaskWiseCommonTags(tagsOfCurrentPage, tasks, textLog);

        // Create probableTasks array
        var taskWiseCommonTagsArray = Object.keys(taskwiseCommonTags).map(function (key) {
            return [key, taskwiseCommonTags[key]];
        });

        // Sorting probableTasks array
        taskWiseCommonTagsArray.sort(function (o1, o2) {
            return o2[1].length - o1[1].length;
        });

        console.log("Common tags in tasks in descending order");
        console.log(taskWiseCommonTagsArray);

        chrome.storage.local.get("CTASKID", function (resp) {
            var ctaskid = resp["CTASKID"];
            suggestProbableTask(taskWiseCommonTagsArray, ctaskid, tasks);
        });

    } else {
        console.log("Domain is to be ignored. Did not execute detector.");
    }
}

function oldTaskDetector(tasks, textLog) {

    var current_page_URL = location.href;
    var current_page_domain = getDomainFromURL(current_page_URL);

    if (shouldDetectTaskForPage(current_page_URL)) {

        console.log("Executing detector");

        var ITsOfCurrentPage = getTagsOnCurrentPage();

        var taskScore = {};

        // Not using Jaccard Similarity for now.
        // var JaccardCounts = {};
        // var JaccardSimilarityScores = {};

        var allITIntersection = [];

        var taskITs = {};

        for (var i = 0; i < HTML_TAGS_TO_LOG.length; i++) {
            var logTag = HTML_TAGS_TO_LOG[i];
            for (var taskID in tasks) {
                if (tasks.hasOwnProperty(taskID)) {
                    if (taskID !== 'lastAssignedId' && taskID > 0 && tasks[taskID]["archived"] === false) {

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

                        // if (!JaccardCounts[taskID]) {
                        //     JaccardCounts[taskID] = {};
                        //     JaccardCounts[taskID]["Intersection"] = 0;
                        //     JaccardCounts[taskID]["Union"] = 0;
                        //
                        //     JaccardSimilarityScores[taskID] = 0;
                        // }

                        for (var j = 0; j < taskURLs.length; j++) {
                            var urlInTask = taskURLs[j]["url"];
                            var urlDomain = getDomainFromURL(urlInTask);
                            if (textLog[urlInTask]) {
                                var ITsOfURL = textLog[urlInTask];
                                for (var k = 0; k < ITsOfCurrentPage.length; k++) {
                                    var innerText = ITsOfCurrentPage[k];
                                    if (ITsUnion.indexOf(innerText) < 0) {
                                        ITsUnion.push(innerText);
                                    }
                                    if (ITsOfURL.hasOwnProperty(innerText)) {

                                        if (ITsIntersection.indexOf(innerText) < 0) {
                                            ITsIntersection.push(innerText);
                                            taskScore[taskID][logTag]++;
                                        }
                                        if (allITIntersection.indexOf(innerText) < 0) {
                                            allITIntersection.push(innerText);
                                        }
                                    }
                                }
                            }
                        }
                        taskITs[taskID] = ITsUnion;
                    }
                }

                // Logging common tags
                // console.log(ITsIntersection);

                // if (JaccardCounts[taskID]) {
                //     JaccardCounts[taskID]["Intersection"] = JaccardCounts[taskID]["Intersection"] + ITsIntersection.length;
                //     JaccardCounts[taskID]["Union"] = JaccardCounts[taskID]["Union"] + ITsUnion.length;
                // }
            }
        }

        var allITs = [];

        for (var taskid in taskITs) {
            allITs.push(taskITs[taskid]);
        }

        var commonITsFromAllTasks = _.intersection(allITs);
        // TAGS_NOT_TO_COMPARE = commonITsFromAllTasks;
        console.log("Common tags from all tasks");
        console.log(commonITsFromAllTasks);

        // for (var id in JaccardCounts) {
        //     JaccardSimilarityScores[id] = JaccardCounts[id]["Intersection"] / JaccardCounts[id]["Union"];
        // }

        // console.log("Jaccard Scores");
        // console.log(JaccardSimilarityScores);

        console.log("All common tags");
        console.log(allITIntersection);

        chrome.storage.local.get("CTASKID", function (ctaskid) {
            ctaskid = ctaskid["CTASKID"];
            // suggestProbableTask(HTML_TAGS_TO_LOG, taskScore, ctaskid, tasks);
            suggestProbableTask(HTML_TAGS_TO_LOG, taskScore, ctaskid, tasks);
        });
    } else {
        console.log("Domain is to be ignored. Did not execute detector.");
    }

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
    if (currentTaskID !== mostProbableTaskID) {
        var mostProbableTask = tasks[JaccardScores[0][0]]["name"];
        console.log("This page looks like it belongs to task " + mostProbableTask);
        // alert("Change task!");
        loadSuggestion(1, JaccardScores, tasks)
    }
}

function suggestProbableTask(taskWiseCommonTags, currentTaskID, tasks) {

    var mostProbableTaskID = taskWiseCommonTags[0][0];
    if (currentTaskID !== mostProbableTaskID) {
        var mostProbableTask = tasks[taskWiseCommonTags[0][0]];
        console.log("This page looks like it belongs to task " + mostProbableTask["name"]);
        // alert("Change task!");
        loadSuggestion(1, mostProbableTaskID, tasks)
    }
}

// Takes simple HTMLtag-wise scores of page and tasks and calls load suggestion function with the most probable task.
function oldSuggestProbableTask(tagsList, taskScores, currentTaskID, tasks) {
    // console.log(currentTaskID);
    var taskFinalScore = {};
    for (var taskID in taskScores) {
        taskFinalScore[taskID] = 0;
        // var task = taskScores[taskID];
        for (var i = 0; i < tagsList.length; i++) {
            taskFinalScore[taskID] = taskFinalScore[taskID] + taskScores[taskID][tagsList[i]];
        }
    }

    console.log("Task scores");
    console.log(taskScores);
    console.log(taskFinalScore);

    // Create probableTasks array
    var probableTasks = Object.keys(taskFinalScore).map(function (key) {
        return [key, taskFinalScore[key]];
    });

    // Sorting probableTasks array
    probableTasks.sort(function (o1, o2) {
        return o2[1] - o1[1];
    });

    var mostProbableTaskID = probableTasks[0][0];
    if (currentTaskID !== mostProbableTaskID) {
        var mostProbableTask = tasks[probableTasks[0][0]]["name"];
        console.log("This page looks like it belongs to task " + mostProbableTask);
        // alert("Change task!");
        loadSuggestion(1, probableTasks, tasks)
    }
}

// Shows chrome notification.
function loadSuggestion(tab, mostProbableTaskID, tasks) {

    var mostProbableTaskName = tasks[mostProbableTaskID[0][0]]["name"];
    chrome.runtime.sendMessage({
        "type": "task suggestion",
        "probable task": mostProbableTaskName,
        "probable task id": mostProbableTaskID
    });

}

// Takes an uncleaned tag and cleans it. Add any required condition in this condition.
function cleanTag(str) {

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

function removeDuplicatesInArray(arr) {
    var unique_array = arr.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
    });
    return unique_array
}

// Updates chrome.storage.local with key and object.
function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}