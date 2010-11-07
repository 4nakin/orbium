(function(orbium) {
	orbium.Inspector = function(count, xnr, ynr, vari, col) {
		var color = null;

		this.construct = function() {
			this.variant = vari;
			color = col;

			orbium.Tile.prototype.construct.call(this, ["modtile0", null,
				"inspector"+color], count, xnr, ynr);

			this.inducesTopPath = true;
			this.inducesRightPath = true;
			this.inducesBottomPath = true;
			this.inducesLeftPath = true;
		};

		this.setBase = function() {
			orbium.Tile.prototype.setBase.call(this, "modtile");
		};

		this.influence = function(marble) {
			if (marble.color !== color &&
				orbium.Util.withinRect(
				marble.xpos+orbium.Marble.size/2,
				marble.ypos+orbium.Marble.size/2,
				this.xpos+orbium.Tile.size/2-orbium.Marble.size/2,
				this.ypos+orbium.Tile.size/2-orbium.Marble.size/2,
				orbium.Marble.size,
				orbium.Marble.size)) {
				marble.bounce();
			}
		};

		this.construct.apply(this, arguments);
	}; orbium.Inspector.prototype = new orbium.Tile();
}(window.orbium = window.orbium || {}));
