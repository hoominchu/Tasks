// function clusterUrls(urls, tagsDict, stopWords, callback){
//   var weightsTable = [];
//   var urlsToCluster = [];
//   for(var i = 0; i<urls.length; i++){
//       if(tagsDict[urls[i]]){
//           urlsToCluster.push(urls[i]);
//       }
//   }
//   weightsTable = jaccardTable(urlsToCluster, tagsDict, stopWords);
//   var clusters = jLouvain().nodes(urlsToCluster).edges(weightsTable);
//   var result = clusters();
//   callback(result);
// }

console.log("Hello");

function clusterUrls(urls, tagsDict, stopWords, callback, data){
    var weightsTable = [];
    weightsTable = jaccardTableTime(urls, tagsDict, stopWords, data);
    var clusters = jLouvain().nodes(urls).edges(weightsTable);
    var result = clusters();
    callback(result);
}




// function clusterPrinter(clusters){
//   var clusterNumbers = new Set(Object.values(clusters));
//   for(var i = 0 ; i<clusterNumbers.size; i++){
//     console.log("Cluster Number " + i);
//     for(var j = 0; j<Object.keys(clusters).length; j++){
//       if(clusters[Object.keys(clusters)[j]] == i){
//         console.log(Object.keys(clusters)[j]);
//       }
//     }
//   }
//   console.log(clusters);
// }

function clusterPrinter(clusters, tagsByCluster){
    var clusterNumbers = new Set(Object.values(clusters));
    for(var i = 0 ; i<clusterNumbers.size; i++){
        console.log("Cluster Number " + i);
        for(var j = 0; j<Object.keys(clusters).length; j++){
            if(clusters[Object.keys(clusters)[j]] == i){
                console.log(tagsByCluster[Object.keys(clusters)[j]]["urls"]);
            }
        }
    }
    console.log(clusters);
}
//
function jaccardTable(urls, textLog, stopwords, data) {
    var STOPWORDS =["twitter", "facebook", "google", "policy & safety", "youtube"]
    var table = [];
    var counter = 0;
    for (var i = 0; i < urls.length; i++) {
        for (var j = i+1; j < urls.length; j++) {
            var firstUrlDomain = getDomainFromURL(urls[i]);
            var secondUrlDomain = getDomainFromURL(urls[j]);
            if (textLog[urls[i]] && textLog[urls[j]]) {
                // if (stopwords[firstUrlDomain]) {
                //     var firstUrlTags = _.difference(Object.keys(textLog[urls[i]]), stopwords[firstUrlDomain]["stopwords"]);
                // }
                // else {
                //     var firstUrlTags = Object.keys(textLog[urls[i]]);
                // }
                // if (stopwords[secondUrlDomain]) {
                //     var secondUrlTags = _.difference(Object.keys(textLog[urls[j]]), stopwords[secondUrlDomain]["stopwords"]);
                // }
                // else {
                //     var secondUrlTags = Object.keys(textLog[urls[j]]);
                // }

                var firstUrlTags = _.difference(Object.keys(textLog[urls[i]]), STOPWORDS);
                var secondUrlTags = _.difference(Object.keys(textLog[urls[j]]), STOPWORDS);


                //FOR TIME
                var time1 = new Date(data[indexOfElementWithProperty(data, "url", urls[i])]["lastVisitTimeUTC"]);
                var time2 = new Date(data[indexOfElementWithProperty(data, "url", urls[j])]["lastVisitTimeUTC"]);
                var jScore = (10000/ Math.abs(time1 - time2)) + getJaccardScores(firstUrlTags, secondUrlTags);
                counter = i;
                console.log(counter);
                if(_.intersection(firstUrlTags, secondUrlTags).length>0){
                    console.log("-------------------------------------------------------------------------------------------------");
                    console.log(urls[i] + "&" + urls[j] + " score: " + (10000/ Math.abs(time1 - time2)) + " || " + getJaccardScores(firstUrlTags, secondUrlTags)) ;
                    console.log("jScore = " + jScore);
                    console.log(_.intersection(firstUrlTags, secondUrlTags));
                }
                console.log("-------------------------------------------------------------------------------------------------")
                var temp = {
                    "source": urls[i],
                    "target": urls[j],
                    "weight": jScore
                }
                var temp2 = {
                    "source": urls[j],
                    "target": urls[i],
                    "weight": jScore
                }
                table.push(temp);
                table.push(temp2);
            }

        }
    }
    return table;

}

function jaccardTableTime(urls, textLog, stopwords, data) {
    var table = [];
    var counter = 0;
    for (var i = 0; i < urls.length; i++) {
        for (var j = i+1; j < urls.length; j++) {
            if(getDomainFromURL(urls[i]) == getDomainFromURL(urls[j])){
                var time1 = new Date(data[indexOfElementWithProperty(data, "url", urls[i])]["lastVisitTimeUTC"]);
                var time2 = new Date(data[indexOfElementWithProperty(data, "url", urls[j])]["lastVisitTimeUTC"]);
                var jScore =  10000/Math.abs(time1-time2);

                var temp = {
                    "source": urls[i],
                    "target": urls[j],
                    "weight": jScore
                }
                var temp2 = {
                    "source": urls[j],
                    "target": urls[i],
                    "weight": jScore
                }
                table.push(temp);
                table.push(temp2);
            }
            else{
                var jScore =  0;

                var temp = {
                    "source": urls[i],
                    "target": urls[j],
                    "weight": jScore
                }
                var temp2 = {
                    "source": urls[j],
                    "target": urls[i],
                    "weight": jScore
                }
                table.push(temp);
                table.push(temp2);

            }

            // counter = i;
            // console.log(counter);

            // console.log("-------------------------------------------------------------------------------------------------");
            // console.log(urls[i] + "&" + urls[j] + " score: " + jScore);
            // console.log("");
            // console.log(_.intersection(firstUrlTags, secondUrlTags));
            // console.log("-------------------------------------------------------------------------------------------------")
        }

    }
    return table;
}


//
function tagsFetcher(urls, options, callback){
    var tags = {};
    docFetcher(urls, function(documents){
        for(var url in documents){
            tags[url] = getTagsOnDocument(documents[url]);
        }
        updateStorage("tags", tags);
        callback(options, tags);

    });
}

function clusterByTimeDomain(urls, data){
    var clusters = {};
    var previousDomain = "";
    var lastClusterNumber = 0;
    for(var i = 0; i<data.length; i++){
        if(getDomainFromURL(data[i]["url"]) != previousDomain){
            var newCluster = [];
            // newCluster.push(data[i]["url"])
            newCluster.push(data[i]["title"])
            clusters[lastClusterNumber] = newCluster;
            previousDomain = getDomainFromURL(data[i]["url"]);
            lastClusterNumber = lastClusterNumber + 1;
        }
        else{
            clusters[Object.keys(clusters).length-1].push(data[i]["title"]);
        }
    }
    for(var cluster in clusters){
        for(var j =0; j<clusters[cluster].length; j++){
            console.log(clusters[cluster][j]);

        }
        console.log("|");
    }
    // fetchTagsForClusters(clusters);
}

function fetchTagsForClusters(clusters){
    var tagsByCluster = {}
    var clustersDone = 0;
    for(var clusterNumber in clusters){
        // console.log(clusters[clusterNumber]);
        tagsByCluster[clusterNumber] = {};
        tagsByCluster[clusterNumber]["tags"] = [];
        tagsByCluster[clusterNumber]["urls"] = clusters[clusterNumber];

        var options = {"clusterNumber":clusterNumber};

        tagsFetcher(clusters[clusterNumber], options, function(options, tags){

            var clusterNumber = options["clusterNumber"];

            for(var url in tags){
                for(var i = 0; i<Object.keys(tags[url]).length; i++){
                    tagsByCluster[clusterNumber]["tags"].push(Object.keys(tags[url])[i]);
                }
            }
            clustersDone = clustersDone + 1;
            console.log(tagsByCluster);

            if(clustersDone == Object.keys(clusters).length){
                console.log(tagsByCluster);
                for( var cluster in tagsByCluster){
                    console.log(sortElementsByFrequency(tagsByCluster[cluster]["tags"]));
                }
                // var intersection = tagsByCluster[Object.keys(tagsByCluster)[0]]["tags"];
                // for(var k = 1; k< Object.keys(tagsByCluster).length; k++){
                //     intersection =_.intersection(tagsByCluster[Object.keys(tagsByCluster)[k]]["tags"], intersection);
                // }
                // for(var cluster in tagsByCluster){
                //     tagsByCluster[cluster]["tags"] = _.difference(tagsByCluster[cluster]["tags"], intersection);
                // }
                // console.log(intersection);
                // console.log(tagsByCluster);
                // mergeClusters(tagsByCluster);
                // updateStorage("tagsByCluster", tagsByCluster);
            }
        });
    }
}

function mergeClusters(tagsByCluster){
    var table = [];
    for(var k = 1; k< Object.keys(tagsByCluster).length; k++) {
        for (var m = k; m < Object.keys(tagsByCluster).length; m++) {
            var jScore = getJaccardScores(tagsByCluster[Object.keys(tagsByCluster)[k]]["tags"], tagsByCluster[Object.keys(tagsByCluster)[m]]["tags"]);
            var temp = {
                "source": Object.keys(tagsByCluster)[k],
                "target": Object.keys(tagsByCluster)[m],
                "weight": jScore
            }
            var temp2 = {
                "source": Object.keys(tagsByCluster)[k],
                "target": Object.keys(tagsByCluster)[m],
                "weight": jScore
            }

            table.push(temp);
            table.push(temp2);
        }
    }

    var clusters = jLouvain().nodes(Object.keys(tagsByCluster)).edges(table);
    console.log(clusterPrinter(clusters(), tagsByCluster));

}


var domainsToIgnore = ["https://www.google.co.in", "https://mail.google.com/mail/", "https://www.netflix.com/"]

objectFromJSON("chrome_history.json", function(arr){
    var data = [];
    for(var i = 0; i< arr.length; i++){
        if(!checkIfStringContainsAnyStrings(domainsToIgnore, arr[i]["url"])){
            data.push(arr[i]);
        }
    }
    var urls = []
    for(var i = 0; i< arr.length; i++){
        if(!checkIfStringContainsAnyStrings(domainsToIgnore, arr[i]["url"])){
            urls.push(arr[i]["url"]);
        }
    }


    // var urls = ["https://www.quora.com/How-do-I-convert-JSON-object-to-text-file-using-JavaScript", "https://stackoverflow.com/questions/14540248/how-to-get-an-array-javascript-of-json-file", "https://stackoverflow.com/questions/18638229/converting-json-from-a-file-to-a-java-object", "https://www.quora.com/How-do-I-convert-JSON-file-to-Javascript-Array", "https://www.w3schools.com/js/js_json_parse.asp", "https://www.w3schools.com/js/js_json_stringify.asp", "https://www.quora.com/in/How-can-I-convert-a-JSON-file-to-JavaScript-object", "http://www.json-xls.com/json2xls?template=chrome_history#tabs-2", "https://chrome.google.com/webstore/detail/export-h…-t/dcoegfodcnjofhjfbhegcgjgapeichlf/related?hl=pl"]
    console.log(data);
    // chrome.storage.local.get("tags", function(tags){
    //     if(!tags["tags"]){
    //         tagsFetcher(urls, function(urls, tags){
    //             clusterUrls(urls, tags, {}, function(clusters){
    //                 clusterPrinter(clusters);
    //                 // recursiveClustering(clusters);
    //             }, data);
    //         });
    //     }
    //     else{
    //         clusterUrls(urls, tags["tags"], {}, function(clusters){
    //             clusterPrinter(clusters);
    //             // recursiveClustering(clusters);
    //         }, data);
    //     }
    // });

    clusterByTimeDomain(urls, data);


    // clusterUrls(urls, tags, {},
    //     function(clusters){
    //         clusterPrinter(clusters);
    //     }, data);

});



// function recursiveClustering(clusters) {
//     var clusterNumbers = new Set(Object.values(clusters));
//     var clusterDict = {};
//     for (var i = 0; i < clusterNumbers.size; i++) {
//         clusterDict[i] = [];
//         for(var j = 0; j<Object.keys(clusters).length; j++){
//             if(clusters[Object.keys(clusters)[j]] == i){
//                 clusterDict[i].push(Object.keys(clusters)[j]);
//             }
//         }
//     }
//     objectFromJSON("chrome_history.json", function(arr) {
//         var data = [];
//         for (var i = 0; i < 500; i++) {
//             if (!checkIfStringContainsAnyStrings(domainsToIgnore, arr[i]["url"])) {
//                 data.push(arr[i]);
//             }
//         }
//         var urls = []
//         for (var i = 0; i < 500; i++) {
//             if (!checkIfStringContainsAnyStrings(domainsToIgnore, arr[i]["url"])) {
//                 urls.push(arr[i]["url"]);
//             }
//         }
//
//         for (var cluster in clusterDict) {
//             console.log(cluster);
//             clusterUrls(clusterDict[cluster], tags["tags"], {}, function (clusters) {
//                 clusterPrinter(clusters);
//                 // recursiveClustering(clusters);
//             }, data);
//         }
//     });
// }

// tagsFetcher(secondDataSet);
