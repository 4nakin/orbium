(function(orbium) {
	orbium.Announcer = function(count, xnr, ynr) {
		this.construct = function() {
			orbium.Tile.prototype.construct.call(this, "announcer0", null, null,
				count, xnr, ynr);
		};

		this.announceNextColor = function(nextColor) {
			this.setImage(0, "announcer"+nextColor);
			this.invalidate(false);
		};

		this.construct.apply(this, arguments);
	}; orbium.Announcer.prototype = new orbium.Tile();
}(window.orbium = window.orbium || {}));
