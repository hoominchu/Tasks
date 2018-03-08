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