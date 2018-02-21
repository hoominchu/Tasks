function revokeToken() {

    chrome.identity.getAuthToken({ 'interactive': false },
        function(current_token) {
            if (!chrome.runtime.lastError) {

                // @corecode_begin removeAndRevokeAuthToken
                // @corecode_begin removeCachedAuthToken
                // Remove the local cached token
                chrome.identity.removeCachedAuthToken({ token: current_token },
                    function() {});
                // @corecode_end removeCachedAuthToken

                // Make a request to revoke token in the server
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
                    current_token);
                xhr.send();
                // @corecode_end removeAndRevokeAuthToken

                // Update the user interface accordingly

                $('#revoke').get(0).disabled = true;
                console.log('Token revoked and removed from cache. '+
                    'Check chrome://identity-internals to confirm.');
            }
        });
}

document.getElementById('login').addEventListener("click", function () {
    chrome.identity.getAuthToken({
        interactive: true
    }, function (token) {
        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            return;
        }
        var x = new XMLHttpRequest();
        x.open('GET', 'https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=' + token);
        x.onload = function () {
            alert(x.response);
        };
        x.send();
    });
});

document.getElementById('logout').addEventListener("click", function () {
    revokeToken();
});
