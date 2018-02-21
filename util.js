function returnDuration(startingTime, endingTime) {
    var startingTime = new Date(startingTime);
    var endingTime = new Date(endingTime);
    var hours = endingTime.getHours() - startingTime.getHours();
    var minutes = Math.abs(endingTime.getMinutes() - startingTime.getMinutes());
    var seconds = Math.abs(endingTime.getSeconds() - startingTime.getSeconds());
    var duration = {
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds
    }
    return duration;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


