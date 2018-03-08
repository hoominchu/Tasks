chrome.storage.local.get("TASKS", function (tasksObject) {
    var allTasks = tasksObject["TASKS"];
    chrome.storage.local.get("Preferred domains", function (response) {
        var preferredDomainsObject = response["Preferred domains"];

        var domainsPanel = document.getElementById("preferredDomains");

        // Starting from 1 so that "metadata" object is ignored
        for (var i = 0; i < Object.keys(preferredDomainsObject).length; i++) {

            var domainName = Object.keys(preferredDomainsObject)[i];

            if (domainName != "metadata") {
                var domainFrequency = preferredDomainsObject[domainName]["frequency"];
                var activeTasks = preferredDomainsObject[domainName]["Active tasks"];

                //    <div class="btn-group" role="group" aria-label="Button group with nested dropdown"> -- domainDropdownElem
                //         <button type="button" class="btn btn-primary">Primary</button> -- domainButtonElem
                //         <div class="btn-group" role="group"> -- domainDropdownGroupElem
                //              <button id="btnGroupDrop1" type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button> -- domainDropdownButtonsElem
                //              <div class="dropdown-menu" aria-labelledby="btnGroupDrop1"> -- tasksGroupForDropdown
                //                  <a class="dropdown-item" href="#">Dropdown link</a> -- domainActiveTasksListElem
                //                  <a class="dropdown-item" href="#">Dropdown link</a>
                //              </div>
                //          </div>
                //     </div>

                var domainDropdownElem = document.createElement("div");
                domainDropdownElem.className = "btn-group";
                domainDropdownElem.setAttribute("role", "group");
                domainDropdownElem.setAttribute("aria-label", "Button group with nested dropdown");

                var domainButtonElem = document.createElement("button");
                domainButtonElem.className = "btn btn-outline-primary";
                // domainCardHeaderElem.innerText = domainName;
                var domainButtonLinkElem = document.createElement("a");
                domainButtonLinkElem.setAttribute("href", "http://" + domainName);
                domainButtonLinkElem.innerText = domainName;
                domainButtonElem.appendChild(domainButtonLinkElem);

                var domainDropdownGroupElem = document.createElement("div");
                domainDropdownGroupElem.className = "btn-group";
                domainDropdownGroupElem.setAttribute("role", "group");

                var domainDropdownButtonsElem = document.createElement("button");
                domainDropdownButtonsElem.id = "activeTasksForDomain" + i;
                domainDropdownButtonsElem.setAttribute("type", "button");
                domainDropdownButtonsElem.className = "btn btn-primary dropdown-toggle";
                domainDropdownButtonsElem.setAttribute("data-toggle", "dropdown");
                domainDropdownButtonsElem.setAttribute("aria-haspopup", "true");
                domainDropdownButtonsElem.setAttribute("aria-expanded", "false");

                var tasksGroupForDropdown = document.createElement("div");
                tasksGroupForDropdown.className = "dropdown-menu";
                tasksGroupForDropdown.setAttribute("aria-labelledby", "activeTasksForDomain" + i);
                // tasksGroupForDropdown.innerText = "Frequency : " + domainFrequency;

                // domainDropdownGroupElem.appendChild(domainDropdownButtonsElem);
                // domainCardBodyElem.appendChild(domainFrequencyElem);

                for (var j = 0; j < activeTasks.length; j++) {
                    var activeTaskID = activeTasks[j];

                    // This check is to ignore default task
                    if (activeTaskID != 0) {
                        var domainActiveTasksListElem = document.createElement("a");
                        var taskName = allTasks[activeTaskID]["name"];
                        domainActiveTasksListElem.className = "dropdown-item";
                        domainActiveTasksListElem.setAttribute("a","#");
                        domainActiveTasksListElem.innerText = taskName;

                        // var removeButton = document.createElement("i");
                        // removeButton.className = "far fa-trash-alt";
                        // domainActiveTasksListElem.appendChild(removeButton);

                        tasksGroupForDropdown.appendChild(domainActiveTasksListElem);
                    }
                }

                domainDropdownGroupElem.appendChild(domainDropdownButtonsElem);
                domainDropdownGroupElem.appendChild(tasksGroupForDropdown);
                domainDropdownElem.appendChild(domainButtonElem);
                domainDropdownElem.appendChild(domainDropdownGroupElem);

                domainsPanel.appendChild(domainDropdownElem);
            }
        }
    });
});
