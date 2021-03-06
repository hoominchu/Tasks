// Takes a URL and gets its
function updatePreferredDomain(theUrl) {
    var domain = getDomainFromURL(theUrl);
    updateDomain(domain);
}

// Weight is calculated as-- authorFrequency/totalFrequency. Another way weight can be computed is-- authorFrequency/numberOfAuthors.
function getDomainWeight(domain, preferredDomainsObject) {
    var totalFrequency = preferredDomainsObject[domainsMetadataFieldName][totalFrequencyFieldName];
    var domainFrequency = preferredDomainsObject[domain][domainFrequencyFieldName];
    var numberOfAuthors = preferredDomainsObject.length - 1; // -1 because of metadata object
    var weight = domainFrequency / totalFrequency;
    return weight;
}

function getUpdatedPreferredDomainsObject(domain, preferredDomainsObject) {

    // Checking if author already exists in the database
    // var authorExists = preferredAuthorsObject.hasOwnProperty(authorUniqueID);

    // If author exists in storage
    if (preferredDomainsObject.hasOwnProperty(domain)) {

        // Fields of author objects are set at the top of the file.
        // Increasing frequency of the author.
        preferredDomainsObject[domain][domainFrequencyFieldName]++;

        var activeTasksArray = preferredDomainsObject[domain][activeTasksFieldName];

        // Checking if current task id already exists in active tasks field name. Pushing CTASKID if it doesn't exist in the array.
        if(activeTasksArray.indexOf(CTASKID)=== -1) {
            preferredDomainsObject[domain][activeTasksFieldName].push(parseInt(CTASKID));
        }

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


var updateDomain = function (domain) {

    // Checking if "Preferred domains" field exists in the local storage. Adding if it doesn't exist.
    chrome.storage.local.get(preferredDomainsFieldName, function (preferredDomainsObject) {
        preferredDomainsObject = preferredDomainsObject[preferredDomainsFieldName];
        var updatedDomainsObject = getUpdatedPreferredDomainsObject(domain, preferredDomainsObject);
        updateStorage(preferredDomainsFieldName, updatedDomainsObject);
        console.log("Updated database!");
    });
};
