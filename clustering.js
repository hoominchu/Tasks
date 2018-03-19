function clusterTabs(){
    chrome.tabs.query({}, function(tabs){
        chrome.storage.local.get("Text Log", function(textLog){
            textLog = textLog["Text Log"];
            chrome.storage.local.get("Stopwords for websites", function(stopwords){
              var stopwords = stopwords["Stopwords for websites"];
              var urls = [];
              for(var i = 0; i<tabs.length; i++){
                urls.push(tabs[i].url);
              }
              clusterUrls(urls, textLog, stopwords, function(clusters){clusterPrinter(clusters);});
            });

        });

    });
}

function clusterUrls(urls, tagsDict, stopWords, callback){
  var weightsTable = []
  var urlsToCluster = [];
  for(var i = 0; i<urls.length; i++){
      if(tagsDict[urls[i]]){
          urlsToCluster.push(urls[i]);
      }
  }
  weightsTable = jaccardTable(urlsToCluster, tagsDict, stopWords);
  var clusters = jLouvain().nodes(urlsToCluster).edges(weightsTable);
  var result = clusters();
  callback(result);
}

function clusterPrinter(clusters){
  var clusterNumbers = new Set(Object.values(clusters));
  for(var i = 0 ; i<clusterNumbers.size; i++){
    console.log("Cluster Number " + i);
    for(var j = 0; j<Object.keys(clusters).length; j++){
      if(clusters[Object.keys(clusters)[j]] == i){
        console.log(Object.keys(clusters)[j]);
      }
    }
  }
}

function jaccardTable(urls, textLog, stopwords){
    var table = [];
    for(var i = 0; i<urls.length; i++){
        for(var j = 0; j<urls.length; j++){
            if(i != j){
                if(textLog[urls[i]] && textLog[urls[j]]){
                    if(Boolean(stopwords[getDomainFromURL(urls[i])]) && Boolean(stopwords[getDomainFromURL(urls[j])])){
                            // console.log(Object.keys(textLog[urls[i]]));
                            // console.log(Object.keys(textLog[urls[j]]));
                            var jScore = getJaccardScores(_.difference(Object.keys(textLog[urls[i]]), stopwords[getDomainFromURL(urls[i])]["tags"]), _.difference(Object.keys(textLog[urls[j]]), stopwords[getDomainFromURL(urls[j])]["tags"]))*10000;
                            console.log("Url 1:" + urls[i]+ "Url 2:" + urls[j] + " score:" + jScore);
                            console.log(_.intersection(_.difference(Object.keys(textLog[urls[i]]), stopwords[getDomainFromURL(urls[i])]["tags"]),  _.difference(Object.keys(textLog[urls[j]]), stopwords[getDomainFromURL(urls[j])]["tags"])));
                            // console.log("STOPWORDS");
                            // console.log(stopwords[getDomainFromURL(urls[i])]["tags"]);
                    }
                    else{
                        console.log(_.intersection(Object.keys(textLog[urls[i]]), Object.keys(textLog[urls[j]])));
                        var jScore = getJaccardScores(Object.keys(textLog[urls[i]]), Object.keys(textLog[urls[j]]));
                        console.log(jScore);
                    }
                    var temp = {
                        "source": urls[i],
                        "target": urls[j],
                        "weight": jScore
                    }
                    table.push(temp);
                }
                else{
                    console.log("Url 1:" + urls[i]);
                    console.log("Url 2:" + urls[j]);
                    var temp = {
                        "source": urls[i],
                        "target": urls[j],
                        "weight": 0
                    }
                    console.log("URLs not in textLog.");
                    //table.push(temp);
                }
            }
        }
    }
    return table;
}
