function Tag(str, totalFrequency, htmlTagFrequencies, positiveWeight, negativeWeight) {
    this.text = str;
    this.textLowerCase = str.toLowerCase();
    this.frequency = totalFrequency;
    this.htmlTagFrequencies = htmlTagFrequencies;
    this.positiveWeight = positiveWeight;
    this.negativeWeight = negativeWeight;
}

// var HTML_TAG_WEIGHTS = {};

function Tag(str, tasksList, freq, pwt, docFrequencies, taskScores) {

    // Use this if separate count for html tags
    // this.increaseFrequency = function (htmlTag) {
    //     this.htmlTagFrequencies[htmlTag]++;
    //     this.frequency++;
    //
    //     // Increase weights as needed.
    //     this.positiveWeight = this.frequency;
    //
    // };
    // this.htmlTagFrequencies = {};
    // for (var i = 0; i < HTML_TAGS_TO_LOG.length; i++) {
    //     this.htmlTagFrequencies[HTML_TAGS_TO_LOG[i]] = 0;
    // }
    // this.htmlTagFrequencies["meta"] = 0;

    this.text = str;
    this.textLowerCase = str.toLowerCase();

    this.tasks = tasksList || {};

    this.taskScores = taskScores || {};

    this.frequency = freq || 0;

    this.positiveWeight = pwt || 0.0;
    // this.negativeWeight = 0.0;

    this.termFrequencies = docFrequencies || {};

    // Use this if separate frequency of html tags is not needed. Using this for now as we are extracting "nes" from a page.
    this.increaseFrequency = function (documentID) {
        this.frequency++;
        if (this.termFrequencies.hasOwnProperty(documentID)) {
            this.termFrequencies[documentID]++;
        } else {
            this.termFrequencies[documentID] = 1;
        }
        // Increase weights as needed.
        // this.calculateWeight();
    };

    this.updateTaskWeights = function (taskURLs) {
        for (var taskid in this.tasks) {
            var urls = taskURLs[taskid];
            var totalTagFrequencyInTask = 0;
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].indexOf("chrome-extension://") < 0 && urls[i].indexOf("chrome://") < 0) {
                    if (typeof (this.termFrequencies[urls[i]]) == typeof (3)) {
                        totalTagFrequencyInTask = totalTagFrequencyInTask + this.termFrequencies[urls[i]];
                    }
                }
            }
            var taskWeight = totalTagFrequencyInTask / Object.keys(this.tasks).length;
            this.taskScores[taskid] = taskWeight;
        }
    };

    this.addTask = function (taskid, url) {
        if (taskid != 0) {
            if (!this.tasks[taskid]) {
                this.tasks[taskid] = {};
            }
            if (!this.tasks[taskid][url]) {
                this.tasks[taskid][url] = 0;
            }
        }
    };

    this.removeTask = function (taskid, url) {
        if (this.tasks[taskid]) {
            delete this.tasks[taskid][url];
        }
    };

    this.calculateWeight = function () {
        var docFrequency = new Set(this.tasks);
        this.positiveWeight = this.frequency / docFrequency.size;

        // weight = frequency of  * no of pages/ documentfrequency

    };

    // this.positions = [];
    // this.addPosition = function (elem) {
    //     var elemRect = elem.getBoundingClientRect();
    //     var xCoord = elemRect.left;
    //     var yCoord = elemRect.bottom;
    //     var htmlTag = elem.tagName.toLowerCase();
    //     var obj = {
    //         "xCoordinate": xCoord,
    //         "yCoordinate": yCoord,
    //         "HTML Tag": htmlTag
    //     };
    //     this.positions.push(obj)
    // };
    //
    // this.getPositions = function () {
    //     return this.positions;
    // };
    //
    // this.getPostiveWeight = function () {
    //     return this.positiveWeight;
    // }

}

function getMatchScore(tag1, tag2) {
    return tag1.positiveWeight + tag2.positiveWeight;
}

