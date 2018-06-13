// var HTML_TAG_WEIGHTS = {};

function Tag(str, tasksList, correctOccurences, incorrectOccurences) {

    this.text = str;
    this.textLowerCase = str.toLowerCase();

    this.tasks = tasksList || {};

    this.frequency = 0;

    this.correctOccurences = correctOccurences || 0;
    this.incorrectOccurences = incorrectOccurences ||0;

    this.positiveFactor = 0.5;
    this.negativeFactor = -0.5;

    // Use this if separate frequency of html tags is not needed. Using this for now as we are extracting "nes" from a page.
    this.increaseFrequency = function (url, taskid) {

        this.frequency++;

        if (taskid != 0) {
            if (!this.tasks[taskid]) {
                this.tasks[taskid] = {};
            }
            if (!this.tasks[taskid][url]) {
                this.tasks[taskid][url] = 1;
            } else {
                this.tasks[taskid][url]++;
            }
        }
    };

    this.getTaskWeightsNew = function (taskURLs) {
        var taskScores = {};
        var taskFrequencies = {};
        var maxTaskFrequency = 0;

        for (var taskid in this.tasks) {
            var urls = taskURLs[taskid];
            var totalTagFrequencyInTask = 0;
            for (var i = 0; i < urls.length; i++) {
                if (urls[i] != null) {
                    if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0) {
                        if (typeof (this.tasks[taskid][urls[i]]) == typeof (3)) {
                            totalTagFrequencyInTask = totalTagFrequencyInTask + this.tasks[taskid][urls[i]];
                        }
                    }
                }
            }
            taskFrequencies[taskid] = totalTagFrequencyInTask;
            if (totalTagFrequencyInTask > maxTaskFrequency) {
                maxTaskFrequency = totalTagFrequencyInTask;
            }
        }

        for (var taskid in taskFrequencies) {
            taskScores[taskid] = (taskFrequencies[taskid] - maxTaskFrequency) / maxTaskFrequency;
        }

        return taskScores;
    };

    this.getTaskWeight = function (taskid, taskURLs) {
        if (this.tasks.hasOwnProperty(taskid)) {
            var urls = taskURLs[taskid];
            var totalTagFrequencyInTask = 0;
            for (var i = 0; i < urls.length; i++) {
                if (urls[i] != null) {
                    if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0) {
                        if (typeof (this.tasks[taskid][urls[i]]) == typeof (3)) {
                            totalTagFrequencyInTask = totalTagFrequencyInTask + this.tasks[taskid][urls[i]];
                        }
                    }
                }
            }

            var weight = totalTagFrequencyInTask / Object.keys(this.tasks).length;

            if (this.correctOccurences != null) {
                weight = weight + (this.correctOccurences * this.positiveFactor);
            }
            if (this.incorrectOccurences != null) {
                weight = weight + (this.incorrectOccurences * this.negativeFactor); // negative factor is negative so the weight will get decreased.
            }

            return weight;
        }

        return 0;
    };

    this.getTaskWeights = function (taskURLs) {

        var taskScores = {};

        for (var tid in taskURLs) {
            taskScores[tid] = 0;
        }

        for (var taskid in this.tasks) {
            var urls = taskURLs[taskid];
            var totalTagFrequencyInTask = 0;
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0) {
                    if (typeof (this.tasks[taskid][urls[i]]) == typeof (3)) {
                        totalTagFrequencyInTask = totalTagFrequencyInTask + this.tasks[taskid][urls[i]];
                    }
                }
            }
            var weight = totalTagFrequencyInTask / Object.keys(this.tasks).length;

            if (this.correctOccurences != null) {
                weight = weight + (this.correctOccurences * this.positiveFactor);
            }
            if (this.incorrectOccurences != null) {
                weight = weight + (this.incorrectOccurences * this.negativeFactor); // negative factor is negative so the weight will get decreased.
            }

            taskScores[taskid] = weight;
        }

        return taskScores;
    };

}

function getMatchScore(tag1, tag2) {
    return tag1.positiveWeight + tag2.positiveWeight;
}

// Tag1 should be the smaller one that needs to be merged into the bigger Tag2.
function mergeTags(tag1, tag2) {
    for (var taskid in tag1["tasks"]) {
        var taskurls = tag1["tasks"][taskid];
        for (var url in taskurls) {
            var urlFrequency = taskurls[url];
            if (!tag2["tasks"].hasOwnProperty(taskid)) {
                tag2["tasks"][taskid] = {};
            }
            if (!tag2["tasks"][taskid].hasOwnProperty(url)) {
                tag2["tasks"][taskid][url] = urlFrequency;
            }
        }
    }

    return tag2;
}

