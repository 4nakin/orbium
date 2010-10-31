(function(orbium) {
	orbium.Teleporter = function(count, xnr, ynr, vari) {
		this.construct = function() {
			this.variant = vari;

			orbium.Tile.prototype.construct.call(this, "modtile0", null, "teleporter"+this.variant, count, xnr, ynr);

			this.inducesTopPath = true;
			this.inducesRightPath = true;
			this.inducesBottomPath = true;
			this.inducesLeftPath = true;
		};

		this.setBase = function() {
			orbium.Tile.prototype.setBase.call(this, "modtile");
		};

		this.influenceMarble = function(marble) {
			var teleport = false;

			if (marble.lastTeleportDest !== this &&
				orbium.Util.withinRect(
					marble.xpos+orbium.Marble.size/2,
					marble.ypos+orbium.Marble.size/2,
					this.xpos+orbium.Tile.size/2-orbium.Marble.size/2,
					this.ypos+orbium.Tile.size/2-orbium.Marble.size/2,
					orbium.Marble.size,
					orbium.Marble.size)) {
				teleport = true;
			}

			if (teleport) {
				var dest = null;

				for (var i = 0, j = orbium.machine.tiles.length; i < j; i++) {
					var tile = orbium.machine.tiles[i];

					var type = null;
					if (marble.direction === 0 || marble.direction === 2) {
						type = 0;
					} else if (marble.direction === 1 || marble.direction === 3) {
						type = 1;
					}

					if (tile instanceof orbium.Teleporter && tile !== this &&
						(tile.variant === type || tile.variant === 2)) {
						dest = tile;
					}
				}

				marble.lastTeleportDest = dest;

				marble.xpos = dest.xpos+orbium.Tile.size/2-orbium.Marble.size/2;
				marble.ypos = dest.ypos+orbium.Tile.size/2-orbium.Marble.size/2;
				dest.invalidate(false);
			}
		};

		this.construct.apply(this, arguments);
	}; orbium.Teleporter.prototype = new orbium.Tile();
}(window.orbium = window.orbium || {}));
