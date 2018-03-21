function showStats(tasks, ctaskid) {
    console.log(ctaskid);
    ctaskidString = ctaskid.toString();
    $("#currentTask").text(tasks[ctaskidString].name);

    function showTime() {
        var lastActivation = tasks[ctaskidString].activationTime[tasks[ctaskidString].activationTime.length - 1];
        var currentTime = new Date();

        function returnDuration(endingTime, startingTime) {
            var startingTime = new Date(startingTime);
            var endingTime = new Date(endingTime);
            var hours = Math.abs(endingTime.getHours() - startingTime.getHours());
            var minutes = Math.abs(endingTime.getMinutes() - startingTime.getMinutes());
            var seconds = Math.abs(endingTime.getSeconds() - startingTime.getSeconds());
            var duration = {
                "hours": hours,
                "minutes": minutes,
                "seconds": seconds
            };
            return duration;
        }

        $("#time-hours").text(returnDuration(currentTime, lastActivation).hours + " hours");
        $("#time-minutes").text(returnDuration(currentTime, lastActivation).minutes + " minutes");
        $("#time-seconds").text(returnDuration(currentTime, lastActivation).seconds + " seconds");
    }

    setInterval(showTime, 1000);

}
