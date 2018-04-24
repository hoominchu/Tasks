$(document).ready(function () {
    chrome.storage.local.get("Matched Tags", function (matchedTagsObject) {
        matchedTagsObject = matchedTagsObject["Matched Tags"];
        var matchedTags = matchedTagsObject["matched tags"];
        var fromPageURL = matchedTagsObject["from page url"];
        var fromPageTitle = matchedTagsObject["from page title"];
        var probableTask = matchedTagsObject["probable task name"];

        document.getElementById("page_match_task").innerHTML = "We thought " + "<a href='" + fromPageURL + "'>" + fromPageTitle + "</a>" + " page belonged to " + "<strong>" + probableTask + "</strong>";

        // var matchedTagsElement = document.getElementById("matched_tags");
        chrome.storage.local.get("Debug Stopwords", function (debugStopwords) {
            debugStopwords = debugStopwords["Debug Stopwords"];
            var matchedTagsElement = document.getElementById("matched_tags");
            for (var i = 0; i < matchedTags.length; i++) {
                var tag = matchedTags[i][1];

                var tagText = tag["text"];

                if (debugStopwords.indexOf(tagText.toLowerCase()) < 0) {
                    var tagTextElement = "<strong>" + tag["text"] + "</strong>" + " | " + tag["frequency"];

                    var tagButtonGroupElement = document.createElement("div");
                    tagButtonGroupElement.className = "btn-group round-corner";
                    tagButtonGroupElement.setAttribute("role", "group");
                    tagButtonGroupElement.style.margin = "0.5em";

                    var tagTextButton = document.createElement("button");
                    tagTextButton.setAttribute("type", "button");
                    tagTextButton.className = "btn btn-secondary disabled round-corner-left";
                    tagTextButton.innerHTML = tagTextElement;

                    var tagCloseButton = document.createElement("button");
                    tagCloseButton.setAttribute("type", "button");
                    tagCloseButton.className = "btn btn-secondary round-corner-right";
                    tagCloseButton.innerHTML = "&times;";
                    tagCloseButton.onclick = function (ev) {
                        var stopword = this.parentElement.getElementsByTagName("strong")[0].innerText;
                        debugStopwords.push(stopword.toLowerCase());
                        $(this).parent().remove();
                        updateStorage("Debug Stopwords", debugStopwords);
                    };

                    tagButtonGroupElement.appendChild(tagTextButton);
                    tagButtonGroupElement.appendChild(tagCloseButton);

                    matchedTagsElement.appendChild(tagButtonGroupElement);
                }
            }
        });
    });
});