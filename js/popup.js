// Extend String to support zero padded numbers
String.prototype.pad = function (l, z, n) {
    z = z || '0';
    n = this + '';
    l = l || 2;
    return n.length >= l ? n : new Array(l - n.length + 1).join(z) + n;
};

var Tracker = {};

/**
 * Intitialize the tracker
 */
Tracker.init = function() {
    this.getTrackers();
    this.bindActions();
    this.updateStatus();
    console.log("Tracker Loaded!");
};

/**
 * An interaction layer to get and set times from the background page
 */
Tracker.timer = {
    start: function(time, id) {
        time = (!time)?0:parseInt(time);
        //send the new time to prime the timer
        this.messenger({
            "handler": "timer", 
            "event": "start", 
            "data": {
                "id": id,
                //"time": time
            }
        });
        //start the remote timer
    },
    stop: function() {
        //stop the remote timer
        return this.messenger({
            handler: "timer", 
            event: "stop"
        });
        //get the time from the timer
    },
    messenger: function(h) {
        chrome.runtime.sendMessage(h, function(response){
            //if data is returned in the response return it to the caller
            return response;
        });    
    },
    format: function(time) {
        var time = (!time) ? 0 : parseInt(time),
            formatedTime = "",
            minutes = ((parseInt( time / 60 ) % 60) ? (parseInt( time / 60 ) % 60) : 0);
        
        if(parseInt( time / 3600 ) % 24 > 0){
            formatedTime += parseInt( time / 3600 ) % 24 + ":"; //Hours
            minutes = minutes.toString().pad(2); // Minutes - zero padded
        }
        formatedTime += minutes /* + ":" */; // Minutes
    //    formatedTime += Math.round(time % 60).toString().pad(2); // Seconds
        return formatedTime;
    },
    parse: function(timeString, time, parsedValue) {
        timeString = timeString || "";
        
		if ( timeString !== '') {    
            if ( timeString.indexOf(':') !== -1 ) {
                //Convert from h:m to seconds
                time = timeString.split(':', 3);
                time[0] = time[0] || 0;
                time[1] = time[1] || 0;
                time[2] = time[2] || 0;
                parsedValue = ( parseInt(time[0]) * 3600 ) + ( parseInt(time[1]) * 60 ) + time[2];
            } else if ( timeString.indexOf('.') !== -1 ) {
                // Convert from decimal to seconds
                parsedValue = parseInt( parseFloat(timeString) * 3600 );
            } else {
                // Unexpected content or seconds only
                parsedValue = (parseInt(timeString) == timeString)?parseInt(timeString):0;
            }
        }
        return parsedValue;
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
    var self = this;  // Track object self reference
    chrome.runtime.sendMessage({handler:"tracker", event:"all"}, function(response) {

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

Tracker.getStatus = function() {
    var self = this;  // Track object self reference
    chrome.runtime.sendMessage({handler:"timer", event:"status"}, function(response) {
        // console.log(response);
        return ((!response.active)?false:response);
    });        
};

Tracker.updateStatus = function() {
    //var status = this.getStatus();
    chrome.runtime.sendMessage({handler:"timer", event:"status"}, function(response) {
        // console.log(response);
        if(response.active && response.activeId){
            var trackerElement = $("#tracker-"+response.activeId);
            trackerElement.children('.time').data("time", response.time).html(Tracker.timer.format(response.time));
            trackerElement.children('.action').removeClass("start").addClass('pause');
            trackerElement.detach().prependTo("#trackers");
        }
        return ((!response.active)?false:response);
    });      
   
};


Tracker.addTracker = function() {
    var self = this;  // Track object self reference
    // Create the tracker remotely
    chrome.runtime.sendMessage({handler:"tracker", event:"add"}, function(response) {

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

Tracker.updateTracker = function(data) {
    // Create the tracker remotely
    chrome.runtime.sendMessage({handler:"tracker", event:"update", "data":data }, function(response) {
        //Handle the response to determine if there was an error.
        if(response.status == "success"){
            return true;
        } else self.throwError(response.messsge); // Throw an error message to UI
    });    
};

/**
 * Create the trackers to be displayed
 */
Tracker.create = function(id, el) {
    var self = this;  // Track object self reference
    $("<li/>").addClass("tracker").attr("id","tracker-"+id).data("tracker-id", id) // Stored as trackerId since jQuery 1.6 
        .append($("<div/>").addClass("title").html(el.title)) // Add a title
        .append($("<div/>").addClass("time").data("time", el.time).html(self.timer.format(el.time))) // Add the time element and data
        .append($("<a/>").addClass("action start").html('<i class="icon icon-start">&nbsp;</i>Start')) // Add the actions
        .appendTo("#trackers"); // Add to the list of trackers
};

/**
 * Bind the actions on the tracker view (popup)
 */
Tracker.bindActions = function() {
    var self = this;  // Track object self reference
    $("#trackers")  // Bind live to the trackers element as it is created dynamically

    // Bind to action buttons (play/pause)
        .on('click', ".action", function(e,a,t) {
            console.log("Action Clicked!");
            e.preventDefault();
            a = $(this);

            //if there was an active tracker get the new time
        
            //Update the UI with the active tracker info
            $(".pause").prev().data("time", t);
            if(a.hasClass("pause")) {
                a.removeClass("pause").addClass("start"); 
                self.timer.stop();
            } else if (a.hasClass("start")) {
                // Set active timer

                // Update the UI
                a.removeClass("start").addClass("pause");

                //Move triggered tracker to top of list
                a.parents(".tracker").detach().prependTo("#trackers");

                //Start timer/Load new trackers time
                self.timer.start(a.prev().data("time"), a.closest('li').data("trackerId"));
            }
        })

    // Bind to title click events - to change and update the titles of trackers
        .on("click", ".title", function(e,t) {
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
        })
    
    // Bind to time edit events - to change and update the time in the tracker
        .on("click", ".time", function(e,t,time) {
            t = $(this);
            t.hide();
        
            // We should see what the background page says first instead of using the page value.
            time = self.timer.format(t.data('time')); // convert to decimal notation?
            $('<input/>').attr({"type":"text", "value":time}).insertAfter(t).focus().bind('blur', function(e,g) {
                // Parse the input value
                g = self.timer.parse($(this).val()); //turn the value into seconds
                t.html(self.timer.format(g)).show(); //
                $(this).remove();
                
                //Send the updated title to background page
                self.updateTracker({
                    "id": t.parent().data("trackerId"), 
                    "time": g
                });
            });
        });

    // Bind an event to add a new tracker
      $(".btn-add")
          .on("click", function(e,a) {
                e.preventDefault();
                self.addTracker();
            });
};


(function(){
    Tracker.init();
})();





