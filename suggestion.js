function Suggestion(url, matchedTags, actualTask, suggestedTask, isCorrect, confidence){
    this.url = url;
    this.matchedTags = matchedTags;
    this.actualTask = actualTask;
    this.suggestedTask = suggestedTask;
    this.isCorrect = isCorrect;
    this.confidence = confidence;
}