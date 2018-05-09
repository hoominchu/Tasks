// var HTML_TAG_WEIGHTS = {};

function Tag(str, tasksList) {

    this.text = str;
    this.textLowerCase = str.toLowerCase();

    this.tasks = tasksList || {};

    this.frequency = 0;

    // Use this if separate frequency of html tags is not needed. Using this for now as we are extracting "nes" from a page.
    this.increaseFrequency = function (documentID, taskid) {

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

    this.getTaskWeight = function (taskid, taskURLs) {
        var urls = taskURLs[taskid];
        var totalTagFrequencyInTask = 0;
        for (var i = 0; i < urls.length; i++) {
            if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0) {
                if (typeof (this.tasks[taskid][urls[i]]) == typeof (3)) {
                    totalTagFrequencyInTask = totalTagFrequencyInTask + this.tasks[taskid][urls[i]];
                }
            }
        }
        return totalTagFrequencyInTask / Object.keys(this.tasks).length;
    };

    this.getTaskWeights = function (taskURLs) {
        var taskScores = {};

        for (var tid in taskURLs) {
            taskScores[tid] = 0;
        }

        for (var taskid in this.tasks) {
            if(taskURLs.hasOwnProperty(taskid)){
                var urls = taskURLs[taskid];
                var totalTagFrequencyInTask = 0;
                for (var i = 0; i < urls.length; i++) {
                    if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0 && urls[i].indexOf("about:blank")) {
                        if (this.tasks.hasOwnProperty(taskid)) {
                            if (this.tasks[taskid].hasOwnProperty([urls[i]])) {
                                if (typeof (this.tasks[taskid][urls[i]]) == typeof (3)) {
                                    totalTagFrequencyInTask = totalTagFrequencyInTask + this.tasks[taskid][urls[i]];
                                }
                            }
                        }
                    }
                }
                var taskWeight = totalTagFrequencyInTask / Object.keys(this.tasks).length;
                taskScores[taskid] = taskWeight;
            }

        }

        return taskScores;
    };

}

function getMatchScore(tag1, tag2) {
    return tag1.positiveWeight + tag2.positiveWeight;
}
