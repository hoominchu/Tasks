// If default settings object is changed here, it should be changed in init.js also.
var DEFAULT_SETTINGS = {
    "notifications": "Enabled",
    "suggestions based on": "Open tabs"
};

var settings = DEFAULT_SETTINGS;

chrome.storage.local.get("Settings", function (settings) {

    // This variable contains all the options for each of the settings option.
    var settingsOptions = {
        "notifications": ["Enabled", "Disabled"],
        "suggestions based on": ["Open tabs", "Liked pages"]
    };

    settings = settings["Settings"];

// <div class="btn-group" role="group" aria-label="Basic example">
//         <button type="button" class="btn btn-secondary">Left</button>
//         <button type="button" class="btn btn-secondary">Middle</button>
//         <button type="button" class="btn btn-secondary">Right</button>
//         </div>

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

    // Displaying options for suggestions
    var suggestions_based_on_options_element = document.getElementById("suggestion_options");
    var suggestions_based_on_set_to = settings["suggestions based on"];
    var suggestions_based_on_options = settingsOptions["suggestions based on"];

    for (var i = 0; i < suggestions_based_on_options.length; i++) {
        option = document.createElement("button");
        classString = "btn";
        if (suggestions_based_on_options[i] == suggestions_based_on_set_to) {
            classString = classString + " " + "btn-primary";
        }
        else {
            classString = classString + " " + "btn-secondary";
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
});

function updateStorage(key, obj) {
    var tempObj = {};
    tempObj[key] = obj;
    chrome.storage.local.set(tempObj);
}