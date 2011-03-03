(function(orbium) {
	orbium.Client = function(url) {
		var socket = null;

		this.construct = function() {
			console.log("trying to connect.");
			socket = new WebSocket(url);
			socket.onopen = this.opened;
			socket.onmessage = this.received;
		};

		this.opened = function() {
			console.log("connection established.");
		};

		this.send = function(msg) {
		    socket.send(msg);
		};

		this.received = function(msg) {
			console.log("received: "+msg.data);
		};

		var that = this; this.construct.apply(this, arguments);
	};
}(typeof window != "undefined" ? window.orbium = window.orbium || {} : orbium));
