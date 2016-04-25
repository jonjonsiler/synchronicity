var Trackers = {
    "f723bf766822": {
        "title":"Tracker 1",
        "time": 0
    },
    "c6800efd7a02": {
        "title":"Tracker 2",
        "time": 16
    },
    "9016d78acc5b": {
        "title": "tracker #3",
        time: 0,
    }
    
    
};


var Synchronicity = {};

Synchronicity.init = function(){
console.log("Synchronicity Loaded!");
    //this.bindActions();
};

Synchronicity.tracker = {
    getTrackers: function(){
        return Trackers;
    },
    
    getTracker: function(id){
     return Trackers[id];
    },

    addTracker: function(id, data){
        Trackers[id] = data;
    }
};

/**
 * Method to generate a random has to accociate to trackers
 */
Synchronicity.hash = function(){
    return (Math.random().toString(16).substr(2, 12));
};

Synchronicity.timer = {
    time: 0, // in seconds
    start: function(t){
        this.time = parseInt(t);
        this.interval = setInterval((function(){
            ++this.time;
        }).bind(this), 1000);
        //console.log(this.interval);
        console.log("Timer Started: "+this.time);
        return null;
    },
    stop: function(){
        if(typeof(this.interval) !== 'undefined') clearInterval(this.interval);
        console.log("Timer Stopped: "+this.time);
        return {"time":this.time};
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