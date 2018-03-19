var HTML_TAGS_TO_LOG = ["div", "span", "a", "h1", "h2", "th", "td"];


function logContent(url, logDict) {
    var logObject = logDict;
    var tagsToLog = HTML_TAGS_TO_LOG;

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
    return logObject;
}

function cleanTag(str) {

    if (str == null) {
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

function getJaccardScores(urlTags1, urlTags2){
    var intersection = _.intersection(urlTags1, urlTags2);
    var union = _.union(urlTags1, urlTags2);
    var jaccardScore = intersection.length;
    return jaccardScore;
}

// function clusterTabs(tabs){
//     chrome.windows.getCurrent({"populate": true}, function(tabs){
//         for(var i = 0; i<tabs.length; i++){
//
//         }
//     });
// }

function clusterTabs(){
    chrome.windows.getCurrent({"populate": true}, function(window){
        var graph = []
        var tabs = window.tabs;
        var urls = [];
        for(var i = 0; i<tabs.length; i++){
            urls.push(tabs[i].url);
        }
        console.log(tabs);
        chrome.storage.local.get("Text Log", function(textLog){
            chrome.storage.local.get("Stopwords for websites", function(stopwords){
                graph = jaccardTable(urls, textLog["Text Log"], stopwords["Stopwords for websites"]);
                console.log(graph);
                function compare(a,b) {
                    if (a["weight"] < b["weight"])
                        return -1;
                    if (a["weight"] > b["weight"])
                        return 1;
                    return 0;
                }
                var sortedGraphs = graph.sort(compare);
                console.log(sortedGraphs);
                var clusters = jLouvain().nodes(urls).edges(graph);
                var result = clusters();
                console.log(result);
                var sortedResults = Object.keys(result).sort(function(a,b){return result[a]-result[b]});
                console.log(sortedResults);
            });

        });

    });
}



function jaccardTable(urls, textLog, stopwords){
    var table = [];
    for(var i = 0; i<urls.length; i++){
        for(var j = 0; j<urls.length; j++){
            if(i != j){
                if(textLog[urls[i]] && textLog[urls[j]]){
                    console.log("Url 1:" + urls[i]);
                    console.log("Url 2:" + urls[j]);
                    if(getDomainFromURL(urls[i]) == getDomainFromURL(urls[j]) && Boolean(stopwords[getDomainFromURL(urls[i])])){
                            console.log(_.intersection(_.difference(Object.keys(textLog[urls[i]]), stopwords[getDomainFromURL(urls[i])]["tags"]),  _.difference(Object.keys(textLog[urls[j]]), stopwords[getDomainFromURL(urls[j])]["tags"])));
                            var jScore = getJaccardScores(_.difference(Object.keys(textLog[urls[i]]), stopwords[getDomainFromURL(urls[i])]["tags"]), _.difference(Object.keys(textLog[urls[j]]), stopwords[getDomainFromURL(urls[j])]["tags"]))*1000;
                            console.log("STOPWORDS");
                            console.log(stopwords[getDomainFromURL(urls[i])]["tags"]);
                    }
                    else{
                        var jScore = getJaccardScores(Object.keys(textLog[urls[i]]), Object.keys(textLog[urls[j]]))*1000;
                    }
                    var temp = {
                        "source": urls[i],
                        "target": urls[j],
                        "weight": jScore
                    }
                    table.push(temp);
                }
                else{

                    var temp = {
                        "source": urls[i],
                        "target": urls[j],
                        "weight": 0
                    }
                    table.push(temp);
                }
            }
        }
    }
    return table;
}