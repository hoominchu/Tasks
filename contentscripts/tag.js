// var HTML_TAG_WEIGHTS = {};

function Tag(str, tasksList) {

    this.text = str;
    this.textLowerCase = str.toLowerCase();

    this.tasks = tasksList || {};

    this.frequency = 0;

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

    this.getTaskWeights = function (taskURLs) {
        var taskScores = {};

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
            var taskWeight = totalTagFrequencyInTask / Object.keys(this.tasks).length;
            taskScores[taskid] = taskWeight;
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

