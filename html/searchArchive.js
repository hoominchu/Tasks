$(document).ready(function () {

    chrome.storage.local.get("Advanced Search Settings", function (advancedSearchSettings) {
        advancedSearchSettings = advancedSearchSettings["Advanced Search Settings"];
        chrome.storage.local.get("TASKS", function (tasks) {
            tasks = tasks["TASKS"];
            chrome.storage.local.get("CTASKID", function (ctaskid) {
                ctaskid = ctaskid["CTASKID"];
                chrome.storage.local.get("Page Content", function (pageContent) {
                    pageContent = pageContent["Page Content"];

                    showSearchInOptions(advancedSearchSettings);

                    var currentTask = tasks[ctaskid];

                    document.getElementById("currentTaskMessage").innerText = "You are searching through the archived pages of task : " + currentTask["name"];


                    document.getElementById("submitSearchArchiveQuery").onclick = function (ev) {
                        var resultsElement = document.getElementById("archiveSearchResults");

                        resultsElement.innerText = "";

                        var query = document.getElementById("searchArchiveInput").value;

                        var results = searchArchivedPages(query, currentTask, pageContent, advancedSearchSettings);

                        if (results.length > 0) {
                            for (var i = 0; i < results.length; i++) {
                                var resultElement = document.createElement("p");
                                var urlString = "<p>" + results[i]["url"] + "</p>";
                                var matchedTermsString = "<p><small>Matched terms : ";
                                var contextStrings = "<p><small>";
                                var matchedTerms = results[i]["matched terms"];
                                for (var j = 0; j < matchedTerms.length; j++) {
                                    matchedTermsString = matchedTermsString + matchedTerms[j] + " | ";
                                    contextStrings = contextStrings + results[i]["context"][j] + "<br>";
                                }
                                matchedTermsString = matchedTermsString + "</p></small>";
                                contextStrings = contextStrings + "</p></small>";
                                resultElement.innerHTML = urlString + matchedTermsString + contextStrings + "<br>";
                                resultsElement.appendChild(resultElement);
                            }
                        }
                        else {
                            resultsElement.innerText = "No matches found. Archive more pages!";
                        }
                    };

                    document.getElementById("searchArchiveInput").addEventListener("keyup", function (event) {
                        event.preventDefault();
                        if (event.keyCode === 13) {
                            document.getElementById("submitSearchArchiveQuery").click();
                        }
                    });

                });
            });
        });
    });
});

function showSearchInOptions(advancedSearchSettings) {
    // var defaultAdvSearchSettings = {
    //     "search in": "Open tabs"
    // };
    var search_in_options_set_to = advancedSearchSettings["search in"];
    var search_in_options = ["Open tabs", "Archived pages"];

    var search_in_options_element = document.getElementById("search_in_options");

    for (var i = 0; i < search_in_options.length; i++) {
        var option = document.createElement("button");
        var classString = "btn";
        if (search_in_options[i] == search_in_options_set_to) {
            classString = classString + " " + "btn-primary";
        }
        else {
            classString = classString + " " + "btn-secondary";
        }

        if (i == 0) {
            classString = classString + " round-corner-left";
        }
        if (i == search_in_options.length - 1) {
            classString = classString + " round-corner-right";
        }

        option.className = classString;
        option.innerText = search_in_options[i];
        option.onclick = function (ev) {
            console.log(ev);
            advancedSearchSettings["search in"] = this.innerText;
            updateStorage("Advanced Search Settings", advancedSearchSettings);
            location.reload();
        };

        search_in_options_element.appendChild(option);
    }
}

function getContextString(term, string, length) {
    var indexOfTerm = string.toLowerCase().indexOf(term.toLowerCase());
    var stringTokens = string.split(" ");
    var contextTokens = stringTokens.splice(indexOfTerm - (length / 2), length);
    return contextTokens.join(" ");
}

// Updates chrome.storage.local with key and object.
function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}

function searchArchivedPages(query, task, pageContent, searchSettings) {
    var searchIn = searchSettings["search in"];
    var results = [];

    var queryTerms = [];

    query = query.trim();

    if (query[0] == "\"" && query[query.length - 1] == "\"") {
        query = query.substring(1, query.length - 1);
        queryTerms = [query];
    } else {
        queryTerms = query.split(" ");
    }

    var searchThroughPages = [];

    if (searchIn == "Open tabs") {
        var taskPages = task["tabs"];
        for (var key in taskPages) {
            if (taskPages[key]["url"].indexOf("chrome-extension://") < 0) {
                searchThroughPages.push(taskPages[key]["url"]);
            }
        }
    }
    if (searchIn == "Archived pages") {
        searchThroughPages = task["likedPages"];
    }
    if (searchThroughPages.length == 0) {
        return [];
    }
    else {
        for (var i = 0; i < searchThroughPages.length; i++) {

            var url = searchThroughPages[i];
            var content = pageContent[url].toLowerCase();

            var result = {
                "url": url,
                "matched terms": [],
                "context": []
            };

            for (var j = 0; j < queryTerms.length; j++) {
                if (content.indexOf(" " + queryTerms[j].toLowerCase() + " ") > -1 || content.indexOf(" " + queryTerms[j].toLowerCase() + ".") > -1) {
                    result["matched terms"].push(queryTerms[j]);
                    var contextString = getContextString(queryTerms[j], content, 20);
                    result["context"].push(contextString);
                }
            }
            if (result["matched terms"].length > 0) {
                results.push(result);
            }
        }
    }

    results = sortResults(results);
    return results;

    function sortResults(results) {
        results.sort(function (a, b) {
            return b["matched terms"].length - a["matched terms"].length;
        });

        return results;
    }
}