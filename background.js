document.addEventListener('DOMContentLoaded', function () {
    Synchronicity.init();
    chrome.runtime.onMessage.addListener(function(h, sender, respond){
        if(typeof(h.handler) != "undefined"){
            if (h.handler == "timer" || h.handler== "tracker"){
                var data = ((typeof(h.time)!="undefined")?h.time:h.data),
                    response = Synchronicity[h.handler][h.event](data); 
                respond(response);
            }
        } else console.log(h); 
    });
});