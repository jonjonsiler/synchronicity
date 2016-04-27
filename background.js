document.addEventListener('DOMContentLoaded', function () {
    Synchronicity.init();
    chrome.runtime.onMessage.addListener(function(h, sender, respond){
        if(typeof(h.handler) != "undefined" && (h.handler == "timer" || h.handler== "tracker")){
            var response = Synchronicity[h.handler][h.event](h.time); 
            respond(response);
        } else console.log(h); 
    });
});