(function(orbium) {
	orbium.Tile = function() {
		this.count = null;
		this.xnr = null;
		this.ynr = null;

		this.variant = null;

		this.inducesSink = null;

		this.inducesTopPath = null;
		this.inducesRightPath = null;
		this.inducesBottomPath = null;
		this.inducesLeftPath = null;

		this.hasTopPath = null;
		this.hasRightPath = null;
		this.hasBottomPath = null;
		this.hasLeftPath = null;

		this.construct = function(image1, image2, image3, count, xnr, ynr) {
			this.count = count;
			this.xnr = xnr;
			this.ynr = ynr;

			this.inducesSink = false;

			this.inducesTopPath = false;
			this.inducesRightPath = false;
			this.inducesBottomPath = false;
			this.inducesLeftPath = false;

			this.hasTopPath = false;
			this.hasRightPath = false;
			this.hasBottomPath = false;
			this.hasLeftPath = false;

			var xpos = orbium.Tile.size*this.xnr;
			var ypos = orbium.Tile.size*this.ynr+orbium.Bar.height;

			orbium.Sprite.prototype.construct.call(this, image1, image2, image3,
				xpos, ypos, orbium.Tile.size, orbium.Tile.size, 3);
		}; orbium.Tile.prototype.construct = this.construct;

		this.setBase = function(baseName) {
			if (baseName != undefined) {
				var idx = 0;

				// First row rotators
				if (this.count < orbium.Machine.horizTiles &&
					this instanceof orbium.Rotator) {
					this.hasTopPath = true;
				}

				// Should tile have top path?
				idx = this.count-orbium.Machine.horizTiles;
				if (idx >= 0 &&
					idx < orbium.Machine.horizTiles*orbium.Machine.vertTiles &&
					orbium.machine.tiles[idx].inducesTopPath &&
					this.variant != 1 &&
					orbium.machine.tiles[idx].variant != 1) {
					this.hasTopPath = true;
				}

				// Should tile have right path?
				idx = this.count+1;
				if (idx >= 0 &&
					idx < orbium.Machine.horizTiles*orbium.Machine.vertTiles &&
					(this.count+1)%orbium.Machine.horizTiles != 0 &&
					orbium.machine.tiles[idx].inducesRightPath &&
					this.variant != 0 &&
					orbium.machine.tiles[idx].variant != 0) {
					this.hasRightPath = true;
				}

				// Should tile have bottom path?
				idx = this.count+orbium.Machine.horizTiles;
				if (idx >= 0 &&
					idx < orbium.Machine.horizTiles*orbium.Machine.vertTiles &&
					orbium.machine.tiles[idx].inducesBottomPath &&
					this.variant != 1 &&
					orbium.machine.tiles[idx].variant != 1) {
					this.hasBottomPath = true;
				}

				// Should tile have left path?
				idx = this.count-1;
				if (idx >= 0 &&
					idx < orbium.Machine.horizTiles*orbium.Machine.vertTiles &&
					this.count%orbium.Machine.horizTiles != 0 &&
					orbium.machine.tiles[idx].inducesLeftPath &&
					this.variant != 0 &&
					orbium.machine.tiles[idx].variant != 0) {
					this.hasLeftPath = true;
				}

				var frame = 0;

				if (this.hasTopPath && !this.hasRightPath &&
					!this.hasBottomPath && !this.hasLeftPath) {
					frame = 0;
				} else if (!this.hasTopPath && this.hasRightPath &&
					!this.hasBottomPath && !this.hasLeftPath) {
					frame = 1;
				} else if (!this.hasTopPath && !this.hasRightPath &&
					this.hasBottomPath && !this.hasLeftPath) {
					frame = 2;
				} else if (!this.hasTopPath && !this.hasRightPath &&
					!this.hasBottomPath && this.hasLeftPath) {
					frame = 3;
				} else if (this.hasTopPath && this.hasRightPath &&
					!this.hasBottomPath && !this.hasLeftPath) {
					frame = 4;
				} else if (!this.hasTopPath && this.hasRightPath &&
					this.hasBottomPath && !this.hasLeftPath) {
					frame = 5;
				} else if (!this.hasTopPath && !this.hasRightPath &&
					this.hasBottomPath && this.hasLeftPath) {
					frame = 6;
				} else if (this.hasTopPath && !this.hasRightPath &&
					!this.hasBottomPath && this.hasLeftPath) {
					frame = 7;
				} else if (this.hasTopPath && this.hasRightPath &&
					this.hasBottomPath && !this.hasLeftPath) {
					frame = 8;
				} else if (!this.hasTopPath && this.hasRightPath &&
					this.hasBottomPath && this.hasLeftPath) {
					frame = 9;
				} else if (this.hasTopPath && !this.hasRightPath &&
					this.hasBottomPath && this.hasLeftPath) {
					frame = 10;
				} else if (this.hasTopPath && this.hasRightPath &&
					!this.hasBottomPath && this.hasLeftPath) {
					frame = 11;
				} else if (this.hasTopPath && !this.hasRightPath &&
					this.hasBottomPath && !this.hasLeftPath) {
					frame = 12;
				} else if (!this.hasTopPath && this.hasRightPath &&
					!this.hasBottomPath && this.hasLeftPath) {
					frame = 13;
				} else if (this.hasTopPath && this.hasRightPath &&
					this.hasBottomPath && this.hasLeftPath) {
					frame = 14;
				}

				if (this.broken) {
					frame += 15;
				}

				this.setImage1(baseName+frame);

				this.invalidate();
			}
		}; orbium.Tile.prototype.setBase = this.setBase;

		this.influenceMarble = function(marble) {
			return false; // Default implementation, do nothing
		}; orbium.Tile.prototype.influenceMarble = this.influenceMarble;
	}; orbium.Tile.prototype = new orbium.Sprite();
}(window.orbium = window.orbium || {}));
