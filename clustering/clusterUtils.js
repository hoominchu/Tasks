var HTML_TAGS_TO_LOG = ["a", "h1", "h2", "th", "td", "p"];
var TAGS_TO_BE_IGNORED = ["home","like", "privacy policy", "help", "share", "search", "log in", "facebook", "Facebook", "twitter", "Twitter", "youtube", "Youtube", "contact us", "india"];
var tagsToRemove = ["nav"];

function getTagsOnDocument(htmlDocument) {

    var tags = {};
    var htmlDocument = htmlDocument;

    for (var i = 0; i < HTML_TAGS_TO_LOG.length; i++) {
        var htmlTag = HTML_TAGS_TO_LOG[i];
        for(var t = 0; t<tagsToRemove.length; t++){
            var nodes = htmlDocument.getElementsByTagName(tagsToRemove[t]);
            for(var k = 0; k < nodes.length; k++){
                nodes[k].parentNode.removeChild(nodes[k]);
            }
        }
        var elements = htmlDocument.getElementsByTagName(htmlTag);

        for (var j = 0; j < elements.length; j++) {
            var elem = elements[j];
            var text = elem.innerText;
            text = cleanTag(text);
            // if (isValidTag(text)) {
            //     var textLowerCase = text.toLowerCase();
            //     if (tags[textLowerCase]) {
            //         var tag = tags[textLowerCase];
            //         tag.increaseFrequency(htmlTag); // Functions to calculate weight are in the constructor.
            //         tag.addPosition(elem);
            //         tags[textLowerCase] = tag;
            //     }
            //     else {
            //         var doc = nlp(text)
            //         var topics = doc.topics().data();
            //         for(var k = 0; k<topics.length; k++){
            //             var tag = new Tag(topics[k]["text"]);
            //             tag.increaseFrequency(htmlTag);
            //             tags[textLowerCase] = tag;
            //         }
            //         var tag = new Tag(text);
            //         tag.increaseFrequency(htmlTag);
            //         tag.addPosition(elem);
            //         tags[textLowerCase] = tag;
            //     }
            // }

            if (isValidTag(text)) {
                var doc = nlp(text)
                var topics = doc.topics().data();
                for(var k = 0; k<topics.length; k++){
                    var tag = new Tag(cleanTag(topics[k]["text"]));
                    var textLowerCase = cleanTag(topics[k]["text"].toLowerCase());
                    tag.increaseFrequency(htmlTag);
                    tags[textLowerCase] = tag;
                }
                // var tag = new Tag(text);
                // tag.increaseFrequency(htmlTag);
                // tag.addPosition(elem);
                // tags[textLowerCase] = tag;
            }
        }
    }

    return tags;
}



function docFetcher(urls, callback){
    var documents = {};
    for(var i = 0; i<urls.length; i++){
        var options = {
            "totalLength": urls.length,
            "url": urls[i],
            "currentCount": i+1
        }
        try{
            httpGet(urls[i], options, function(options, response){
                documents[options["url"]] = response;
                // documents.push(response);
                // console.log(options["currentCount"]);
                if(options["currentCount"] == options["totalLength"]){
                    console.log("Done");
                    callback(documents);
                }
            });
        }
        catch(err){
            console.log(err + " for " + urls[i]);
            if(options["currentCount"] == options["totalLength"]){
                console.log("Done");
                callback(documents);
            }
        }
    }
}


// function docFetcher(urls, callback){
//     for(var i = 0; i<150; i++){
//         try{
//             var options = {
//                 "totalLength": urls.length,
//                 "url": urls[i],
//                 "currentCount": i+1
//             }
//             httpGet(urls[i], options, function(options, response){
//                 documents[options["url"]] = response;
//                 // documents.push(response);
//                 console.log(options["currentCount"]);
//                 if(options["currentCount"] > 100){
//                     callback(documents);
//                 }
//             });
//         }
//         catch(err){
//             console.log(err + " for " + urls[i]);
//         }
//     }
// }

function cleanTag(str) {

    for(var i = 0; i<TAGS_TO_BE_IGNORED.length; i++){
        str.split(TAGS_TO_BE_IGNORED[i]).join("");
    }

    str.replace(/(\r\n\t|\n|\r\t)/gm, " ");

    // Replaces spaces at the beginning
    str = str.replace(/^\s+/g, '');
    // Replaces spaces at the end
    str = str.replace(/\s+$/g, '');

    // Replaces " at the beginning
    str = str.replace(/^"+/g, '');
    // Replaces " at the end
    str = str.replace(/"+$/g, '');

    return str;
}

function isValidTag(tag) {
    if (tag == null) {
        return false;
    }
    // return /.*[a-zA-Z].*/g.test(tag) && /^([^0-9]*)$/g.test(tag) && TAGS_TO_BE_IGNORED.indexOf(tag) < 0;
    return true;
}