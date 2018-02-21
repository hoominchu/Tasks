
// This function takes results object which contains results from Google, Bing, Yahoo etc., preferredDomains object and preferredAuthors object.
// Returns array of re-ordered (in descending order of computed weights) results with result object. Fields of result object are -- URL, Engine and Weight.
function getSailboatResults(results, preferredDomains, preferredAuthors) {

    var sailboatResults = [];

    for (var i = 0; i < results.length; i++) {
        var resultObj = {};
        var resObjTemp = results[i];
        var link = resObjTemp["url"];
        var engine = resObjTemp["engine"];
        var domain = getDomainFromURL(link);
        // var authorName = getAuthors(link);
        // var authorUniqueID = authorName + ", " + domain;
        var finalWeight = 0;

        var domainWeight = 0;
        var authorWeight = 0;

        if (preferredDomains[domain]) {
            domainWeight = getDomainWeight(domain,preferredDomains);
        }

        // if (preferredAuthors[authorUniqueID]) {
        //     authorWeight = getAuthorWeight(authorName, domain, preferredAuthors);
        // }

        // Computing final weight for a result. computeFinalWeight can be edited
        finalWeight = domainWeight;//computeFinalWeight(domainWeight, authorWeight);
        resultObj["URL"] = link;
        resultObj["Engine"] = engine;
        resultObj["Weight"] = finalWeight;

        sailboatResults.push(resultObj);
    }

    // Sorting sailboatResults in descending order of weight
    var awesomeResult = sailboatResults.sort(function (a, b) {
        return b["Weight"] - a["Weight"];
    });

    return awesomeResult;
}


// This function adds the weights given. But computeFinalWeight function can be done in other ways as well.
function computeFinalWeight(wt1, wt2) {

    var returnValue = wt1 + wt2;
    return returnValue;
}
