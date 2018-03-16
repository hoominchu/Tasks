// ----------------------------------------------------
// OAuth
// ----------------------------------------------------

var API_KEY = 'AIzaSyAuPajSr17inQQYo4hXnh6DiWCs84fJXpo';
var CLIENT_ID = '263846417973-s13arqju7bhiaco6rd9lkrcnh5jsffla.apps.googleusercontent.com';

var EMAIL = "";
var AUTH_TOKEN = "";
chrome.storage.local.get("email", function (obj) {
    if (obj) {
        EMAIL = obj["email"];
    }
});


// chrome.storage.local.get("authToken", function (obj) {
//     if (obj) {
//         AUTH_TOKEN = obj["authToken"];
//     }
// });

chrome.identity.getAuthToken({'interactive': false}, function (current_token) {
    if (current_token) {
        AUTH_TOKEN = current_token;
    }
});

function t2() {
    var url = 'https://en.wikipedia.org/wiki/File:CGJung.jpg';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
        if (this.status == 200) {
            var myObject = this.target.result;
            console.log(myObject);
        }
    };
    xhr.send();
}

function trial() {
    var image_location = 'https://en.wikipedia.org/wiki/File:CGJung.jpg';

    var request22 = new XMLHttpRequest();
    request22.open('GET', image_location, true);
    request22.responseType = 'blob';
    request22.onload = function () {
        var fileData = request22.response;


        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        var reader = new FileReader();
        reader.readAsDataURL(fileData);
        reader.onload = function (e) {
            var contentType = fileData.type || 'application/octet-stream';
            var metadata = {
                'name': fileData.fileName,
                'mimeType': contentType
            };
            var data = reader.result;

            var multipartRequestBody =
                delimiter + 'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n';

            //Transfer images as base64 string.
            if (contentType.indexOf('image/') === 0) {
                var pos = data.indexOf('base64,');
                multipartRequestBody += 'Content-Transfer-Encoding: base64\r\n' + '\r\n' +
                    data.slice(pos < 0 ? 0 : (pos + 'base64,'.length));
            } else {
                multipartRequestBody += +'\r\n' + data;
            }
            multipartRequestBody += close_delim;

            var request = gapi.client.request({
                'path': '/upload/drive/v3/files',
                'method': 'POST',
                'params': {'uploadType': 'multipart'},
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });

            request.execute(function (file) {
                if (file.id) {
                    // send id to STM and mark uploaded
                    alert("request execute: " + JSON.stringify(file));
                }
            });

        };
    };
    request22.send();
}

function createFolderOnDrive(folder_name) {
    var resource = {
        "mimeType": "application/vnd.google-apps.folder",
        "name": folder_name
    };
    var Su = {
        "mimeType": "application/vnd.google-apps.folder",
        "name": "xyz"
    };
    var x = new XMLHttpRequest();
    x.open('POST', 'https://www.googleapis.com/drive/v3/files?ignoreDefaultVisibility=false&keepRevisionForever=false&supportsTeamDrives=true&useContentAsIndexableText=false&alt=json', true)
    x.setRequestHeader('Authorization', 'Bearer ' + AUTH_TOKEN);
    x.setRequestHeader('Accept', 'application/json');
    x.setRequestHeader('Content-Type', 'application/json');
    x.setRequestHeader('resource', resource);
    x.onload = function () {
        console.log(x.response)
    };
    x.send();
}

function getFileFromURL(url) {
    // Download a file form a url.
    function saveFile(url) {
        // Get file name from url.
        var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
            a.download = filename; // Set the file name.
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            delete a;
        };
        xhr.open('GET', url);
        xhr.send();
    }
}

function saveFileToDrive(fileURL) {
    var reader = new FileReader();
    var url = fileURL;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'blob';
    request.onload = function () {
        reader.readAsDataURL(request.response);
        reader.onload = function (e) {
            console.log(e);
        };
    };
    request.send();

    var uploader = new MediaUploader({
        file: reader,
        token: AUTH_TOKEN,
    });
    uploader.upload();

    // var f = new File(fileURL);
    // var x = new XMLHttpRequest();
    // x.open('POST', 'https://www.googleapis.com/upload/drive/v3?uploadType=media');
    // x.setRequestHeader('Authorization', 'Bearer ' + AUTH_TOKEN);
    // x.setRequestHeader('Content-Type', 'image/jpeg');
    // x.setRequestHeader('Content-Length', reader.total);
    // x.onload = function () {
    //     console.log(x.response);
    // };
    // x.send(reader);

    //Useless

    // var saveToDriveButton = document.createElement('div');
    // saveToDriveButton.setAttribute('class', 'g-savetodrive');
    // saveToDriveButton.setAttribute('display', 'none');
    // saveToDriveButton.setAttribute('data-src', fileURL);
    // saveToDriveButton.setAttribute('data-filename', 'Sailboat/' + 'tempname');
    // document.body.appendChild(saveToDriveButton);
    // saveToDriveButton.click();
    // // var f = new File(fileURL);
    // // var uploader = new MediaUploader({
    // //     file: f,
    // //     token: AUTH_TOKEN
    // // });
    // console.log('Uploader object created');
    // // uploader.upload();
    // console.log("File saved to Drive!")
}

function checkIfFileExistsOnDrive(filename) {
    var x = new XMLHttpRequest();
    x.open('GET', 'https://www.googleapis.com/drive/v3/files?name=' + filename);
    x.setRequestHeader('Authorization', 'Bearer ' + AUTH_TOKEN);
    x.setRequestHeader('Accept', 'application/json');
    x.onload = function () {
        console.log(x.response)
    };
    x.send();
}

function logUserIn() {
    chrome.identity.getProfileUserInfo(function (info) {
        // console.log(info);
        chrome.storage.local.set({"email": info.email, "isSignedIn": true})
    });
}

function logUserOut() {
    chrome.storage.local.set(({"email": "", "isSignedIn": false}))
}

function setAuthToken(token) {
    console.log(typeof(token));
    chrome.storage.local.set({"authToken": token})
}

function revokeToken() {
    chrome.identity.getAuthToken({'interactive': false},
        function (current_token) {
            if (!chrome.runtime.lastError) {

                // @corecode_begin removeAndRevokeAuthToken
                // @corecode_begin removeCachedAuthToken
                // Remove the local cached token
                chrome.identity.removeCachedAuthToken({token: current_token},
                    function () {
                    });
                // @corecode_end removeCachedAuthToken

                // Make a request to revoke token in the server
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
                    current_token);
                xhr.send();
                // @corecode_end removeAndRevokeAuthToken

                // Update the user interface accordingly

                // $('#revoke').get(0).disabled = true;
                console.log('Token revoked and removed from cache. ' +
                    'Check chrome://identity-internals to confirm.');
            }
        });
}

window.onload = function () {

    // changeLoginStatusMessage();

    chrome.storage.local.get("TASKS", function (taskObject) {
        if (taskObject["TASKS"]) {
            showTasks(taskObject["TASKS"]);
        }

        for (var i = 0; i < document.getElementsByClassName("task").length; i++) {
            document.getElementsByClassName("task")[i].addEventListener("click", function (task) {
                return function (task) {
                    chrome.runtime.sendMessage(
                        {
                            "type": "switch-task",
                            "nextTaskId": task.srcElement.id
                        }
                    );
                }(task);
            });
            document.getElementsByClassName("rename")[i].addEventListener("click", function (task) {
                return function (task) {
                    $("#tasks").replaceWith('<form id="renameForm"><div class="form-group"><label for="newTaskName">What would you like to name the task?</label><input type="text" class="form-control round-corner" id="renameInput" aria-describedby="newNameForTask" placeholder="New Name"></div><button type="submit" class="btn btn-primary round-corner">Rename Task</button> <button class="btn btn-secondary round-corner" id="cancelButton">Cancel</button></form>');
                    $("#cancelButton").click(function (cancel) {
                        location.reload();
                    });
                    $("#renameForm").submit(function () {
                        if ($("#renameInput").val() != "") {
                            chrome.runtime.sendMessage(
                                {
                                    "type": "rename-task",
                                    "taskId": task.srcElement.id,
                                    "newTaskName": $("#renameInput").val()
                                }
                            );
                        }
                    });
                }(task);
            });
            document.getElementsByClassName("delete")[i].addEventListener("click", function (deleteButton) {
                return function (deleteButton) {
                    document.getElementById(deleteButton.srcElement.parentElement.id).style.display = "None";
                    chrome.runtime.sendMessage(
                        {
                            "type": "delete-task",
                            "taskToRemove": deleteButton.srcElement.parentElement.id
                        }
                    );
                }(deleteButton);
            });
        }
    });

    document.getElementById("contacts").addEventListener("click", function () {
        var x = new XMLHttpRequest();
        x.open('GET', 'https://people.googleapis.com/v1/people/me/connections?pageSize=100&requestMask.includeField=person.names&key=AIzaSyAuPajSr17inQQYo4hXnh6DiWCs84fJXpo', true);
        x.setRequestHeader('Authorization', 'Bearer ' + AUTH_TOKEN);
        x.setRequestHeader('GData-Version', '3.0');
        x.onload = function () {
            console.log(x.response);
        };
        x.send();

    });

    document.getElementById('login').addEventListener("click", function () {
        chrome.identity.getAuthToken({
            interactive: true
        }, function (token) {
            // token_var = token;
            if (chrome.runtime.lastError) {
                alert(chrome.runtime.lastError.message);
                return;
            }
            var x = new XMLHttpRequest();
            x.open('GET', 'https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=' + token);
            // x.onload = function () {
            //     alert(x.response);
            // };
            x.send();
            setAuthToken(token);
        });
        logUserIn();
        changeLoginStatusMessage();
    });

    document.getElementById('logout').addEventListener("click", function () {
        revokeToken();
        logUserOut();
        changeLoginStatusMessage();
    });

    document.getElementById('createFolder').addEventListener("click", function () {
        createFolderOnDrive('hello');
    });
    document.getElementById('checkIfFolderExists').addEventListener("click", function () {
        checkIfFileExistsOnDrive('Sailboat');
    });
};


$("#history").click(function () {
    chrome.tabs.create({"url": "html/history.html"});
});

$("#search").click(function () {
    chrome.tabs.create({"url": "html/search.html"});
});

$("#index").click(function () {
    chrome.tabs.create({"url": "html/index.html"});
});

// $("#pauseTasks").click(function(){
//     chrome.runtime.sendMessage({
//         "type": "switch-task",
//         "nextTaskId": "0"
//     });
// });
