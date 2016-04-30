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
    start: function(time, id){
        time = (!time)?0:parseInt(time);
        //send the new time to prime the timer
        this.messenger({
            "handler": "timer", 
            "event": "start", 
            "data": {
                "id": id,
                "time": time
            }
        });
        //start the remote timer
    },
    stop: function(){
        //stop the remote timer
        return this.messenger({
            handler: "timer", 
            event: "stop"
        });
        //get the time from the timer
    },
    messenger: function(h){
        chrome.runtime.sendMessage(h, function(response){
            //if data is returned in the response return it to the caller
            return response;
        });    
    },
    format: function(time){
        var time = (!time) ? this.time : parseInt(time),
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

/**
 * Throw an error message to the user interface.
 */
Tracker.throwError = function(message){
    console.log("Error" + message);
};

/**
 * Request Trackers from background page
 */
Tracker.getTrackers = function(){
    var self = this;
    chrome.runtime.sendMessage({handler:"tracker", event:"all"}, function(response){

        //Handle the response to determine if there was an error. 
        if(response.status == "success"){
 
            //if data is returned in the response build the user interface
            for (var key in response.data){
                if (!response.data.hasOwnProperty(key)) continue;

                // Build the UI for the tracker
                self.create(key,response.data[key]);
            };
        } else self.throwError(response.messsge); // Throw an error message to UI
    });    
};

Tracker.updateTracker = function(data){
    var self = this;
    // Create the tracker remotely
    chrome.runtime.sendMessage({handler:"tracker", event:"update", "data":data }, function(response){
        //Handle the response to determine if there was an error.
        if(response.status == "success"){
            return true;
        } else self.throwError(response.messsge); // Throw an error message to UI
    });    
};

Tracker.addTracker = function(){
    var self = this;
    // Create the tracker remotely
    chrome.runtime.sendMessage({handler:"tracker", event:"add"}, function(response){

        //Handle the response to determine if there was an error.
        if(response.status == "success"){

            //if data is returned in the response return it to the caller   
            for (var key in response.data){
                if (!response.data.hasOwnProperty(key)) continue;

                // Build the UI for the tracker
                self.create(key,response.data[key]);
            }
        } else self.throwError(response.messsge); // Throw an error message to UI
    });    
};

/**
 * Create the trackers to be displayed
 */
Tracker.create = function(id, el){
    var self = this;
    $("<li/>").addClass("tracker").data("tracker-id", id) // stored as trackerId since jQuery 1.6 
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
    $("#trackers")
        // Bind to action buttons
        .on('click', ".action", function(e,a,t){
            console.log("Action Clicked!");
            e.preventDefault();
            a = $(this);

            //Stop current timer - Get seconds
            t = self.timer.stop();

            //Save current time from timer - if running
            $(".pause").prev().data("time", t);
            if(a.hasClass("pause")) {
                a.removeClass("pause").addClass("start");            
            }

            //Check action to determine behavior
            if(a.hasClass("start")) {
                // Set active timer

                // Update the UI
                a.removeClass("start").addClass("pause");

                //Move triggered tracker to top of list
                a.parents(".tracker").detach().prependTo("#trackers");

                //Start timer/Load new trackers time
                self.timer.start(a.prev().data("time"));
            }
        }).on("click", ".title", function(e,t){
            t = $(this);
            t.hide();
            $('<input/>').attr({"type":"text", "value":t.html()}).insertAfter(t).focus().bind('blur', function(){
                t.html($(this).val()).show();
                $(this).remove();
                
                //Send the updated title to background page
                self.updateTracker({
                    "id": t.parent().data("trackerId"), 
                    "title": t.html()
                });
            });
        });
      $(".btn-add")
          .on("click", function(e,a){
                e.preventDefault();
                self.addTracker();
            });
};


(function(){
    Tracker.init();
})();