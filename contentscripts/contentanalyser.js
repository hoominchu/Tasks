var HTML_TAGS_TO_LOG = ["div", "a", "h1", "h2", "h3", "h4", "h5", "h6", "th", "td", "code", "b", "strong", "i"];
var DOMAINS_TO_BE_IGNORED = []; //"www.google.com", "www.google.co.in", "www.facebook.com"
var TAGS_NOT_TO_COMPARE = [];
var DOMAIN_WISE_TAGS_TO_BE_IGNORED = {"www.google.com": ["search"]};
var URL_ENDINGS_TO_BE_IGNORED = [".pdf"];
var TAGS_TO_BE_IGNORED = ["login", "like", "privacy", "policy", "user", "time", "title", "types", "updates", "text", "summary", "result", "required", "help", "share"];
var stopwords = ["a", "able", "about", "above", "abst", "accordance", "according", "accordingly", "across", "act", "actually", "added", "adj", "affected", "affecting", "affects", "after", "afterwards", "again", "against", "ah", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "announce", "another", "any", "anybody", "anyhow", "anymore", "anyone", "anything", "anyway", "anyways", "anywhere", "apparently", "approximately", "are", "aren", "arent", "arise", "around", "as", "aside", "ask", "asking", "at", "auth", "available", "away", "awfully", "b", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "begin", "beginning", "beginnings", "begins", "behind", "being", "believe", "below", "beside", "besides", "between", "beyond", "biol", "both", "brief", "briefly", "but", "by", "c", "ca", "came", "can", "cannot", "can't", "cause", "causes", "certain", "certainly", "co", "com", "come", "comes", "contain", "containing", "contains", "could", "couldnt", "d", "date", "did", "didn't", "different", "do", "does", "doesn't", "doing", "done", "don't", "down", "downwards", "due", "during", "e", "each", "ed", "edu", "effect", "eg", "eight", "eighty", "either", "else", "elsewhere", "end", "ending", "enough", "especially", "et", "et-al", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "except", "f", "far", "few", "ff", "fifth", "first", "five", "fix", "followed", "following", "follows", "for", "former", "formerly", "forth", "found", "four", "from", "further", "furthermore", "g", "gave", "get", "gets", "getting", "give", "given", "gives", "giving", "go", "goes", "gone", "got", "gotten", "h", "had", "happens", "hardly", "has", "hasn't", "have", "haven't", "having", "he", "hed", "hence", "her", "here", "hereafter", "hereby", "herein", "heres", "hereupon", "hers", "herself", "hes", "hi", "hid", "him", "himself", "his", "hither", "home", "how", "howbeit", "however", "hundred", "i", "id", "ie", "if", "i'll", "im", "immediate", "immediately", "importance", "important", "in", "inc", "indeed", "index", "information", "instead", "into", "invention", "inward", "is", "isn't", "it", "itd", "it'll", "its", "itself", "i've", "j", "just", "k", "keep	keeps", "kept", "kg", "km", "know", "known", "knows", "l", "largely", "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "lets", "like", "liked", "likely", "line", "little", "'ll", "look", "looking", "looks", "ltd", "m", "made", "mainly", "make", "makes", "many", "may", "maybe", "me", "mean", "means", "meantime", "meanwhile", "merely", "mg", "might", "million", "miss", "ml", "more", "moreover", "most", "mostly", "mr", "mrs", "much", "mug", "must", "my", "myself", "n", "na", "name", "namely", "nay", "nd", "near", "nearly", "necessarily", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "ninety", "no", "nobody", "non", "none", "nonetheless", "noone", "nor", "normally", "nos", "not", "noted", "nothing", "now", "nowhere", "o", "obtain", "obtained", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "omitted", "on", "once", "one", "ones", "only", "onto", "or", "ord", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "owing", "own", "p", "page", "pages", "part", "particular", "particularly", "past", "per", "perhaps", "placed", "please", "plus", "poorly", "possible", "possibly", "potentially", "pp", "predominantly", "present", "previously", "primarily", "probably", "promptly", "proud", "provides", "put", "q", "que", "quickly", "quite", "qv", "r", "ran", "rather", "rd", "re", "readily", "really", "recent", "recently", "ref", "refs", "regarding", "regardless", "regards", "related", "relatively", "research", "respectively", "resulted", "resulting", "results", "right", "run", "s", "said", "same", "saw", "say", "saying", "says", "sec", "section", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sent", "seven", "several", "shall", "she", "shed", "she'll", "shes", "should", "shouldn't", "show", "showed", "shown", "showns", "shows", "significant", "significantly", "similar", "similarly", "since", "six", "slightly", "so", "some", "somebody", "somehow", "someone", "somethan", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specifically", "specified", "specify", "specifying", "still", "stop", "strongly", "sub", "substantially", "successfully", "such", "sufficiently", "suggest", "sup", "sure	t", "take", "taken", "taking", "tell", "tends", "th", "than", "thank", "thanks", "thanx", "that", "that'll", "thats", "that've", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "thered", "therefore", "therein", "there'll", "thereof", "therere", "theres", "thereto", "thereupon", "there've", "these", "they", "theyd", "they'll", "theyre", "they've", "think", "this", "those", "thou", "though", "thoughh", "thousand", "throug", "through", "throughout", "thru", "thus", "til", "tip", "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "ts", "twice", "two", "u", "un", "under", "unfortunately", "unless", "unlike", "unlikely", "until", "unto", "up", "upon", "ups", "us", "use", "used", "useful", "usefully", "usefulness", "uses", "using", "usually", "v", "value", "various", "'ve", "very", "via", "viz", "vol", "vols", "vs", "w", "want", "wants", "was", "wasnt", "way", "we", "wed", "welcome", "we'll", "went", "were", "werent", "we've", "what", "whatever", "what'll", "whats", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "wheres", "whereupon", "wherever", "whether", "which", "while", "whim", "whither", "who", "whod", "whoever", "whole", "who'll", "whom", "whomever", "whos", "whose", "why", "widely", "willing", "wish", "with", "within", "without", "wont", "words", "world", "would", "wouldnt", "www", "x", "y", "yes", "yet", "you", "youd", "you'll", "your", "youre", "yours", "yourself", "yourselves", "you've", "z", "zero"];
var prepositionStopwords = [];


// Setting up variables from settings

var SETTINGS = null;

chrome.storage.local.get("Settings", function (settings) {
    SETTINGS = settings["Settings"];

    console.log(SETTINGS);

    $(document).ready(function () {

        chrome.storage.local.get("TASKS", function (tasksDict) {
            var tasksObject = tasksDict["TASKS"];
            chrome.storage.local.get("Page Content", function (pageContent) {
                chrome.storage.local.get("Text Log", function (textLog) {


                    if (isEmpty(pageContent)) {
                        chrome.storage.local.set({"Page Content": {}}, function () {
                            storePageContent(window.location.href, document.documentElement.innerText);
                        });
                    }

                    if (isEmpty(textLog)) {
                        chrome.storage.local.set({"Text Log": {}}, function () {
                            newLogTags(window.location.href);
                        });
                    }

                    else if (!isEmpty(pageContent) && !isEmpty(textLog)) {
                        pageContent = pageContent["Page Content"];
                        // textLog = textLog["Text Log"];
                        newTaskDetectorContent(tasksObject, pageContent, SETTINGS);
                        storePageContent(window.location.href, document.documentElement.innerText);
                        console.log("Page content stored.");
                        newLogTags(window.location.href);
                        console.log("Tags of current page logged");
                    }
                });
            });
        });
    });
});


function shouldDetectTaskForPage(url, settings) {
    var ignore_domains = settings["block notifications on"];
    var page_URL = url;
    var page_domain = getDomainFromURL(page_URL);
    if (ignore_domains.indexOf(page_domain) > 0) {
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
        if (isValidTag(metaContent)) {
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
    updateStorage("Text Log", logObject);
}

function getNamedEntityTagsOnCurrentDocument() {
    var tags = {};
    var contentString = document.documentElement.innerText;
    contentString = cleanTag(contentString);
    var doc = window.nlp(contentString);
    var topics = doc.nouns().data();
    for (var i = 0; i < topics.length; i++) {
        var topic = topics[i]["text"];
        topic = cleanTag(topic);
        if (isValidTag(topic)) {
            if (tags.hasOwnProperty(topic.toLowerCase())) {
                tags[topic.toLowerCase()].increaseFrequency();
            }
            else {
                var tag = new Tag(topic);
                tags[topic.toLowerCase()] = tag;
            }
        }
    }

    return tags;
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

    if (SUGGESTIONS_BASED_ON == "tabs") {
        for (var tab in task["tabs"]) {
            taskURLs.push(task["tabs"][tab]["url"]);
        }
    } else if (SUGGESTIONS_BASED_ON == "likes") {
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
    if (DOMAINS_TO_BE_IGNORED.indexOf(getDomainFromURL(url)) < 0) {
        chrome.storage.local.get("Page Content", function (response) {
            var cont = response["Page Content"];
            cont[url] = cleanTag(content);
            chrome.storage.local.set({"Page Content": cont});
        });
    }
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
    if (SUGGESTIONS_BASED_ON == "tabs") {
        for (var tab in task["tabs"]) {
            taskURLs.push(task["tabs"][tab]["url"]);
        }
    } else if (SUGGESTIONS_BASED_ON == "likes") {
        taskURLs = task["likedPages"];
    }

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

function getMatchedTagsForTask(tags, task, pageContent) {

    var SUGGESTIONS_BASED_ON = SETTINGS["suggestions based on"];
    var matchedTags = {};
    var taskURLs = [];

    // Use for suggestions based on open tabs.
    if (SUGGESTIONS_BASED_ON == "Open tabs") {
        for (var tab in task["tabs"]) {
            taskURLs.push(task["tabs"][tab]["url"]);
        }
    } else if (SUGGESTIONS_BASED_ON == "Liked pages") {
        taskURLs = task["likedPages"];
    }

    for (var i = 0; i < taskURLs.length; i++) {
        var url = taskURLs[i];
        if (pageContent.hasOwnProperty(url)) {
            var contentString = pageContent[url];

            for (var text in tags) {
                var tag = tags[text]; // Can use tag.text if case should be considered

                if (contentString.toLowerCase().indexOf(text) > 0) { // text is lower case already
                    matchedTags[text] = tag;
                }
            }
        }
    }

    return matchedTags;
}

function getTaskWiseContentTagMatches(tags, tasks, pageContent, settings) {
    var taskWiseTagsMatched = {};

    for (var taskID in tasks) {
        if (taskID !== 'lastAssignedId' && taskID > 0 && tasks[taskID]["archived"] === false) {
            var matchedTags = getMatchedTagsForTask(tags, tasks[taskID], pageContent, settings);
            taskWiseTagsMatched[taskID] = matchedTags;
        }
    }

    return taskWiseTagsMatched;
}

function getTaskWiseMatchScores(taskWiseMatches) {
    var taskScores = {};

    for (var taskID in taskWiseMatches) {
        var matches = taskWiseMatches[taskID];
        taskScores[taskID] = Object.keys(matches).length;
    }
    return taskScores;
}

function newTaskDetectorContent(tasks, pageContent, settings) {

    var IS_SHOW_NOTIFICATIONS = true;
    if (settings["notifications"] == "Disabled") {
        IS_SHOW_NOTIFICATIONS = false;
    }
    var SUGGESTIONS_BASED_ON = settings["suggestions based on"];

    var current_page_URL = location.href;
    var current_page_domain = getDomainFromURL(current_page_URL);

    if (shouldDetectTaskForPage(current_page_URL, settings)) {
        console.log("Executing detector based on tags and page content");

        var tagsOfCurrentPage = getNamedEntityTagsOnCurrentDocument();

        var taskWiseMatches = getTaskWiseContentTagMatches(tagsOfCurrentPage, tasks, pageContent, settings);

        var taskWiseMatchScores = getTaskWiseMatchScores(taskWiseMatches);

        // Create probableTasks array
        var taskWiseTotalScoresArray = Object.keys(taskWiseMatchScores).map(function (key) {
            return [key, taskWiseMatchScores[key]];
        });

        // Sorting probableTasks array
        taskWiseTotalScoresArray.sort(function (o1, o2) {
            return o2[1] - o1[1];
        });

        console.log("Common tags in tasks in descending order. [Task ID : Number of matches]");
        console.log(taskWiseTotalScoresArray);

        console.log("Matched tags with current page and most similar task.");
        var matchedTags = taskWiseMatches[taskWiseTotalScoresArray[0][0]];
        console.log(matchedTags);

        // var tempStringToAddToStopwords = "";
        // for (var k in matchedTags) {
        //     tempStringToAddToStopwords = tempStringToAddToStopwords + "\"" + k + "\"" + ","
        // }
        // console.log(tempStringToAddToStopwords);

        if (IS_SHOW_NOTIFICATIONS) {
            chrome.storage.local.get("CTASKID", function (resp) {
                var ctaskid = resp["CTASKID"];
                suggestProbableTask(taskWiseTotalScoresArray, matchedTags, ctaskid, tasks, settings);
            });
        }

    } else {
        console.log("Domain is to be ignored. Did not execute detector.");
    }

}

function newTaskDetector(tasks, textLog) {
    var current_page_URL = location.href;
    var current_page_domain = getDomainFromURL(current_page_URL);

    if (shouldDetectTaskForPage(current_page_URL)) {

        console.log("Executing detector based on tag comparison");

        var tagsOfCurrentPage = getNamedEntityTagsOnCurrentDocument();

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

        console.log("Matched tags with current page and most similar task.");
        var matchedTags = taskwiseCommonTags[taskWiseTotalScoresArray[0][0]];
        console.log(matchedTags);

        var tempStringToAddToStopwords = "";
        for (var k in matchedTags) {
            tempStringToAddToStopwords = tempStringToAddToStopwords + "\"" + k + "\"" + ","
        }
        console.log(tempStringToAddToStopwords);

        chrome.storage.local.get("CTASKID", function (resp) {
            var ctaskid = resp["CTASKID"];
            suggestProbableTask(taskWiseTotalScoresArray, matchedTags, ctaskid, tasks);
        });

    } else {
        console.log("Domain is to be ignored. Did not execute detector.");
    }
}

function newLogTags(url) {
    chrome.storage.local.get("Text Log", function (textLog) {
        textLog = textLog["Text Log"];
        if (DOMAINS_TO_BE_IGNORED.indexOf(getDomainFromURL(url)) < 0) {
            textLog[url] = getNamedEntityTagsOnCurrentDocument();
            updateStorage("Text Log", textLog);
        }
    });
}

function sortTagsByFrequency(tags) {
    // Create items array
    var items = Object.keys(tags).map(function (key) {
        return [key, tags[key]];
    });

// Sort the array based on the second element
    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    return items;
}

function suggestProbableTask(taskWiseTotalScoresArray, matchedTags, currentTaskID, tasks, settings) {
    if (taskWiseTotalScoresArray.length > 1) {
        var mostProbableTaskID = taskWiseTotalScoresArray[0][0];

        var mostProbableTaskName = tasks[mostProbableTaskID]["name"];

        console.log("This page might belog to task " + mostProbableTaskName);

        var secondMostProbableTaskID = taskWiseTotalScoresArray[1][0];

        var matchedTagsSorted = sortTagsByFrequency(matchedTags);

        if (shouldShowSuggestion(taskWiseTotalScoresArray[0][1], taskWiseTotalScoresArray[1][1], matchedTags, settings)) {
            if (currentTaskID !== mostProbableTaskID) {
                var mostProbableTask = tasks[mostProbableTaskID];
                console.log("This page looks like it belongs to task " + mostProbableTask["name"]);
                // alert("Change task!");
                loadSuggestion(1, mostProbableTaskID, matchedTagsSorted, tasks)
            }
        }
    }
}

function shouldShowSuggestion(matchesWithMostProbableTask, matchesWithSecondMostProbableTask, matchedTags, settings) {

    var threshold = 0.0;
    if (settings["suggestions threshold"] == "Low") {
        threshold = 0.3;
    } else if (settings["suggestions threshold"] == "Medium") {
        threshold = 0.5;
    } else if (settings["suggestions threshold"] == "High") {
        threshold = 0.7;
    }
    var diff = 0;
    diff = matchesWithMostProbableTask - matchesWithSecondMostProbableTask;
    console.log(diff / matchesWithMostProbableTask);

    if ((diff / matchesWithMostProbableTask) > threshold) {
        if ((Object.keys(matchedTags).length) > 10) {
            return true;
        }

    }

    return false;
}

// Shows chrome notification.
function loadSuggestion(tab, mostProbableTaskID, matchedTags, tasks) {

    var mostProbableTaskName = tasks[mostProbableTaskID]["name"];
    chrome.runtime.sendMessage({
        "type": "task suggestion",
        "probable task": mostProbableTaskName,
        "probable task id": mostProbableTaskID,
        "matched tags": matchedTags
    });

}

// Takes an uncleaned tag and cleans it. Add any required condition in this condition.
function cleanTag(str) {

    str = str.trim();

    str = str.replace(/(\r\n\t|\n|\r\t)/gm, ". ");

    str = str.replace(/\u21b5/g, ". ");

    // Replaces spaces at the beginning
    str = str.replace(/^\s+/g, '');
    // Replaces spaces at the end
    str = str.replace(/\s+$/g, '');

    // Replaces " at the beginning
    str = str.replace(/^"+/g, '');
    // Replaces " at the end
    str = str.replace(/"+$/g, '');

    // Replaces , at the beginning
    str = str.replace(/^,+/g, '');
    // Replaces , at the end
    str = str.replace(/,+$/g, '');

    // Replaces - at the beginning
    str = str.replace(/^-+/g, '');
    // Replaces - at the end
    str = str.replace(/-+$/g, '');

    // Replaces ; at the beginning
    str = str.replace(/^;+/g, '');
    // Replaces ; at the end
    str = str.replace(/;+$/g, '');

    // Replaces ' at the beginning
    str = str.replace(/^'+/g, '');
    // Replaces ' at the end
    str = str.replace(/'+$/g, '');

    // Replaces . at the beginning
    str = str.replace(/^\.+/g, '');
    // Replaces . at the end
    str = str.replace(/\.+$/g, '');

    // Replaces ? at the beginning
    str = str.replace(/^\?+/g, '');
    // Replaces ? at the end
    str = str.replace(/\?+$/g, '');

    // Replaces 's at the end
    str = str.replace(/'s+$/g, '');

    str = str.trim();

    return str;
}

// Checks if a tag should be indexed. Add more conditions here if required.
function isValidTag(tag) {
    if (tag == null) {
        return false;
    }

    if (stopwords.indexOf(tag.toLowerCase()) > -1) {
        return false;
    }

    if (TAGS_TO_BE_IGNORED.indexOf(tag.toLowerCase()) > -1) {
        return false;
    }

    if (!(tag.match(/^[A-Za-z]+$/gim))) {
        return false;
    }

    return tag.length > 3 && tag.length < 25 && /.*[a-zA-Z].*/g.test(tag) && /^([^0-9]*)$/g.test(tag);
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

function getJaccardScores(urlTags1, urlTags2) {
    var intersection = _.intersection(urlTags1, urlTags2);
    var union = _.union(urlTags1, urlTags2);
    var jaccardScore = intersection.length / union.length;
    if (!isNaN(jaccardScore)) {
        return jaccardScore
    }
    else {
        return 0;
    }

}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
