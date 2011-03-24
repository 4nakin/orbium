(function(orbium) {
	orbium.Rotator = function(count, xnr, ynr) {
		this.orientation = null;
		this.broken = null;

		var dockees = null;
		var judderc = null;
		var blockc = null;
		var fullc = null;
		var stage = null;

		this.construct = function() {
			this.orientation = 0;
			this.broken = false;

			dockees = [];
			judderc = -1;
			blockc = -1;
			fullc = -1;
			stage = 0;

			orbium.Tile.prototype.construct.call(this, ["rotatile14",
				"rotator0"], count, xnr, ynr);

			this.inducesSink = true;

			this.inducesTopPath = true;
			this.inducesRightPath = true;
			this.inducesBottomPath = true;
			this.inducesLeftPath = true;
		};

		this.destruct = function() {
			for (var i = 0, j = dockees.length; i < j; i++) {
				dockees[i].destruct();
			}
			dockees.length = 0;

			orbium.Tile.prototype.destruct.call(this);
		};

		this.setBase = function() {
			orbium.Tile.prototype.setBase.call(this, "rotatile");
		};

		this.invalidate = function() {
			orbium.Tile.prototype.invalidate.call(this);

			for (var i = 0, j = dockees.length; i < j; i++) {
				dockees[i].invalidate();
			}
		};

		var slotFree = function(pos) {
			for (var i = 0, j = dockees.length; i < j; i++) {
				if (dockees[i].pos === pos) {
					return false;
				}
			}

			return true;
		};

		var pattern = function() {
			var pat = [];

			for (var i = 0, j = dockees.length; i < j; i++) {
				var dockee = dockees[i];

				if (that.orientation === 0) {
					if (dockee.pos === 0) {
						pat[0] = dockee.color;
					} else if (dockee.pos === 1) {
						pat[1] = dockee.color;
					} else if (dockee.pos === 2) {
						pat[2] = dockee.color;
					} else if (dockee.pos === 3) {
						pat[3] = dockee.color;
					}
				} else if (that.orientation === 1) {
					if (dockee.pos === 0) {
						pat[1] = dockee.color;
					} else if (dockee.pos === 1) {
						pat[2] = dockee.color;
					} else if (dockee.pos === 2) {
						pat[3] = dockee.color;
					} else if (dockee.pos === 3) {
						pat[0] = dockee.color;
					}
				} else if (that.orientation === 2) {
					if (dockee.pos === 0) {
						pat[2] = dockee.color;
					} else if (dockee.pos === 1) {
						pat[3] = dockee.color;
					} else if (dockee.pos === 2) {
						pat[0] = dockee.color;
					} else if (dockee.pos === 3) {
						pat[1] = dockee.color;
					}
				} else if (that.orientation === 3) {
					if (dockee.pos === 0) {
						pat[3] = dockee.color;
					} else if (dockee.pos === 1) {
						pat[0] = dockee.color;
					} else if (dockee.pos === 2) {
						pat[1] = dockee.color;
					} else if (dockee.pos === 3) {
						pat[2] = dockee.color;
					}
				}
			}

			return pat;
		};

		var dockMarble = function(dir, color, frame, fresh) {
			if (blockc !== -1) {
				if (!fresh) {
					orbium.player.play("clank");
				}

				return false;
			}

			var pos = 0;
			if (dir === 0 && that.orientation === 0) {
				pos = 2;
			} else if (dir === 0 && that.orientation === 1) {
				pos = 1;
			} else if (dir === 0 && that.orientation === 2) {
				pos = 0;
			} else if (dir === 0 && that.orientation === 3) {
				pos = 3;
			}

			if (dir === 1 && that.orientation === 0) {
				pos = 3;
			} else if (dir === 1 && that.orientation === 1) {
				pos = 2;
			} else if (dir === 1 && that.orientation === 2) {
				pos = 1;
			} else if (dir === 1 && that.orientation === 3) {
				pos = 0;
			}

			if (dir === 2 && that.orientation === 0) {
				pos = 0;
			} else if (dir === 2 && that.orientation === 1) {
				pos = 3;
			} else if (dir === 2 && that.orientation === 2) {
				pos = 2;
			} else if (dir === 2 && that.orientation === 3) {
				pos = 1;
			}

			if (dir === 3 && that.orientation === 0) {
				pos = 1;
			} else if (dir === 3 && that.orientation === 1) {
				pos = 0;
			} else if (dir === 3 && that.orientation === 2) {
				pos = 3;
			} else if (dir === 3 && that.orientation === 3) {
				pos = 2;
			}

			if (!slotFree(pos)) {
				if (!fresh) {
					orbium.player.play("bounce");
				}

				return false;
			}

			var dockee = new orbium.Dockee(that, pos, color, frame);
			orbium.Util.addArrayElement(dockees, dockee);

			if (orbium.player !== undefined) {
				orbium.player.play("dock");
			}

			return true;
		};

		this.triggerRotate = function(xtap, ytap) {
			if (orbium.Util.withinRect(
				xtap,
				ytap,
				this.xpos,
				this.ypos,
				orbium.Tile.size,
				orbium.Tile.size)) {
				this.rotate(true);
			}
		};

		this.rotate = function(send) {
			if (judderc === -1 && fullc === -1) {
				if (orbium.client !== undefined && send) {
					orbium.client.send("R:"+this.count);
				}

				if (orbium.player !== undefined) {
					orbium.player.play("rotate");
				}

				judderc = 0;
				blockc = 0;
			}
		};

		var explode = function() {
			orbium.player.play("explode");

			that.broken = true;
			fullc = 0;
		};

		var countSame = function() {
			var same = 0;

			var sameColor = dockees[0].color;

			for (var i = 0, j = dockees.length; i < j; i++) {
				if (dockees[i].color === sameColor) {
					same++;
				}
			}

			return same;
		};

		this.checkFull = function() {
			var again = false;

			// Only bother to check if not exploding and 4 is docked
			if (fullc === -1 && dockees.length === 4) {
				if (orbium.machine.matcher !== null &&
					orbium.machine.matcher.active()) {
					if (orbium.machine.matcher.matches(pattern())) {
						explode();

						again = true;
					}
				} else {
					if (countSame() === 4) {
						if (orbium.machine.sequencer !== null &&
							orbium.machine.sequencer.active()) {
							var matchColor = dockees[0].color;

							if (orbium.machine.sequencer.matches(matchColor)) {
								orbium.machine.sequencer.advance();

								explode();

								again = true;
							}
						} else {
							explode();

							again = true;
						}
					}
				}
			}

			return again;
		};

		this.triggerLaunchPosition = function(xtap, ytap) {
			var launched = false;

			for (var i = 0, j = dockees.length; i < j; i++) {
				var dockee = dockees[i];

				if (dockee !== undefined && dockee.withinTrigger(xtap, ytap)) {
					launched = launchPosition(dockee.pos);
				}
			}

			return launched;
		}

		this.triggerLaunchDirection = function(xtap, ytap, dir) {
			if (orbium.Util.withinRect(
				xtap,
				ytap,
				this.xpos,
				this.ypos,
				orbium.Tile.size,
				orbium.Tile.size)) {
				return launchDirection(dir);
			}

			return false;
		}

		var launchPosition = function(pos) {
			var dir = pos + that.orientation;
			if (dir === 4) {
				dir = 0;
			} else if (dir === 5) {
				dir = 1
			} else if (dir === 6) {
				dir = 2;
			}

			return launchDirection(dir);
		};

		var launchDirection = function(dir) {
			if (judderc !== -1) {
				return false;
			}

			var proceed = false;

			if (dir === 0 && that.hasTopPath &&
				that.count >= orbium.Machine.horizTiles) {
				proceed = true;
			}

			if (dir === 1 && that.hasRightPath) {
				proceed = true;
			}

			if (dir === 2 && that.hasBottomPath) {
				proceed = true;
			}

			if (dir === 3 && that.hasLeftPath) {
				proceed = true;
			}

			// We cant launch
			if (!proceed) {
				return false;
			}

			var pos = -1;

			if (that.orientation === 0) {
				if (dir === 0) {
					pos = 0;
				} else if (dir === 1) {
					pos = 1;
				} else if (dir === 2) {
					pos = 2;
				} else if (dir === 3) {
					pos = 3;
				}
			}

			if (that.orientation === 3) {
				if (dir === 0) {
					pos = 1;
				} else if (dir === 1) {
					pos = 2;
				} else if (dir === 2) {
					pos = 3;
				} else if (dir === 3) {
					pos = 0;
				}
			}

			if (that.orientation === 2) {
				if (dir === 0) {
					pos = 2;
				} else if (dir === 1) {
					pos = 3;
				} else if (dir === 2) {
					pos = 0;
				} else if (dir === 3) {
					pos = 1;
				}
			}

			if (that.orientation === 1) {
				if (dir === 0) {
					pos = 3;
				} else if (dir === 1) {
					pos = 0;
				} else if (dir === 2) {
					pos = 1;
				} else if (dir === 3) {
					pos = 2;
				}
			}

			// Find dockee at pos
			var dockee = null;
			for (var i = 0, j = dockees.length; i < j; i++) {
				if (dockees[i].pos === pos) {
					dockee = dockees[i];
				}
			}

			// No dockee to launch
			if (dockee === null) {
				return false;
			}

			if (orbium.machine.counter.isLaunchAllowed()) {
				dockee.destruct();
				orbium.Util.removeArrayElement(dockees, dockee);

				var marble = new orbium.Marble(
					dockee.xpos,
					dockee.ypos,
					dockee.color,
					dockee.frame,
					dir,
					false);

				orbium.Util.addArrayElement(orbium.machine.marbles, marble);
			}

			orbium.machine.counter.countActiveMarbles();

			return true;
		};

		this.influence = function(marble) {
			if (marble.fresh) {
				if (marble.lastDockTry !== this &&
					orbium.Util.withinRect(
					marble.xpos+orbium.Marble.size/2,
					marble.ypos+orbium.Marble.size/2,
					this.xpos+orbium.Tile.size/2-orbium.Marble.size/4,
					this.ypos-orbium.Bar.height,
					orbium.Marble.size/2,
					orbium.Bar.height)) {
					var falldown = dockMarble(2, marble.color,
						marble.frame, true);

					if (falldown) {
						marble.fresh = false;
						marble.stale = true;
						this.invalidate();

						orbium.machine.checkRotatorsFull();

						orbium.machine.lane.resetTimer();
						orbium.machine.lane.injectMarble();
					} else {
						marble.lastDockTry = this;
					}
				}
			} else {
				var within = false;

				if (marble.direction === 0) {
					if (orbium.Util.withinRect(
						marble.xpos+orbium.Marble.size/2,
						marble.ypos,
						this.xpos+orbium.Tile.size/2-orbium.Marble.size/2,
						this.ypos+orbium.Tile.size-orbium.Marble.size-orbium.Marble.size/6,
						orbium.Marble.size,
						orbium.Marble.size)) {
							within = true;
					}
				} else if (marble.direction === 1) {
					if (orbium.Util.withinRect(
						marble.xpos+orbium.Marble.size,
						marble.ypos+orbium.Marble.size/2,
						this.xpos+orbium.Marble.size/6,
						this.ypos+orbium.Tile.size/2-orbium.Marble.size/2,
						orbium.Marble.size,
						orbium.Marble.size)) {
							within = true;
					}
				} else if (marble.direction === 2) {
					if (orbium.Util.withinRect(
						marble.xpos+orbium.Marble.size/2,
						marble.ypos+orbium.Marble.size,
						this.xpos+orbium.Tile.size/2-orbium.Marble.size/2,
						this.ypos+orbium.Marble.size/6,
						orbium.Marble.size,
						orbium.Marble.size)) {
							within = true;
					}
				} else if (marble.direction === 3) {
					if (orbium.Util.withinRect(
						marble.xpos,
						marble.ypos+orbium.Marble.size/2,
						this.xpos+orbium.Tile.size-orbium.Marble.size-orbium.Marble.size/6,
						this.ypos+orbium.Tile.size/2-orbium.Marble.size/2,
						orbium.Marble.size,
						orbium.Marble.size)) {
							within = true;
					}
				}

				// Check if marble should dock or bounce
				if (within) {
					var success = dockMarble(marble.direction,	marble.color,
						marble.frame, false);

					if (success) {
						marble.stale = true;

						// If direction is left we need to invalidate
						// tile rightof this rotator
						if (marble.direction === 3) {
							var idx = this.count+1;
							if (orbium.machine.tiles[idx] !== undefined) {
								orbium.machine.tiles[idx].invalidate();
							}
						}

						// If direction is up we need to invalidate
						// tile below this rotator
						if (marble.direction === 0) {
							var idz = this.count+orbium.Machine.horizTiles;
							if (orbium.machine.tiles[idz] !== undefined) {
								orbium.machine.tiles[idz].invalidate();
							}
						}

						orbium.machine.checkRotatorsFull();
					} else {
						marble.bounce();
					}
				}
			}
		};

		this.getStateString = function() {
			var state = "R:"+this.count+":"+this.orientation;

			if (dockees.length > 0) {
				state += ":";
			}

			for (var i = 0, j = dockees.length; i < j; i++) {
				state += dockees[i].getStateString();
			}
			
			state += ";";

			return state;
		}

		this.update = function(dt) {
			var frame = 0;
			var offset = 0;

			if (judderc !== -1 || fullc !== -1) {
				if (this.orientation === 0) {
					offset = 0;
				} else if (this.orientation === 3) {
					offset = 4;
				} else if (this.orientation === 2) {
					offset = 8;
				} else if (this.orientation === 1) {
					offset = 12;
				}
			}

			if (judderc === 0 && stage === 0) {
				frame = offset+stage+1;
				if (this.broken) {
					frame += 16;
				}
				this.setImage(1, "rotator"+frame);

				stage = 1;

				for (var i = 0, j = dockees.length; i < j; i++) {
					dockees[i].judder(0);
				}
				this.invalidate();
			}

			if (judderc > 2 && stage === 1) {
				frame = offset+stage+1;
				if (this.broken) {
					frame += 16;
				}
				this.setImage(1, "rotator"+frame);

				stage = 2;

				for (i = 0, j = dockees.length; i < j; i++) {
					dockees[i].judder(1);
				}
				this.invalidate();
			}

			if (judderc > 4 && stage === 2) {
				frame = offset+stage+1;
				if (this.broken) {
					frame += 16;
				}
				this.setImage(1, "rotator"+frame);

				stage = 3;

				for (i = 0, j = dockees.length; i < j; i++) {
					dockees[i].judder(2);
				}
				this.invalidate();
			}

			if (judderc > 6 && stage === 3) {
				frame = offset+stage+1;
				if (frame === 16) {
					frame = 0;
				}
				if (this.broken) {
					frame += 16;
				}
				this.setImage(1, "rotator"+frame);

				stage = 0;

				if (this.orientation > 0) {
					this.orientation--;
				} else {
					this.orientation = 3;
				}

				for (i = 0, j = dockees.length; i < j; i++) {
					dockees[i].place();
				}

				// If matcher is present check for full tiles on rotate
				if (orbium.machine.matcher !== null) {
					orbium.machine.checkRotatorsFull();
				}

				judderc = -1;
				this.invalidate();
			}

			if (blockc > 12) {
				blockc = -1;
			}

			if (fullc > 2 && stage === 0) {
				for (i = 0, j = dockees.length; i < j; i++) {
					dockees[i].destruct();
				}
				dockees.length = 0;
				this.setImage(2, "explosion0");
				stage = 1;
				this.invalidate();
			} else if (fullc > 4 && stage === 1) {
				this.setImage(2, "explosion1");
				stage = 2;
				this.invalidate();
			} else if (fullc > 6 && stage === 2) {
				this.setImage(2, "explosion2");
				stage = 3;
				this.invalidate();
			} else if (fullc > 8 && stage === 3) {
				this.setImage(2, "explosion3");
				stage = 4;
				this.invalidate();
			} else if (fullc > 10 && stage === 4) {
				fullc = -1;
				this.setBase("rotatile");
				frame = offset+16;
				this.setImage(1, "rotator"+frame);
				this.setImage(2, null);

				stage = 0;
				this.invalidate();

				orbium.machine.checkLevelComplete();
			}

			if (judderc !== -1) {
				judderc += orbium.Rotator.speed*dt;
			}

			if (blockc !== -1) {
				blockc += orbium.Rotator.speed*dt;
			}

			if (fullc !== -1) {
				fullc += orbium.Rotator.speed*dt;
			}
		};

		this.draw = function(idx) {
			if (idx === 0) {
				orbium.Tile.prototype.draw.call(this, 0);
			} else if (idx === 1) {
				orbium.Tile.prototype.draw.call(this, 1);
			} else if (idx === 2) {
				for (var i = 0, j = dockees.length; i < j; i++) {
					dockees[i].draw(0);
				}

				orbium.Tile.prototype.draw.call(this, 2);
			}
		};

		var that = this; this.construct.apply(this, arguments);
	}; orbium.Rotator.prototype = new orbium.Tile();
}(typeof window != "undefined" ? window.orbium = window.orbium || {} : orbium));
