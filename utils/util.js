function returnDuration(startingTime, endingTime) {
    var startingTime = new Date(startingTime);
    var endingTime = new Date(endingTime);
    var duration = endingTime - startingTime;
    return duration;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function indexOfElementWithProperty(arr, propName, propValue){
    return arr.indexOf(arr.find((element) => element[propName] === propValue));
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

function getJaccardScores(urlTags1, urlTags2){
    var intersection = _.intersection(urlTags1, urlTags2);
    var union = _.union(urlTags1, urlTags2);
    var jaccardScore = intersection.length / union.length;
    if(!isNaN(jaccardScore)){
        return jaccardScore
    }
    else{
        return 0;
    }

}

function sortElementsByFrequency(array){
    var frequencyMap = {};
    for(var i = 0; i<array.length; i++){
        if(Object.keys(frequencyMap).indexOf(array[i])>0){
            frequencyMap[array[i]]= frequencyMap[array[i]]+ 1;
        }
        else{
            frequencyMap[array[i]] = {};
            frequencyMap[array[i]] = 1;
        }
    }
    var sortable = [];
    for (var element in frequencyMap) {
        sortable.push([element, frequencyMap[element]]);
    }

    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    return(sortable);
}

function compare(a,b) {
    if (a["weight"] < b["weight"])
        return -1;
    if (a["weight"] > b["weight"])
        return 1;
    return 0;
}

function htmlParser(htmlString) {
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(htmlString, "text/html");
    return htmlDoc;
}

function httpGet(theUrl, options, callback) {
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            callback(options, htmlParser(xmlhttp.responseText));
        }
    }
    xmlhttp.open("GET", theUrl, false );
    xmlhttp.send();
}

function objectFromJSON(file, callback){
    $.getJSON(file, function(json){
        var object = json;
        callback(object);
    });
}

function checkIfStringContainsAnyStrings(strings, string){
    for(var j = 0; j<strings.length; j++){
        if(string.indexOf(strings[j])>-1){
            return true;
        }
    }
    return false;
}