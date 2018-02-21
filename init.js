// Local storage fields
var preferredDomainsFieldName = "Preferred domains";
var totalFrequencyFieldName = "Total frequency";
var domainsMetadataFieldName = "metadata";
preferredAuthorsFieldName = "Preferred authors"

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
var CTASKID = -1;

chrome.storage.local.get("CTASKID", function (response) {
    CTASKID = response["CTASKID"];
});


var tabIdToURL={};

var activeTabId = -1;

var TASKS = {lastAssignedId: -1};
var CTASKID = -1;

var currentTaskIsSet = !(CTASKID == -1);

chrome.storage.local.get("TASKS", function (taskObject) {
    if (taskObject["TASKS"]) {
        TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
    }
});

chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
    if (cTaskIdObject["CTASKID"]>-1) {
        CTASKID = cTaskIdObject["CTASKID"];
    }
});

chrome.storage.local.get(preferredAuthorsFieldName, function (prefAuthObj) {
    if (JSON.stringify(prefAuthObj) == "{}") {
        // Adding to the local storage if the field doesn't exist already.
        var o = {};
        o[preferredAuthorsFieldName] = {};
        o[preferredAuthorsFieldName]["metadata"] = {};
        o[preferredAuthorsFieldName]["metadata"][totalFrequencyFieldName] = 0;
        console.log(o);
        chrome.storage.local.set(o, function(){"init"});
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
        chrome.storage.local.set(o, function(){"init"});
    }
});
