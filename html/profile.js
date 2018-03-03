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

                // <li class="list-group-item d-flex justify-content-between align-items-center">
                //         Morbi leo risus
                //     <span class="badge badge-primary badge-pill">1</span>
                //         </li>

                // <div class="card border-dark mb-3 round-corner" style="max-width: 20rem;">
                //         <div class="card-header round-corner-top">Domain</div>
                //         <div class="card-body">
                //         <h4 class="card-title">Dark card title</h4>
                //     <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                //     </div>
                //     </div>

                var domainCardElem = document.createElement("div");
                domainCardElem.className = "card border-dark mb-3 round-corner";

                var domainCardHeaderElem = document.createElement("div");
                domainCardHeaderElem.className = "card-header round-corner-top text-primary";
                // domainCardHeaderElem.innerText = domainName;
                var domainCardHeaderLinkElem = document.createElement("a");
                domainCardHeaderLinkElem.setAttribute("href","http://"+domainName);
                domainCardHeaderLinkElem.innerText = domainName;
                domainCardHeaderElem.appendChild(domainCardHeaderLinkElem);

                var domainCardBodyElem = document.createElement("div");
                domainCardBodyElem.className = "card-body";

                var domainCardTitleElem = document.createElement("p");
                domainCardTitleElem.className = "card-title";
                domainCardTitleElem.innerText = "Preferred in tasks";

                var domainFrequencyElem = document.createElement("p");
                domainFrequencyElem.className = "text-muted";
                domainFrequencyElem.innerText = "Frequency : " + domainFrequency;

                domainCardBodyElem.appendChild(domainCardTitleElem);
                // domainCardBodyElem.appendChild(domainFrequencyElem);

                for (var j = 0; j < activeTasks.length; j++) {
                    var activeTaskID = activeTasks[j];

                    // This check is to ignore default task
                    if (activeTaskID != 0) {
                        var domainActiveTasksListElem = document.createElement("li");
                        var taskName = allTasks[activeTaskID]["name"];
                        domainActiveTasksListElem.className = "list-group-item d-flex justify-content-between align-items-center";
                        domainActiveTasksListElem.innerText = taskName;

                        var removeButton = document.createElement("i");
                        removeButton.className = "far fa-trash-alt";
                        domainActiveTasksListElem.appendChild(removeButton);

                        domainCardBodyElem.appendChild(domainActiveTasksListElem);
                    }
                }

                domainCardElem.appendChild(domainCardHeaderElem);
                domainCardElem.appendChild(domainCardBodyElem);

                domainsPanel.appendChild(domainCardElem);
            }
        }
    });
});
