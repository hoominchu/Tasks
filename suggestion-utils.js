// Takes an uncleaned tag and cleans it. Add any required condition in this condition.
function cleanTag(str) {

    str = str.trim();

    str = str.replace(/(\r\n\t|\n|\r\t)/gm, ". ");

    str = str.replace(/\u21b5/g, ". ");

    // Replaces spaces at the beginning
    str = str.replace(/^\s+/g, '');
    // Replaces spaces at the end
    str = str.replace(/\s+$/g, '');

    // Replaces " at the beginning
    str = str.replace(/^"+/g, '');
    // Replaces " at the end
    str = str.replace(/"+$/g, '');

    // Replaces , at the beginning
    str = str.replace(/^,+/g, '');
    // Replaces , at the end
    str = str.replace(/,+$/g, '');

    // Replaces - at the beginning
    str = str.replace(/^-+/g, '');
    // Replaces - at the end
    str = str.replace(/-+$/g, '');

    // Replaces ; at the beginning
    str = str.replace(/^;+/g, '');
    // Replaces ; at the end
    str = str.replace(/;+$/g, '');

    // Replaces ' at the beginning
    str = str.replace(/^'+/g, '');
    // Replaces ' at the end
    str = str.replace(/'+$/g, '');

    // Replaces . at the beginning
    str = str.replace(/^\.+/g, '');
    // Replaces . at the end
    str = str.replace(/\.+$/g, '');

    // Replaces ? at the beginning
    str = str.replace(/^\?+/g, '');
    // Replaces ? at the end
    str = str.replace(/\?+$/g, '');

    // Replaces 's at the end
    str = str.replace(/'s+$/g, '');

    str = str.trim();

    return str;
}

// Checks if a tag should be indexed. Add more conditions here if required.
function isValidTag(tag) {
    if (tag == null) {
        return false;
    }

    if (stopwords.indexOf(tag.toLowerCase()) > -1) {
        return false;
    }

    if (TAGS_TO_BE_IGNORED.indexOf(tag.toLowerCase()) > -1) {
        return false;
    }

    if (!(tag.match(/^[A-Za-z\s]+$/gim))) {
        return false;
    }

    return tag.length > 3 && tag.length < 25 && /.*[a-zA-Z].*/g.test(tag) && /^([^0-9]*)$/g.test(tag);
}

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}