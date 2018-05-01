var HTML_TAGS_TO_LOG = ["div", "a", "h1", "h2", "h3", "h4", "h5", "h6", "th", "td", "code", "b", "strong", "i"];
var TAGS_TO_BE_IGNORED = ["login", "like", "privacy", "policy", "user", "time", "title", "types", "updates", "text", "summary", "result", "required", "help", "share"];
var stopwords = ["a", "able", "about", "above", "abst", "accordance", "according", "accordingly", "across", "act", "actually", "added", "adj", "affected", "affecting", "affects", "after", "afterwards", "again", "against", "ah", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "announce", "another", "any", "anybody", "anyhow", "anymore", "anyone", "anything", "anyway", "anyways", "anywhere", "apparently", "approximately", "are", "aren", "arent", "arise", "around", "as", "aside", "ask", "asking", "at", "auth", "available", "away", "awfully", "b", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "begin", "beginning", "beginnings", "begins", "behind", "being", "believe", "below", "beside", "besides", "between", "beyond", "biol", "both", "brief", "briefly", "but", "by", "c", "ca", "came", "can", "cannot", "can't", "cause", "causes", "certain", "certainly", "co", "com", "come", "comes", "contain", "containing", "contains", "could", "couldnt", "d", "date", "did", "didn't", "different", "do", "does", "doesn't", "doing", "done", "don't", "down", "downwards", "due", "during", "e", "each", "ed", "edu", "effect", "eg", "eight", "eighty", "either", "else", "elsewhere", "end", "ending", "enough", "especially", "et", "et-al", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "except", "f", "far", "few", "ff", "fifth", "first", "five", "fix", "followed", "following", "follows", "for", "former", "formerly", "forth", "found", "four", "from", "further", "furthermore", "g", "gave", "get", "gets", "getting", "give", "given", "gives", "giving", "go", "goes", "gone", "got", "gotten", "h", "had", "happens", "hardly", "has", "hasn't", "have", "haven't", "having", "he", "hed", "hence", "her", "here", "hereafter", "hereby", "herein", "heres", "hereupon", "hers", "herself", "hes", "hi", "hid", "him", "himself", "his", "hither", "home", "how", "howbeit", "however", "hundred", "i", "id", "ie", "if", "i'll", "im", "immediate", "immediately", "importance", "important", "in", "inc", "indeed", "index", "information", "instead", "into", "invention", "inward", "is", "isn't", "it", "itd", "it'll", "its", "itself", "i've", "j", "just", "k", "keep	keeps", "kept", "kg", "km", "know", "known", "knows", "l", "largely", "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "lets", "like", "liked", "likely", "line", "little", "'ll", "look", "looking", "looks", "ltd", "m", "made", "mainly", "make", "makes", "many", "may", "maybe", "me", "mean", "means", "meantime", "meanwhile", "merely", "mg", "might", "million", "miss", "ml", "more", "moreover", "most", "mostly", "mr", "mrs", "much", "mug", "must", "my", "myself", "n", "na", "name", "namely", "nay", "nd", "near", "nearly", "necessarily", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "ninety", "no", "nobody", "non", "none", "nonetheless", "noone", "nor", "normally", "nos", "not", "noted", "nothing", "now", "nowhere", "o", "obtain", "obtained", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "omitted", "on", "once", "one", "ones", "only", "onto", "or", "ord", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "owing", "own", "p", "page", "pages", "part", "particular", "particularly", "past", "per", "perhaps", "placed", "please", "plus", "poorly", "possible", "possibly", "potentially", "pp", "predominantly", "present", "previously", "primarily", "probably", "promptly", "proud", "provides", "put", "q", "que", "quickly", "quite", "qv", "r", "ran", "rather", "rd", "re", "readily", "really", "recent", "recently", "ref", "refs", "regarding", "regardless", "regards", "related", "relatively", "research", "respectively", "resulted", "resulting", "results", "right", "run", "s", "said", "same", "saw", "say", "saying", "says", "sec", "section", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sent", "seven", "several", "shall", "she", "shed", "she'll", "shes", "should", "shouldn't", "show", "showed", "shown", "showns", "shows", "significant", "significantly", "similar", "similarly", "since", "six", "slightly", "so", "some", "somebody", "somehow", "someone", "somethan", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specifically", "specified", "specify", "specifying", "still", "stop", "strongly", "sub", "substantially", "successfully", "such", "sufficiently", "suggest", "sup", "sure	t", "take", "taken", "taking", "tell", "tends", "th", "than", "thank", "thanks", "thanx", "that", "that'll", "thats", "that've", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "thered", "therefore", "therein", "there'll", "thereof", "therere", "theres", "thereto", "thereupon", "there've", "these", "they", "theyd", "they'll", "theyre", "they've", "think", "this", "those", "thou", "though", "thoughh", "thousand", "throug", "through", "throughout", "thru", "thus", "til", "tip", "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "ts", "twice", "two", "u", "un", "under", "unfortunately", "unless", "unlike", "unlikely", "until", "unto", "up", "upon", "ups", "us", "use", "used", "useful", "usefully", "usefulness", "uses", "using", "usually", "v", "value", "various", "'ve", "very", "via", "viz", "vol", "vols", "vs", "w", "want", "wants", "was", "wasnt", "way", "we", "wed", "welcome", "we'll", "went", "were", "werent", "we've", "what", "whatever", "what'll", "whats", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "wheres", "whereupon", "wherever", "whether", "which", "while", "whim", "whither", "who", "whod", "whoever", "whole", "who'll", "whom", "whomever", "whos", "whose", "why", "widely", "willing", "wish", "with", "within", "without", "wont", "words", "world", "would", "wouldnt", "www", "x", "y", "yes", "yet", "you", "youd", "you'll", "your", "youre", "yours", "yourself", "yourselves", "you've", "z", "zero"];

var SETTINGS = {
    "notifications": "Enabled",
    "suggestions based on": "Open tabs",
    "suggestions threshold": "Medium",
    "block notifications on": ["www.google.com","www.google.co.in","www.facebook.com"]
};

var Suggestions = [];

chrome.storage.local.get("Page Content", function(pageContentObject){
    if(pageContentObject["Page Content"]){
        for(var taskId in TASKS){
            if(taskId != "lastAssignedId"){
                for(var index = 0; index<TASKS[taskId].tabs.length; index++){
                    var contentString = pageContentObject["Page Content"][TASKS[taskId].tabs[index].url];
                    try{
                        var suggestion = newTaskDetectorContent(TASKS[taskId].tabs[index].url, contentString, createTasksWithoutTab(taskId, index), pageContentObject["Page Content"], taskId, SETTINGS);
                        console.info(suggestion);
                        Suggestions.push(suggestion);
                    }
                    catch(error){
                        console.error("Can't do it for %s", TASKS[taskId].tabs[index].url);
                    }
                }
            }
        }
    }
});

function printMetricsOnSuggestions(threshold){
    var falsePositives = Suggestions.filter(function(sugg) { return (sugg.isCorrect == false)  && (sugg.confidence>=threshold)});
    var falseNegatives = Suggestions.filter(function(sugg) { return (sugg.isCorrect == true)  && (sugg.confidence<threshold)});
    var truePositives = Suggestions.filter(function(sugg) { return (sugg.isCorrect == true)  && (sugg.confidence>=threshold)});
    var trueNegatives = Suggestions.filter(function(sugg) { return (sugg.isCorrect == false)  && (sugg.confidence<threshold)});

    console.group("Metrics on Suggestions:")

    console.log("False Positives:");
    console.log(falsePositives);
    console.log("");
    console.log("False Negatives:");
    console.log(falseNegatives);
    console.log("")
    console.log("True Positives:");
    console.log(truePositives);
    console.log("")
    console.log("True Negatives:");
    console.log(trueNegatives);
    console.log("")

    console.groupEnd();
}

function newTaskDetectorContent(url, contentString, tasks, pageContent, actualTaskId, settings) {


    var tagsOfCurrentPage = getNamedEntityTagsOnCurrentDocument(contentString);
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

    var matchedTags = taskWiseMatches[taskWiseTotalScoresArray[0][0]];

    var suggestion = createSuggestion(url, taskWiseTotalScoresArray, matchedTags, tasks, actualTaskId, settings);

    return suggestion;

}

function getNamedEntityTagsOnCurrentDocument(contentString) {
    var tags = {};
    contentString = cleanTag(contentString);
    var doc = window.nlp(contentString);
    var topics = doc.nouns().data();
    for (var i = 0; i < topics.length; i++) {
        var topic = topics[i]["text"];
        topic = cleanTag(topic);
        if (isValidTag(topic)) {
            var tokens = topic.split(" ");
            for (var j = 0; j < tokens.length; j++){
                var token = tokens[j];
                if (isValidTag(token)) {
                    if (tags.hasOwnProperty(token.toLowerCase())) {
                        tags[token.toLowerCase()].increaseFrequency();
                    }
                    else {
                        var tag = new Tag(token);
                        tags[token.toLowerCase()] = tag;
                    }
                }
            }

            if (topic.split(" ").length > 1) {
                if ((tags.hasOwnProperty(topic.toLowerCase()))) {
                    tags[topic.toLowerCase()].increaseFrequency();
                } else {
                    var tag = new Tag(topic);
                    tags[topic.toLowerCase()] = tag;
                }
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

function createSuggestion(url, taskWiseTotalScoresArray, matchedTags, tasks, actualTaskId, settings) {
    if (taskWiseTotalScoresArray.length > 1) {

        var mostProbableTaskID = taskWiseTotalScoresArray[0][0];
        var mostProbableTaskName = tasks[mostProbableTaskID]["name"];

        var confidence = returnConfidence(taskWiseTotalScoresArray[0][1], taskWiseTotalScoresArray[1][1], matchedTags, settings);

        var correctValue = "Don't Know";

        if(mostProbableTaskID == actualTaskId){
            correctValue = true;
        }
        else{
            correctValue = false;
        }

        var suggestion = new Suggestion(url, matchedTags, TASKS[actualTaskId].name, mostProbableTaskName, correctValue, confidence);

        return suggestion;

    }

}

function returnConfidence(matchesWithMostProbableTask, matchesWithSecondMostProbableTask) {
    var diff = 0;
    diff = matchesWithMostProbableTask - matchesWithSecondMostProbableTask;
    var score = diff / matchesWithMostProbableTask;
    return score;
}

// Benchmark script utils

//Removes url at given index from given taskId and returns the modified task object
function createTasksWithoutTab(taskId, index){
    var tasks = JSON.parse(JSON.stringify(TASKS));
    tasks[taskId].tabs.splice(index, 1);
    return tasks;
}


