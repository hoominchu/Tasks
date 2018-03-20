function Tag(str, totalFrequency, htmlTagFrequencies, positiveWeight, negativeWeight) {
    this.text = str;
    this.textLowerCase = str.toLowerCase();
    this.frequency = totalFrequency;
    this.htmlTagFrequencies = htmlTagFrequencies;
    this.positiveWeight = positiveWeight;
    this.negativeWeight = negativeWeight;
}

var HTML_TAG_WEIGHTS = {};

function Tag(str) {
    this.text = str;
    this.textLowerCase = str.toLowerCase();

    this.frequency = 0;
    this.htmlTagFrequencies = {};
    for (var i = 0; i < HTML_TAGS_TO_LOG.length; i++) {
        this.htmlTagFrequencies[HTML_TAGS_TO_LOG[i]] = 0;
    }
    this.htmlTagFrequencies["meta"] = 0;

    this.positiveWeight = 0.0;
    this.negativeWeight = 0.0;

    this.positions = [];

    this.increaseFrequency = function (htmlTag) {
        this.htmlTagFrequencies[htmlTag]++;
        this.frequency++;

        // Increase weights as needed.
        this.positiveWeight = this.frequency;

    };

    this.addPosition = function (elem) {
        var elemRect = elem.getBoundingClientRect();
        var xCoord = elemRect.left;
        var yCoord = elemRect.bottom;
        var htmlTag = elem.tagName.toLowerCase();
        var obj = {
            "xCoordinate": xCoord,
            "yCoordinate": yCoord,
            "HTML Tag": htmlTag
        };
        this.positions.push(obj)
    };

    this.getPositions = function () {
        return this.positions;
    };

    this.getPostiveWeight = function () {
        return this.positiveWeight;
    }

}

function getMatchScore(tag1, tag2) {
    return tag1.positiveWeight + tag2.positiveWeight;
}

