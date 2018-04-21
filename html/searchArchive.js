$(document).ready(function () {

    chrome.storage.local.get("TASKS", function (tasks) {
        tasks = tasks["TASKS"];
        chrome.storage.local.get("CTASKID", function (ctaskid) {
            ctaskid = ctaskid["CTASKID"];
            chrome.storage.local.get("Page Content", function (pageContent) {
                pageContent = pageContent["Page Content"];

                var currentTask = tasks[ctaskid];

                document.getElementById("currentTaskMessage").innerText = "You are searching through the archived pages of task : " + currentTask["name"];


                document.getElementById("submitSearchArchiveQuery").onclick = function (ev) {
                    var resultsElement = document.getElementById("archiveSearchResults");

                    resultsElement.innerText = "";

                    var query = document.getElementById("searchArchiveInput").value;

                    var results = searchArchivedPages(query, currentTask, pageContent);

                    if (results.length > 0) {
                        for (var i = 0; i < results.length; i++) {
                            var resultElement = document.createElement("p");
                            var urlString = results[i]["url"];
                            var matchedTermsString = "";
                            var matchedTerms = results[i]["matched terms"];
                            for (var j = 0; j < matchedTerms.length; j++) {
                                matchedTermsString = matchedTermsString + matchedTerms[j] + " | ";
                            }
                            resultElement.innerHTML = urlString + "<br>" + matchedTermsString + "<br><br>";
                            resultsElement.appendChild(resultElement);
                        }
                    }
                    else {
                        resultsElement.innerText = "No matches found. Archive more pages!";
                    }
                }
            });
        });
    });
});

function searchArchivedPages(query, task, pageContent) {
    var results = [];

    var queryTerms = query.split(" ");

    // result = {
    //     url:
    //     matched terms:[]
    // }

    var archivedPages = task["likedPages"];
    if (archivedPages.length == 0) {
        return adfsadf;
    }
    else {
        for (var i = 0; i < archivedPages.length; i++) {

            var url = archivedPages[i];
            var content = pageContent[url].toLowerCase();

            var result = {
                "url": url,
                "matched terms": []
            };

            for (var j = 0; j < queryTerms.length; j++) {
                if (content.indexOf(" " + queryTerms[j].toLowerCase() + " ") > -1) {
                    result["matched terms"].push(queryTerms[j]);
                }
            }
            if (result["matched terms"].length > 0) {
                results.push(result);
            }
        }
    }

    return results;

    function sortResults(results) {

    }
}