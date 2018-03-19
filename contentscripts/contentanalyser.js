$(document).ready(function () {
    chrome.storage.local.get("TASKS", function (tasksDict) {
        var tasksObject = tasksDict["TASKS"];
        chrome.storage.local.get("Text Log", function (textLogDict) {
            var logDict = textLogDict["Text Log"];

            newTaskDetector(tasksObject, logDict);
            chrome.storage.local.get("Stopwords for websites", function(stopwords){
                if(stopwords["Stopwords for websites"]){
                    logTags(window.location.href, logDict, stopwords["Stopwords for websites"]);
                }
                else{
                    logTags(window.location.href, logDict, {});
                }
            });
            storePageContent(window.location.href, document.documentElement.innerText);
        });
        //newTaskDetector(logDict);
    });
});

var HTML_TAGS_TO_LOG = ["div", "span", "a", "h1", "h2", "th", "td"];
var DOMAINS_TO_BE_IGNORED = ["www.google.com", "www.google.co.in", "www.facebook.com"];
var TAGS_NOT_TO_COMPARE = [];
var DOMAIN_WISE_TAGS_TO_BE_IGNORED = {"www.google.com": ["search"]};
var URL_ENDINGS_TO_BE_IGNORED = [".pdf"];
var TAGS_TO_BE_IGNORED = ["like", "privacy policy", "help", "share"];

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

function logTags(url, logDict, stopwords) {
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

        var tempObject = {};
        tempObject[getDomainFromURL(url)] = texts;

        if(stopwords[getDomainFromURL(url)]){
                stopwords[getDomainFromURL(url)]["tags"] = _.intersection(Object.keys(texts), stopwords[getDomainFromURL(url)]["tags"]);
                stopwords[getDomainFromURL(url)]["iteration"] = stopwords[getDomainFromURL(url)]["iteration"] + 1;

            updateStorage("Stopwords for websites", stopwords);
        }
        else {
            stopwords[getDomainFromURL(url)] = {};
            stopwords[getDomainFromURL(url)]["tags"] = Object.keys(texts);
            stopwords[getDomainFromURL(url)]["iteration"] = 1;
            updateStorage("Stopwords for websites", stopwords);
        }
        console.log(stopwords);
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

function getTaskTags(task, tagLog) {
    var allTags = [];
    var taskURLs = [];

    for (var tab in task["tabs"]) {
        taskURLs.push(task["tabs"][tab]["url"]);
    }
    for (var i = 0; i < taskURLs.length; i++) {
        var url = taskURLs[i];
        if (tagLog.hasOwnProperty(url)) {
            allTags.concat(Object.keys(tagLog(url)));
        }
    }
    return removeDuplicatesInArray(allTags);
}

function storePageContent(url, content) {
    chrome.storage.local.get("Page Content", function (response) {
        var cont = response["Page Content"];
        cont[url] = cleanTag(content);
        chrome.storage.local.set({"Page Content": cont});
    });
}

function getCommonTagsInNTasks(n, tasks, tagLog) {
    var tagCount = {};
    var filteredTags = [];

    for (var taskID in tasks) {
        if (taskID != "lastAssignedId" && taskID > 0 && tasks[taskID]["archived"] == false) {
            var taskTags = getTaskTags(tasks[taskID], tagLog);
            for (var i = 0; i < taskTags.length; i++) {
                var tag = taskTags[i];
                if (tagCount.hasOwnProperty(tag)) {
                    tagCount[tag]++;
                } else {
                    tagCount[tag] = 1;
                }
            }
        }
    }
    for (var tag in tagCount) {
        if (tagCount[tag] > n) {
            filteredTags.push(tag);
        }
    }

    return filteredTags;
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


function suggestProbableTask(taskWiseCommonTags, currentTaskID, tasks) {

    var mostProbableTaskID = taskWiseCommonTags[0][0];
    var secondMostProbableTaskID = taskWiseCommonTags[1][0];

    var diff = 0;
    diff = taskWiseCommonTags[0][1].length - taskWiseCommonTags[1][1].length;

    console.log(diff / taskWiseCommonTags[0][1].length);

    if ((diff / taskWiseCommonTags[0][1].length) > 0.25) {
        if (currentTaskID !== mostProbableTaskID) {
            var mostProbableTask = tasks[taskWiseCommonTags[0][0]];
            console.log("This page looks like it belongs to task " + mostProbableTask["name"]);
            // alert("Change task!");
            loadSuggestion(1, mostProbableTaskID, tasks)
        }
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

    str.replace(/\r?\n|\r/g, " ");

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
    return tag.length < 20 && tag.length > 3 && /.*[a-zA-Z].*/g.test(tag) && TAGS_TO_BE_IGNORED.indexOf(tag) < 0;
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

function getJaccardScores(urlTags1, urlTags2){
    var intersection = _.intersection(urlTags1, urlTags2);
    var union = _.union(urlTags1, urlTags2);
    var jaccardScore = intersection.length / union.length;
}
