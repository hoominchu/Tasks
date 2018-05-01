// Local storage fields
var preferredDomainsFieldName = "Preferred domains";
var totalFrequencyFieldName = "Total frequency";
var domainsMetadataFieldName = "metadata";
preferredAuthorsFieldName = "Preferred authors";

// Setting fields of author object
var domainFrequencyFieldName = "frequency";
var activeTasksFieldName = "Active tasks";
var archivedTasksFieldName = "Archived tasks";

// Local storage fields
var preferredAuthorsFieldName = "Preferred authors";
var authorsMetadataFieldName = "metadata";

// Setting fields of author object
var authorFrequencyFieldName = "frequency";
var authorURL = "URL"; // Not being used yet

// Getting current task id
var TASKS = {lastAssignedId: 0};
var CTASKID = 0;

var taskToWindow = {};

var tabIdToURL = {};
var activeTabId = 0;

//
var backgroundPageId = -1;
var defaultTaskId = 0;

//Suggestion log dictionary
chrome.storage.local.get("Suggestions Log", function (e) {
    if (isEmpty(e)) {
        chrome.storage.local.set({"Suggestions Log": {"Correct suggestions": 0, "Incorrect suggestions": 0}});
    }
});


chrome.storage.local.get("TASKS", function (taskObject) {
    if (taskObject["TASKS"]) {
        TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
    }
});

chrome.storage.local.get("Page Content", function (e) {
    if (isEmpty(e)) {
        chrome.storage.local.set({"Page Content": {}});
    }
});

chrome.storage.local.get("Text Log", function (e) {
    if (isEmpty(e)) {
        chrome.storage.local.set({"Text Log": {}});
    }
});

chrome.storage.local.get("Settings", function (e) {
    if (isEmpty(e)) {
        var DEFAULT_SETTINGS = {
            "notifications": "Enabled",
            "suggestions based on": "Open tabs",
            "suggestions threshold": "Medium",
            "block notifications on": ["www.google.com","www.google.co.in","www.facebook.com"]
        };

        // Setting default settings in local storage.
        chrome.storage.local.set({"Settings": DEFAULT_SETTINGS}, function () {
            console.log("Settings object initialised in local storage.");
        })
    }
});

chrome.storage.local.get("Advanced Search Settings", function (e) {
    if (isEmpty(e)) {
        var defaultAdvSearchSettings = {
            "search in": "Open tabs"
        };
        chrome.storage.local.set({"Advanced Search Settings": defaultAdvSearchSettings}, function () {
            console.log("Advanced search settings initialised.");
        })
    }
});

chrome.storage.local.get("Debug Stopwords", function (e) {
    if (isEmpty(e)) {
        chrome.storage.local.set({"Debug Stopwords": []}, function () {
            console.log("Debug stopwords initialised.");
        })
    }
});

// chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
//     if (cTaskIdObject["CTASKID"]>0) {
//         CTASKID = cTaskIdObject["CTASKID"];
//     }
// });

chrome.storage.local.get(preferredAuthorsFieldName, function (prefAuthObj) {
    if (JSON.stringify(prefAuthObj) == "{}") {
        // Adding to the local storage if the field doesn't exist already.
        var o = {};
        o[preferredAuthorsFieldName] = {};
        o[preferredAuthorsFieldName]["metadata"] = {};
        o[preferredAuthorsFieldName]["metadata"][totalFrequencyFieldName] = 0;
        console.log(o);
        chrome.storage.local.set(o, function () {
            "init"
        });
    }
});

chrome.storage.local.get(preferredDomainsFieldName, function (prefDomainsObj) {
    if (JSON.stringify(prefDomainsObj) == "{}") {
        // Adding to the local storage if the field doesn't exist already.
        var o = {};
        o[preferredDomainsFieldName] = {};
        o[preferredDomainsFieldName]["metadata"] = {};
        o[preferredDomainsFieldName]["metadata"][totalFrequencyFieldName] = 0;
        console.log(o);
        chrome.storage.local.set(o, function () {
            "init"
        });
    }
});
