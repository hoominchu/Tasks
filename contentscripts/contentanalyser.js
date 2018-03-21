$(document).ready(function () {

    chrome.storage.local.get("readableTagsDict", function(readableTagsDict){
        if(isEmpty((readableTagsDict))){
            chrome.storage.local.set({"readableTagsDict": {} });
            var readableTagsDict = {};
            var stopwordsReadable = {};
            logReadableTags(readableTagsDict, stopwordsReadable);
        }
        else{
            chrome.storage.local.get("Stopwords for readable websites", function (stopwords) {
                if (stopwords["Stopwords for readable websites"]) {
                    logReadableTags(readableTagsDict["readableTagsDict"], stopwords["Stopwords for readable websites"]);
                }
                else {
                    var stopwordsReadable = {};
                    logReadableTags(readableTagsDict["readableTagsDict"], stopwordsReadable);
                }
            });
        }
    });

    chrome.storage.local.get("TASKS", function (tasksDict) {
        var tasksObject = tasksDict["TASKS"];
        chrome.storage.local.get("Text Log", function (textLogDict) {
            if (isEmpty(textLogDict)) {
                chrome.storage.local.set({"Text Log": {}}, function () {
                    var logDict = {};
                    newTaskDetector(tasksObject, logDict);
                    chrome.storage.local.get("Stopwords for websites", function (stopwords) {
                        if (stopwords["Stopwords for websites"]) {
                            logTags(window.location.href, logDict, stopwords["Stopwords for websites"]);
                        }
                        else {
                            logTags(window.location.href, logDict, {});
                        }
                    });
                    storePageContent(window.location.href, document.documentElement.innerText);
                    console.log(getCommonTagsInNTasks(2, tasksObject, logDict));
                });
            }
            else {
                var logDict = textLogDict["Text Log"];
                newTaskDetector(tasksObject, logDict);
                chrome.storage.local.get("Stopwords for websites", function (stopwords) {
                    if (stopwords["Stopwords for websites"]) {
                        logTags(window.location.href, logDict, stopwords["Stopwords for websites"]);
                    }
                    else {
                        logTags(window.location.href, logDict, {});
                    }
                });
                storePageContent(window.location.href, document.documentElement.innerText);
                console.log(getCommonTagsInNTasks(2, tasksObject, logDict));
            }
        });
    });
});
        //newTaskDetector(logDict);

var HTML_TAGS_TO_LOG = ["div", "span", "a", "h1", "h2", "th", "td"];
var DOMAINS_TO_BE_IGNORED = ["www.google.com", "www.google.co.in", "www.facebook.com"];
var TAGS_NOT_TO_COMPARE = [];
var DOMAIN_WISE_TAGS_TO_BE_IGNORED = {"www.google.com": ["search"]};
var URL_ENDINGS_TO_BE_IGNORED = [".pdf"];
var TAGS_TO_BE_IGNORED = ["like", "privacy policy", "help", "share"];
var stopWordsDict = [];

var give_suggestions_by = "tabs";

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
    var domain = getDomainFromURL(url);
    var tags_to_be_ignored = [];
    if (DOMAIN_WISE_TAGS_TO_BE_IGNORED.hasOwnProperty(domain)) {
        tags_to_be_ignored = DOMAIN_WISE_TAGS_TO_BE_IGNORED[domain];
    }

    var tags = {};

    // Logging meta elements
    var metaElements = document.getElementsByTagName("meta");
    for (var q = 0; q < metaElements.length; q++) {
        var element = metaElements[q];
        var metaContent = element.getAttribute("content");
        if (isValidTag(metaContent)){
            var tag = new Tag(metaContent);
            tag.increaseFrequency("meta");
            tags[metaContent] = tag;
        }
    }

    for (var j = 0; j < HTML_TAGS_TO_LOG.length; j++) {
        var htmlTag = HTML_TAGS_TO_LOG[j];
        var elems = document.getElementsByTagName(htmlTag);
        for (var i = 0; i < elems.length; i++) {
            var currentElem = elems[i];
            var elemText = currentElem.innerText;
            elemText = cleanTag(elemText);
            if (tags_to_be_ignored.indexOf(elemText) < 0) {
                if (isValidTag(elemText)) {
                    var elemTextLowerCase = elemText.toLowerCase();
                    if (tags[elemTextLowerCase]) {
                        var tag = tags[elemTextLowerCase];
                        tag.increaseFrequency(htmlTag); // Functions to calculate weight are in the constructor.
                        tag.addPosition(currentElem);
                        tags[elemTextLowerCase] = tag;
                    } else {
                        var tag = new Tag(elemText);
                        tag.increaseFrequency(htmlTag);
                        tag.addPosition(currentElem);
                        tags[elemTextLowerCase] = tag;
                    }
                }
            }
        }
        logObject[url] = tags;
    }

    if(stopwords[domain]){
          if(stopwords[domain]["urlsRead"].indexOf(url) < 0) {
            stopwords[domain]["stopwords"] = _.intersection(Object.keys(tags), stopwords[domain]["tags"]);
            stopwords[domain]["tags"] = _.intersection(Object.keys(tags), stopwords[domain]["tags"]);
            console.log(Object.keys(tags));
            // console.log(_.intersection(Object.keys(tags), stopwords[getDomainFromURL(url)]["tags"]));
            stopwords[domain]["urlsRead"].push(url);
            updateStorage("Stopwords for websites", stopwords);
          }
    }
    else {
        stopwords[domain] = {};
        stopwords[domain]["stopwords"] = [];
        stopwords[domain]["tags"] = Object.keys(tags);
        // stopwords[domain]["uniqueUrlsRead"] = 1;
        stopwords[domain]["urlsRead"] = [];
        stopwords[domain]["urlsRead"].push(url);
        updateStorage("Stopwords for websites", stopwords);
    }
    console.log("Stop words");
    console.log(stopwords);
    console.log("--------------");
    console.log("Text log");
    console.log(logObject);
    updateStorage("Text Log", logObject);

}

function getTagsOnDocument(htmlDocument) {

    var tags = {};

    for (var i = 0; i < HTML_TAGS_TO_LOG.length; i++) {
        var htmlTag = HTML_TAGS_TO_LOG[i];
        var elements = htmlDocument.getElementsByTagName(htmlTag);

        for (var j = 0; j < elements.length; j++) {
            var elem = elements[j];
            var text = elem.innerText;
            text = cleanTag(text);
            if (isValidTag(text)) {
                var textLowerCase = text.toLowerCase();
                if (tags[textLowerCase]) {
                    var tag = tags[textLowerCase];
                    tag.increaseFrequency(htmlTag); // Functions to calculate weight are in the constructor.
                    tag.addPosition(elem);
                    tags[textLowerCase] = tag;
                } else {
                    var tag = new Tag(text);
                    tag.increaseFrequency(htmlTag);
                    tag.addPosition(elem);
                    tags[textLowerCase] = tag;
                }
            }
        }
    }

    return tags;
}

function getTaskTags(task, tagLog) {
    var allTags = [];
    var taskURLs = [];

    if (give_suggestions_by == "tabs"){
        for (var tab in task["tabs"]) {
            taskURLs.push(task["tabs"][tab]["url"]);
        }
    } else if (give_suggestions_by == "likes") {
        taskURLs = task["likedPages"];
    }

    for (var i = 0; i < taskURLs.length; i++) {
        var url = taskURLs[i];
        if (tagLog.hasOwnProperty(url)) {
            allTags.concat(Object.keys(tagLog[url]));
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

function getCommonTagScores(tags, task, tagLog) {
    var commonTagScores = {};
    var taskURLs = [];

    // Use for suggestions based on open tabs.
    for (var tab in task["tabs"]) {
        taskURLs.push(task["tabs"][tab]["url"]);
    }

    // Use for suggestions based on liked pages. To be edited.
    // for (var tab in task["tabs"]) {
    //     taskURLs.push(task["tabs"][tab]["url"]);
    // }

    for (var i = 0; i < taskURLs.length; i++) {
        var url = taskURLs[i];
        if (tagLog.hasOwnProperty(url)) {
            var tagsInURL = tagLog[url];

            for (var text in tags) {
                var tag1 = tags[text];
                if (tagsInURL.hasOwnProperty(text)) {
                    var tag2 = tagsInURL[text];
                    commonTagScores[text] = getMatchScore(tag1, tag2);
                }
            }
        }
    }

    return commonTagScores;
}

function getTaskWiseCommonTags(tags, tasks, tagLog) {
    var taskwiseCommonTagScores = {};

    for (var taskID in tasks) {
        if (taskID !== 'lastAssignedId' && taskID > 0 && tasks[taskID]["archived"] === false) {
            var commonTagScores = getCommonTagScores(tags, tasks[taskID], tagLog);
            taskwiseCommonTagScores[taskID] = commonTagScores;
        }
    }

    return taskwiseCommonTagScores;
}

function getTaskwiseTotalScores(taskwiseCommonTagScores) {
    var taskwiseTotalScores = {};

    for (var taskID in taskwiseCommonTagScores) {
        var totalTaskScore = 0;
        var taskScores = taskwiseCommonTagScores[taskID];
        for (var key in taskScores) {
            totalTaskScore = totalTaskScore + taskScores[key];
        }

        taskwiseTotalScores[taskID] = totalTaskScore;
    }

    return taskwiseTotalScores;
}

function newTaskDetector(tasks, textLog) {
    var current_page_URL = location.href;
    var current_page_domain = getDomainFromURL(current_page_URL);

    if (shouldDetectTaskForPage(current_page_URL)) {

        console.log("Executing detector");

        var tagsOfCurrentPage = getTagsOnDocument(document);

        var taskwiseCommonTags = getTaskWiseCommonTags(tagsOfCurrentPage, tasks, textLog);

        var taskWiseTotalScores = getTaskwiseTotalScores(taskwiseCommonTags);

        // Create probableTasks array
        var taskWiseTotalScoresArray = Object.keys(taskWiseTotalScores).map(function (key) {
            return [key, taskWiseTotalScores[key]];
        });

        // Sorting probableTasks array
        taskWiseTotalScoresArray.sort(function (o1, o2) {
            return o2[1] - o1[1];
        });

        console.log("Common tags in tasks in descending order");
        console.log(taskWiseTotalScoresArray);

        chrome.storage.local.get("CTASKID", function (resp) {
            var ctaskid = resp["CTASKID"];
            suggestProbableTask(taskWiseTotalScoresArray, ctaskid, tasks);
        });

    } else {
        console.log("Domain is to be ignored. Did not execute detector.");
    }
}

function suggestProbableTask(taskWiseTotalScoresArray, currentTaskID, tasks) {
    if (taskWiseTotalScoresArray.length > 1) {
        var mostProbableTaskID = taskWiseTotalScoresArray[0][0];

        var secondMostProbableTaskID = taskWiseTotalScoresArray[1][0];

        var diff = 0;
        diff = taskWiseTotalScoresArray[0][1] - taskWiseTotalScoresArray[1][1];

        console.log(diff / taskWiseTotalScoresArray[0][1]);

        if ((diff / taskWiseTotalScoresArray[0][1]) > 0.25) {
            if (currentTaskID !== mostProbableTaskID) {
                var mostProbableTask = tasks[mostProbableTaskID];
                console.log("This page looks like it belongs to task " + mostProbableTask["name"]);
                // alert("Change task!");
                loadSuggestion(1, mostProbableTaskID, tasks)
            }
        }
    }
}

// Shows chrome notification.
function loadSuggestion(tab, mostProbableTaskID, tasks) {

    var mostProbableTaskName = tasks[mostProbableTaskID]["name"];
    chrome.runtime.sendMessage({
        "type": "task suggestion",
        "probable task": mostProbableTaskName,
        "probable task id": mostProbableTaskID
    });

}

// Takes an uncleaned tag and cleans it. Add any required condition in this condition.
function cleanTag(str) {

    str.replace(/(\r\n\t|\n|\r\t)/gm, " ");

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
    if (tag == null) {
        return false;
    }
    return tag.length < 20 && tag.length > 3 && /.*[a-zA-Z].*/g.test(tag) && /^([^0-9]*)$/g.test(tag) && TAGS_TO_BE_IGNORED.indexOf(tag) < 0;
}

function removeDuplicatesInArray(arr) {
    var unique_array = arr.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
    });
    return unique_array
}

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

// Updates chrome.storage.local with key and object.
function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}

function logReadableTags(readableTagsDict, stopwords){
    var loc = document.location;
    var url = window.location.href;
    var domain = getDomainFromURL(window.location.href);
    var documentClone = document.cloneNode(true);
    var uri = {
        spec: loc.href,
        host: loc.host,
        prePath: loc.protocol + "//" + loc.host,
        scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
        pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
    };
    var article = new Readability(uri, documentClone).parse();
    readableTagsDict[url] = getTagsOnDocument(htmlToElement(article.content));
    updateStorage("readableTagsDict", readableTagsDict);

    if(stopwords[domain]){
        if(stopwords[domain]["urlsRead"].indexOf(url) < 0) {
            stopwords[domain]["stopwords"] = _.intersection(Object.keys(readableTagsDict[url]), stopwords[domain]["tags"]);
            stopwords[domain]["tags"] = _.intersection(Object.keys(readableTagsDict[url]), stopwords[domain]["tags"]);
            console.log(Object.keys(readableTagsDict[url]));
            // console.log(_.intersection(Object.keys(tags), stopwords[getDomainFromURL(url)]["tags"]));
            stopwords[domain]["urlsRead"].push(url)
            updateStorage("Stopwords for readable websites", stopwords);
        }
    }
    else {
        stopwords[domain] = {};
        stopwords[domain]["stopwords"] = [];
        stopwords[domain]["tags"] = Object.keys(readableTagsDict[url]);
        // stopwords[domain]["uniqueUrlsRead"] = 1;
        stopwords[domain]["urlsRead"] = [];
        stopwords[domain]["urlsRead"].push(url);
        updateStorage("Stopwords for readable websites", stopwords);
    }


}

function getJaccardScores(urlTags1, urlTags2){
    var intersection = _.intersection(urlTags1, urlTags2);
    var union = _.union(urlTags1, urlTags2);
    var jaccardScore = intersection.length / union.length;
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
