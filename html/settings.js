// If default settings object is changed here, it should be changed in init.js also.
var DEFAULT_SETTINGS = {
    "notifications": "Enabled",
    "suggestions based on": "Open tabs",
    "suggestions threshold": "Medium",
    "block notifications on": ["www.google.com","www.google.co.in","www.facebook.com"]
};

var settings = DEFAULT_SETTINGS;

chrome.storage.local.get("Settings", function (settings) {

    // This variable contains all the options for each of the settings option.
    var settingsOptions = {
        "notifications": ["Enabled", "Disabled"],
        "suggestions based on": ["Open tabs", "Liked pages"],
        "suggestions threshold": ["Low", "Medium", "High"]
    };

    settings = settings["Settings"];

    //Template
// <div class="btn-group" role="group" aria-label="Basic example">
//         <button type="button" class="btn btn-secondary">Left</button>
//         <button type="button" class="btn btn-secondary">Middle</button>
//         <button type="button" class="btn btn-secondary">Right</button>
//         </div>

    showNotificationOptions(settings, settingsOptions);

    showSuggestionsBasedOnOptions(settings, settingsOptions);

    showSuggestionThresholdOptions(settings, settingsOptions);

    showNoNotificationDomains(settings, settingsOptions);
});

function showNotificationOptions(settings, settingsOptions) {
    // Displaying notification options
    var notification_set_to = settings["notifications"];

    var notifications_options = settingsOptions["notifications"];
    var notifications_options_element = document.getElementById("notification_options");
    for (var i = 0; i < notifications_options.length; i++) {
        var option = document.createElement("button");
        var classString = "btn";
        if (notifications_options[i] == notification_set_to) {
            classString = classString + " " + "btn-primary";
        }
        else {
            classString = classString + " " + "btn-secondary";
        }
        if (i == 0) {
            classString = classString + " round-corner-left";
        }
        if (i == notifications_options.length - 1) {
            classString = classString + " round-corner-right";
        }

        option.className = classString;
        option.innerText = notifications_options[i];
        option.onclick = function (ev) {
            console.log(ev);
            if (this.innerText == "Enabled") {
                settings["notifications"] = "Enabled";
            }
            if (this.innerText == "Disabled") {
                settings["notifications"] = "Disabled";
            }
            updateStorage("Settings", settings);
            location.reload();
        };

        notifications_options_element.appendChild(option);
    }
}

function showSuggestionsBasedOnOptions(settings, settingsOptions) {
    // Displaying options for suggestions
    var suggestions_based_on_options_element = document.getElementById("suggestion_options");
    var suggestions_based_on_set_to = settings["suggestions based on"];
    var suggestions_based_on_options = settingsOptions["suggestions based on"];

    for (var i = 0; i < suggestions_based_on_options.length; i++) {
        var option = document.createElement("button");
        var classString = "btn";
        if (suggestions_based_on_options[i] == suggestions_based_on_set_to) {
            classString = classString + " " + "btn-primary";
        }
        else {
            classString = classString + " " + "btn-secondary";
        }

        if (i == 0) {
            classString = classString + " round-corner-left";
        }
        if (i == suggestions_based_on_options.length - 1) {
            classString = classString + " round-corner-right";
        }

        option.className = classString;
        option.innerText = suggestions_based_on_options[i];
        option.onclick = function (ev) {
            console.log(ev);
            settings["suggestions based on"] = this.innerText;
            updateStorage("Settings", settings);
            location.reload();
        };

        suggestions_based_on_options_element.appendChild(option);
    }
}

function showNoNotificationDomains(settings, settingsOptions) {

// <div class="alert alert-dismissible alert-light">
//         <button type="button" class="close" data-dismiss="alert">&times;</button>
//     <strong>Heads up!</strong> This <a href="#" class="alert-link">alert needs your attention</a>, but it's not super important.
//     </div>


// <span class="badge badge-secondary">Secondary</span>

// <button type="button" class="btn btn-outline-primary">Primary</button>

    // Displaying options for suggestions
    var block_notifications_on_element = document.getElementById("block_notifications_domains");
    var block_notifications_on = settings["block notifications on"];

    for (var i = 0; i < block_notifications_on.length; i++) {
        var card = document.createElement("button");
        card.setAttribute("type", "button");
        card.className = "btn btn-outline-primary round-corner";
        card.style.margin = "5px";

        var closeButton = document.createElement("button");
        closeButton.className = "close";
        closeButton.setAttribute("data-dismiss", "alert");
        closeButton.innerHTML = "<span style=\"color:black\">&nbsp;&times;</span>";
        closeButton.onclick = function (ev) {
            var domainToBeRemoved = this.parentElement.getElementsByTagName("strong")[0].innerText;
            settings["block notifications on"].splice(settings["block notifications on"].indexOf(domainToBeRemoved), 1);
            updateStorage("Settings", settings);
            location.reload();
        };

        var domainName = document.createElement("strong");
        domainName.innerText = block_notifications_on[i];
        card.appendChild(closeButton);
        card.appendChild(domainName);

        block_notifications_on_element.appendChild(card);
    }

    var inputElement = document.getElementById("block_notifications_on_domains_input");
    var addButton = document.getElementById("submit_block_notifications_on");

    addButton.onclick = function (ev) {
        var enteredString = inputElement.value;
        enteredString = enteredString.trim();
        if (isURL(enteredString)) {
            enteredString = extractHostname(enteredString);
        }
        if (enteredString.substring(0, 4) != "www.") {
            enteredString = "www." + enteredString;
        }
        var existingDomains = settings["block notifications on"];
        if (existingDomains.indexOf(enteredString) > -1) {
            alert("Notifications on this domain are already blocked.");
        } else {
            settings["block notifications on"].push(enteredString);
            updateStorage("Settings", settings);
            location.reload();
        }
    }

}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function isURL(str) {
    var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if (regex.test(str)) {
        return true;
    }
}


function showSuggestionThresholdOptions(settings, settingsOptions) {
    // Threshold for suggestions
    var suggestions_threshold_element = document.getElementById("suggestion_threshold");
    var suggestions_threshold_set_to = settings["suggestions threshold"];
    var suggestions_threshold_options = settingsOptions["suggestions threshold"];

    for (var i = 0; i < suggestions_threshold_options.length; i++) {
        var option = document.createElement("button");
        var classString = "btn";
        if (suggestions_threshold_options[i] == suggestions_threshold_set_to) {
            classString = classString + " " + "btn-primary";
        }
        else {
            classString = classString + " " + "btn-secondary";
        }

        if (i == 0) {
            classString = classString + " round-corner-left";
        }
        if (i == suggestions_threshold_options.length - 1) {
            classString = classString + " round-corner-right";
        }

        option.className = classString;
        option.innerText = suggestions_threshold_options[i];
        option.onclick = function (ev) {
            console.log(ev);
            settings["suggestions threshold"] = this.innerText;
            updateStorage("Settings", settings);
            location.reload();
        };

        suggestions_threshold_element.appendChild(option);
    }
}

function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}