var Synchronicity = {};

/**
 * Some samples of what the data would look like that we're storing.
 */
Synchronicity.trackers = {
    "f723bf766822": {
        "title":"Tracker 1",
        "time": 0
    },
    "c6800efd7a02": {
        "title":"Tracker 2",
        "time": 2300
    },
    "9016d78acc5b": {
        "title": "tracker #3",
        "time": 4865,
    }
};


/**
 * Initialize the object
 *
 * Setup the object to allow working with the handlers passed 
 * to the background page and manilpulate the trackers 
 * associated with the app.
 */
Synchronicity.init = function(){
    console.log("Synchronicity Loaded!");
    
    //Load trackers from localStorage to prime the object for use
};


/**
 * Worker object for handling the trackers in memory
 */
Synchronicity.tracker = {

    /**
     * Get all Trackers
     * Return all trackers from memory
     */
    all: function(){
        var response = (!Synchronicity.trackers || Synchronicity.trackers.length == 0)
        ?{
            "status": "error",
            "message": "No Trackers are set."
        } 
        : {
            "status": "success",
            "data": Synchronicity.trackers
        };
        return response;
    },
    
    /**
     * Get Tracker
     * Get a specific tracker by id
     */
    get: function(id){
        var response = {};
        if (!Synchronicity.hasOwnProperty(data.id)) {
            response = {
                "status": "error", 
                "message": "Tracker does not exist!"
            };
        } else {
            response.status = "success";
            response.data = {};
            response.data[data.id] = Synchronicity.trackers[id];
        }
        return response;
    },

    /**
     * Add Tracker
     * Create a new tracker and add it to memory
     */
    add: function(){
        var response = {
                "status": "success",
                "data": {}
            },
            id = Synchronicity.hash();
        Synchronicity.trackers[id] = {"title":"Add Title", "time":0};
        response.data[id] = Synchronicity.trackers[id]
        return response;
    },

    /**
     * Update Tracker
     * Add new data to the tracker in memory
     */
    update: function(data){        
        var response = {};
        if(!Synchronicity.hasOwnProperty(data.id)){
            response = {
                "status": "error", 
                "message": "Tracker does not exist!"
            };
        }
        //console.log(data);
        if(data.title) Synchronicity.trackers[data.id].title = data.title;
        if(data.time) Synchronicity.trackers[data.id].time = data.time
        response.status = "success";
        response.data = {};
        response.data[data.id] = Synchronicity.trackers[data.id];
        return response; 
    }
};

/**
 * Method to generate a random has to accociate to trackers
 */
Synchronicity.hash = function(){
    return (Math.random().toString(16).substr(2, 12));
};

Synchronicity.timer = {
    active: false,
    activeId: null,
    time: 0, // in seconds
    start: function(data){
        var t = !data.time?0:data.time,
            id = !data.id?0:data.id;

        // Stop any active trackers and record the time
        if(this.active) this.stop();

        // If time is not sent in the request, use the tracker's "current" time
        this.time = (!data.time)?Synchronicity.trackers[id].time:parseInt(data.time); // Prime the time
        this.active = true; // Set timer to active
        this.activeId = id; //Set the active id of the active tracker
        
        // Set an internal interval to increment the time every second.
        this.interval = setInterval((function(){
            ++this.time;
        }).bind(this), 1000);
        //console.log(this.interval);
        console.log("Timer Started: "+this.time);
        return null;
    },
    stop: function(){
        if(this.interval) {
            clearInterval(this.interval); // Reset Interval
            Synchronicity.trackers[this.activeId].time = this.time; // Save time
        }
        this.active = false;
        this.activeId = null;
        console.log("Timer Stopped: "+this.time);
        return {"time":this.time};
    },
    status: function(){
        console.log('status requested');
        return {
            "active":     this.active,
            "activeId":   this.activeId,
            "time":       this.time
        };
    }
};

Synchronicity.getContentData = function(url){
    console.log("(XHR)");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          var body = xhr.responseText;
          console.log(body);
        }
    };
    xhr.send();
};