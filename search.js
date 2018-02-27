var engines = [
    {
        "engine": "Google",
        "mainUrl": "https://www.google.co.in/search?q=",
        "pageUrl": "&start=",
        "indexMarker": function (j) {
            return j * 10;
        },
        "selector": [{"class": "_Rm"}],
        "finalSelector": "innerText"
    },
    {
        "engine": "Yahoo",
        "mainUrl": "https://in.search.yahoo.com/search?p=",
        "pageUrl": "&b=",
        "indexMarker": function (j) {
            return ((j * 10) + 1)
        },
        "selector": [{"class": "fz-ms fw-m fc-12th wr-bw"}],
        "finalSelector": "innerText"
    },

    {
        "engine": "Bing",
        "mainUrl": "https://www.bing.com/search?q=",
        "pageUrl": "&first=",
        "indexMarker": function (j) {
            return j * 10;
        },
        "selector": [{"class": "b_algo"}, {"tag": "h2"}, {"tag": "a"}],
        "finalSelector": "href"
    }

];

var authors = [];
var authorsRetrieved = false;

var delayInMilliseconds = 4000; //1 second

// Results array is global and should be cleared before a new query is received and processed. These results will be displayed in the search results page.
// var SAILBOATRESULTS = [];
var urlToAuthorWeights = [];
var urlToDomainWeights = [];

// This function takes results object which contains results from Google, Bing, Yahoo etc., preferredDomains object and preferredAuthors object.
// Returns array of re-ordered (in descending order of computed weights) results with result object. Fields of result object are -- URL, Engine and Weight.
function getSailboatResults(results, preferredDomains, preferredAuthors) {

    var SAILBOATRESULTS = [];
    urlToAuthorWeights = {};
    urlToDomainWeights = [];

    for (var i = 0; i < results.length; i++) {
        var resObjTemp = results[i];
        var link = resObjTemp["url"];
        var engine = resObjTemp["engine"];
        var pageTitle = resObjTemp["title"];
        var textSnippet = resObjTemp["snippet"];
        var domain = getDomainFromURL(link);

        //Check if domain exists in domainToAuthorClassDict in author.js. If it doesn't exist there it doesn't make sense to get author and only domain is important.
        if (domainToAuthorClassDict[domain]) {
            httpGetAsyncForGetAuthor(link, preferredAuthors);
        }

        var domainWeight = 0;

        if (preferredDomains[domain]) {
            domainWeight = getDomainWeight(domain, preferredDomains);
        }
        var temp = {};
        temp["url"] = link;
        temp["engine"] = engine;
        temp["title"] = pageTitle;
        temp["snippet"] = textSnippet;
        temp["domain weight"] = domainWeight;
        urlToDomainWeights.push(temp);
    }

    // Adding delay to ensure all requests for getting authors are completed.
    setTimeout(function () {
        console.log(urlToDomainWeights.length);
        // Combining both author weights and domain weights
        for (var j = 0; j < urlToDomainWeights.length; j++) {
            var finalWeight = 0;
            var tempObj = urlToDomainWeights[j];

            var url = tempObj["url"];
            var engine = tempObj["engine"];
            var pageTitle = tempObj["title"];
            var textSnippet = tempObj["snippet"];
            var domainWeight = tempObj["domain weight"];

            // Adding domain weight
            finalWeight = finalWeight + domainWeight;

            // Adding author weight
            if (urlToAuthorWeights[url]) {
                finalWeight = finalWeight + urlToAuthorWeights[url];
            }
            // Computing final weight for a result. computeFinalWeight can be edited
            // finalWeight = domainWeight;//computeFinalWeight(domainWeight, authorWeight);
            var resObj = {};
            resObj["URL"] = url;
            resObj["Engine"] = engine;
            resObj["Title"] = pageTitle;
            resObj["Snippet"] = textSnippet;
            resObj["Weight"] = finalWeight;
            SAILBOATRESULTS.push(resObj);
        }


        // Sorting sailboatResults in descending order of weight
        var awesomeResult = SAILBOATRESULTS.sort(function (a, b) {
            return b["Weight"] - a["Weight"];
        });
        showSearchResults(awesomeResult);
        console.log("Awesome results");
        console.log(awesomeResult);

    }, delayInMilliseconds);
}


// Show search results
function showSearchResults(results) {
    for (var result in results) {

        var resultCard = document.createElement("div");
        resultCard.className = "search-result-card";

        // Setting up variables from result object
        var url = result["URL"];
        var engine = result["Engine"];
        var weight = result["Weight"];
        var title = result["Title"];
        var snippet = result["Snippet"];

        // Creating elements to be displayed
        var resultTitleElem = document.createElement("h4");
        // resultTitleElem.className = "search-result-title";
        resultTitleElem.innerText = title;
        resultTitleElem.setAttribute("a",url);

        var engineElem = document.createElement("span");
        engineElem.className = "badge badge-pill badge-light";
        engineElem.innerText = engine;

        var weightElem = document.createElement("div");
        engineElem.className = "search-result-weight";
        engineElem.innerText = weight;

        var linkElem = document.createElement("p");
        linkElem.className = "search-result-link text-success";
        linkElem.innerText = url;

        var snippetElem = document.createElement("p");
        snippetElem.className = "search-result-snippet text-muted";
        snippetElem.innerText = snippet;

        // Adding all the components to result card
        resultCard.appendChild(resultTitleElem);
        resultCard.appendChild(engineElem);
        // resultCard.appendChild(weightElem);
        resultCard.appendChild(linkElem);
        resultCard.appendChild(snippetElem);

        document.getElementById("searchResults").appendChild(resultCard);
    }
}



// This function adds the weights given. But computeFinalWeight function can be done in other ways as well.
function computeFinalWeight(wt1, wt2) {

    var returnValue = wt1 + wt2;
    return returnValue;
}

function httpGetAsync(theUrl, callback, engine) {

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, engine);
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function extractUrls(engine, htmlString) {
    var urls = [];
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlString, "text/html");
    var urlObjects = doc.querySelectorAll(returnQuery(engine.selector));
    for (var i = 0; i < urlObjects.length; i++) {
        urls.push(urlObjects[i][engine.finalSelector])
    }
    return urls;
}

var urlsList = [];

function returnUrlsList(query, engines, callback) {
    for (var i = 0; i < engines.length; i++) {
        for (var j = 0; j < 1; j++) {
            setInterval(httpGetAsync(engines[i].mainUrl + query.replace(/\s/g, "+") + engines[i].pageUrl + engines[i].indexMarker(j), function (response, engine) {
                var engineName = engine["engine"];
                var urls = extractUrls(engine, response);
                for (var k = 0; k < urls.length; k++) {
                    var temp = {};
                    temp["url"] = urls[k];
                    temp["engine"] = engineName;
                    urlsList.push(temp);
                }
                if (urlsList.length > 10) {
                    // console.log(urlsList);
                    callback();
                }
            }, engines[i]), getRandomInt(30000, 60000));
        }
    }
}

returnUrlsList("failure to prove marathi translation governor", engines, function () {
    chrome.storage.local.get(preferredDomainsFieldName, function (preferredDomainsObject) {
        chrome.storage.local.get(preferredAuthorsFieldName, function (preferredAuthorsObject) {
            console.log(urlsList);
            console.log(getSailboatResults(urlsList, preferredDomainsObject[preferredDomainsFieldName], preferredAuthorsObject[preferredAuthorsFieldName]));
        })
    })
});
