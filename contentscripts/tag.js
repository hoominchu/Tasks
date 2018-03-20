function Tag(str, totalFrequency, htmlTagFrequencies, positiveWeight, negativeWeight) {
    this.text = str;
    this.textLowerCase = str.toLowerCase();
    this.frequency = totalFrequency;
    this.htmlTagFrequencies = htmlTagFrequencies;
    this.positiveWeight = positiveWeight;
    this.negativeWeight = negativeWeight;
}


function Tag(str) {
    this.text = str;
    this.textLowerCase = str.toLowerCase();

    this.frequency = 0;
    this.htmlTagFrequencies = {};
    for (var i = 0; i < HTML_TAGS_TO_LOG.length; i++) {
        this.htmlTagFrequencies[HTML_TAGS_TO_LOG[i]] = 0;
    }

    this.positiveWeight = 0.0;
    this.negativeWeight = 0.0;
    
    this.increaseFrequency = function (htmlTag) {
        this.htmlTagFrequencies[htmlTag]++;
        this.frequency++;
    }

}

