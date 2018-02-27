// Stopwords array
var stopwords = ["by"];
var organisationNames_stopwords = ["cnn"];

// Getting current task id
var CTASKID = 0;
chrome.storage.local.get("CTASKID", function (response) {
    CTASKID = response["CTASKID"];
});

// Takes a URL and gets its
function httpGetAsyncForUpdateAuthor(theUrl, callback) {
    var domain = getDomainFromURL(theUrl);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, domain);
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

//httpGetAsync for getAuthor. Sends message once the authors array is received.
function httpGetAsyncForGetAuthor(theUrl, preferredAuthors) {
    var domain = getDomainFromURL(theUrl);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var authors = getAuthors(xmlHttp.responseText, domain);
            var totalAuthorWeight = 0;
            for (var j = 0; j < authors.length; j++) {
                var authorWeight = 0;
                var authorName = authors[j];
                var authorUniqueID = authorName + ", " + domain;
                if (preferredAuthors[authorUniqueID]) {
                    authorWeight = getAuthorWeight(authorName, domain, preferredAuthors);
                    totalAuthorWeight = totalAuthorWeight + authorWeight;
                }
            }
            // Adding URL and authors to the results array (declared in search.js)
            urlToAuthorWeights[theUrl] = totalAuthorWeight;
        }
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

// Weight is calculated as-- authorFrequency/totalFrequency. Another way weight can be computed is-- authorFrequency/numberOfAuthors.
function getAuthorWeight(author, domain, preferredAuthorsObject) {
    var totalFrequency = preferredAuthorsObject[authorsMetadataFieldName][totalFrequencyFieldName];
    var authorUniqueID = author + ", " + domain;
    var authorFrequency = preferredAuthorsObject[authorUniqueID][authorFrequencyFieldName];
    var numberOfAuthors = preferredAuthorsObject.length - 1;
    var weight = authorFrequency / totalFrequency;
    return weight;
}

// This dictionary contains domain name to object mapping where the object is an array of selectors to reach the author's name.
var domainToAuthorClassDict = {
    "medium.com": [{"class": "ds-link ds-link--styleSubtle postMetaInline postMetaInline--author"}],
    "www.nytimes.com": [{"class": "byline-author"}],
    "www.theguardian.com": [{"tag": "span", "attribute": "itemprop", "value": "name"}],
    "www.independent.co.uk": [{"tag": "li", "class": "author"}, {
        "tag": "span",
        "attribute": "itemprop",
        "value": "name"
    }, {"tag": "a"}],
    "www.thehindu.com": [{
        "tag": "span",
        "class": "author-img-name"
    }, {"tag": "a", "class": "auth-nm lnk"}],
    "indianexpress.com": [{
        "tag": "div",
        "id": "storycenterbyline"
    }, {"tag": "a"}],
    "edition.cnn.com": [{"tag": "span", "class": "metadata__byline__author"}]

};

function getUpdatedAuthorsObject(authors, domain, preferredAuthorsObject) {
    for (var n = 0; n < authors.length; n++) {
        var authorName = authors[n];
        authorName = authorName.replace(/\r?\n|\r/g, "");
        console.log(authorName);

        //Replacing space at the beginning and the end of the string
        if (authorName[0] == " ") {
            authorName = authorName.substring(1);
        }
        if (authorName[authorName.length] == " ") {
            authorName = authorName.substring(0, authorName.length - 2)
        }

        // Unique author is identified by "author name, domain", so that we can identify authors with same name better. This value is used in the storage to identify an author.
        var authorUniqueID = authorName + ", " + domain;

        // Checking if author already exists in the database
        // var authorExists = preferredAuthorsObject.hasOwnProperty(authorUniqueID);

        // If author exists in storage
        if (preferredAuthorsObject.hasOwnProperty(authorUniqueID)) {

            // Fields of author objects are set at the top of the file.
            // Increasing frequency of the author.
            preferredAuthorsObject[authorUniqueID][authorFrequencyFieldName]++;
            preferredAuthorsObject[authorUniqueID][activeTasksFieldName].push(CTASKID);
        }

        // If author doesn't exist in storage-- adding author to storage.
        else {
            var newAuthorObject = {};
            newAuthorObject[authorFrequencyFieldName] = 1;
            newAuthorObject[activeTasksFieldName] = [CTASKID];
            newAuthorObject[archivedTasksFieldName] = [];
            preferredAuthorsObject[authorUniqueID] = newAuthorObject;
        }

        // Increasing total frequency of all the authors.
        preferredAuthorsObject[authorsMetadataFieldName][totalFrequencyFieldName]++;
    }

    return preferredAuthorsObject;
}

function updateAuthor(htmlString, domain) {
    var authors = getAuthors(htmlString, domain);

    // Checking if "Preferred authors" field exists in the local storage. Adding if it doesn't exist.
    chrome.storage.local.get(preferredAuthorsFieldName, function (preferredAuthorsObject) {
        preferredAuthorsObject = preferredAuthorsObject[preferredAuthorsFieldName];
        var updatedAuthorsObject = getUpdatedAuthorsObject(authors, domain, preferredAuthorsObject);
        updateStorage(preferredAuthorsFieldName, updatedAuthorsObject);
        console.log("Updated database!");
    });

}

var getAuthors = function (htmlString, domain) {
    var authors = [];
    var dictval = domainToAuthorClassDict[domain];
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(htmlString, "text/html");
    var query = "";
    for (var i = 0; i < dictval.length; i++) {
        var tagName, className, idName, attributeName, attributeValue;

        //Setting up the values
        if (dictval[i]["tag"] != null) {
            tagName = dictval[i]["tag"];
        } else {
            tagName = null;
        }
        if (dictval[i]["class"] != null) {
            className = dictval[i]["class"];
        } else {
            className = null;
        }
        if (dictval[i]["id"] != null) {
            idName = dictval[i]["id"];
        } else {
            idName = null;
        }
        if (dictval[i]["attribute"] != null) {
            attributeName = dictval[i]["attribute"];
        } else {
            attributeName = null;
        }
        if (dictval[i]["value"] != null) {
            attributeValue = dictval[i]["value"];
        } else {
            attributeValue = null;
        }

        //Creating query for querySelector
        if (tagName != null) {
            query = query + tagName;
        }

        if (className != null) {
            var classes = className.replace(/\s/g, ".");
            query = query + "." + classes;
        }

        if (idName != null) {
            query = query + "#" + idName;
        }

        if (attributeName != null) {
            query = query + "[" + attributeName + "='" + attributeValue + "']";
        }

        if ((i + 1) < dictval.length) {
            query = query + " ";
        }
    }


    var authorElem = htmlDoc.querySelector(query);
    if (authorElem != null) {
        var author = authorElem.innerText;
        author = author.toLowerCase();

        // Removing stopwords from author string
        for (var j = 0; j < stopwords.length; j++) {
            author = author.replace(stopwords[j], "");
        }

        // Removing organisation names from author string
        for (var k = 0; k < stopwords.length; k++) {
            author = author.replace(organisationNames_stopwords[k], "");
        }

        // Splitting with and
        var authorsArr1 = author.split(" and ");

        for (var l = 0; l < authorsArr1.length; l++) {
            //Splitting with comma
            var authorsArr2 = authorsArr1[l].split(",");

            for (var m = 0; m < authorsArr2.length; m++) {
                //Adding author name to authors array. Adding only if length is more than one.
                if (authorsArr2[m].length > 1) {
                    var authorName = authorsArr2[m].replace(/\r?\n|\r/g, "");
                    authors.push(authorName);
                }
            }
        }
    }
    return authors;
};

// var resp = httpGetAsyncForUpdateAuthor('http://www.thehindu.com/news/national/ed-searches-45-locations-seizes-20-cr-assets/article22791357.ece?homepage=true', updateAuthor);
