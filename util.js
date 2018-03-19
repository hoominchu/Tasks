function returnDuration(startingTime, endingTime) {
    var startingTime = new Date(startingTime);
    var endingTime = new Date(endingTime);
    var duration = endingTime - startingTime
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
    var jaccardScore = (intersection.length)/(union.length);
    return jaccardScore;
}

function compare(a,b) {
    if (a["weight"] < b["weight"])
        return -1;
    if (a["weight"] > b["weight"])
        return 1;
    return 0;
}
