// Local storage fields
var preferredDomainsFieldName = "Preferred domains";
var totalFrequencyFieldName = "Total frequency";
var domainsMetadataFieldName = "metadata";

// Setting fields of author object
var domainFrequencyFieldName = "frequency";
var activeTasksFieldName = "Active tasks";
var archivedTasksFieldName = "Archived tasks";

// Getting current task id
var CTASKID = -1;
chrome.storage.local.get("CTASKID", function (response) {
    CTASKID = response["CTASKID"];
});

// Takes a URL and gets its
function updatePreferredDomain(theUrl) {
    var domain = getDomainFromURL(theUrl);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            updateDomain(xmlHttp.responseText, domain);
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

// Weight is calculated as-- authorFrequency/totalFrequency. Another way weight can be computed is-- authorFrequency/numberOfAuthors.
function getDomainWeight(author, domain, preferredAuthorsObject) {
    var totalFrequency = preferredAuthorsObject[domainsMetadataFieldName][totalFrequencyFieldName];
    var authorUniqueID = author + ", " + domain;
    var authorFrequency = preferredAuthorsObject[authorUniqueID][domainFrequencyFieldName];
    var numberOfAuthors = preferredAuthorsObject.length - 1;
    var weight = authorFrequency / totalFrequency;
    return weight;
}

function getDomainFromURL(url) {
    var arr = url.split('/');
    var domain = arr[2];
    return domain;
}

function getUpdatedPreferredDomainsObject(domain, preferredDomainsObject) {

        // Checking if author already exists in the database
        // var authorExists = preferredAuthorsObject.hasOwnProperty(authorUniqueID);

        // If author exists in storage
        if (preferredDomainsObject.hasOwnProperty(domain)) {

            // Fields of author objects are set at the top of the file.
            // Increasing frequency of the author.
            preferredDomainsObject[domain][domainFrequencyFieldName]++;
            preferredDomainsObject[domain][activeTasksFieldName].push(CTASKID);
        }

        // If domain doesn't exist in storage-- adding domain to storage.
        else {
            var newDomainObject = {};
            newDomainObject[domainFrequencyFieldName] = 1;
            newDomainObject[activeTasksFieldName] = [CTASKID];
            newDomainObject[archivedTasksFieldName] = [];
            preferredDomainsObject[domain] = newDomainObject;
        }

        // Increasing total frequency of all the authors.
        preferredDomainsObject[domainsMetadataFieldName][totalFrequencyFieldName]++;

    return preferredDomainsObject;
}

function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}

var updateDomain = function (htmlString, domain) {

    // Checking if "Preferred domains" field exists in the local storage. Adding if it doesn't exist.
    chrome.storage.local.get(preferredDomainsFieldName, function (preferredDomainsObject) {
        preferredDomainsObject = preferredDomainsObject[preferredDomainsFieldName];
        var updatedDomainsObject = getUpdatedPreferredDomainsObject(domain, preferredDomainsObject);
        updateStorage(preferredDomainsFieldName, updatedDomainsObject);
        console.log("Updated database!");
    });
};

var resp = updatePreferredDomain('http://www.thehindu.com/news/national/ed-searches-45-locations-seizes-20-cr-assets/article22791357.ece?homepage=true');
