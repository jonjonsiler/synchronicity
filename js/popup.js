var Tracker = {};

/**
 * Intitialize the tracker
 */
Tracker.init = function(){
    this.getTrackers();
    this.bindActions();
    console.log("Tracker Loaded!");
};

/**
 * An interaction layer to get and set times from the background page
 */
Tracker.timer = {
    start: function(t){
        //send the new time to prime the timer
        this.messenger({handler:"timer", event:"start", time:t});
        //start the remote timer
    },
    stop: function(){
        //stop the remote timer
        return this.messenger({handler:"timer", event:"stop"});
        //get the time from the timer
    },
    messenger: function(h){
        chrome.runtime.sendMessage(h, function(response){
            //if data is returned in the response return it to the caller
            return response;
        });    
    },
    format: function(t){
        var time = (typeof(t) != "undefined") ? t : this.time,
            formatedTime = "";
        if(parseInt( time / 3600 ) % 24 < 0){
            formatedTime += parseInt( time / 3600 ) % 24 + ":";
        }
        if (parseInt( time / 60 ) % 60) {
            formatedTime += parseInt( time / 60 ) % 60 + ":";
        }
        formatedTime += Math.round(time % 60);
        return formatedTime;
    }
};

Tracker.getTrackers = function(){
    var self = this;
    chrome.runtime.sendMessage({handler:"tracker", event:"getTrackers"}, function(response){
            //if data is returned in the response return it to the caller
//        console.log(response);    
        for (var key in response){
                if (!response.hasOwnProperty(key)) continue;
                self.create(key,response[key]);
            }
    });    
};


/**
 * Create the trackers to be displayed - pulled from background page
 */
Tracker.create = function(id, el){
    var self = this;
    $("<li/>").addClass("tracker").data("tracker-id", id)
        .append($("<div/>").addClass("title").html(el.title))
        .append($("<div/>").addClass("time").data("time", el.time).html(self.timer.format(el.time)))
        .append($("<a/>").addClass("action start").html('<i class="icon icon-start">&nbsp;</i>Start'))
        .appendTo("#trackers");
};

/**
 * Bind the actions on the tracker view (popup)
 */
Tracker.bindActions = function(){
    var self = this;
    $("#trackers").on('click', ".action", function(e,a){
        console.log("Action Clicked!");
        a = $(this);

        //Stop current timer
        time = self.timer.stop();

        //Save current time from timer - if running
        $(".pause").prev().data("time", time);
        if(a.hasClass("pause")) {
            a.removeClass("pause").addClass("start");            
        }
        
        //Check action to determine behavior
        if(a.hasClass("start")) {
            // Set active timer
            
            // Update the UI
            a.removeClass("start").addClass("pause");

            //Move triggered tracker to top of list
            var t = a.parents(".tracker").detach().prependTo("#trackers");
        
            //Start timer/Load new trackers time
            self.timer.start(a.prev().data("time"));
        }
    });
};


(function(){
    Tracker.init();
})();