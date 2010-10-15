(function(orbium) {
	orbium.Machine = function() {
		this.lane = null;
		this.tiles = null;
		this.marbles = null;
		this.last = null;
		this.loaded = null;
		this.levnr = null;

		this.xorg = null;
		this.yorg = null;

		this.counter = null;
		this.clock = null;
		this.announcer = null;
		this.matcher = null;
		this.sequencer = null;

		this.paused = null;
		this.first = null;

		this.nextColor = null;

		this.construct = function() {
			this.tiles = [];

			this.marbles = [];
			this.last = new Date().getTime();
			this.loaded = false;
			this.levnr = -1;

			this.xorg = null;
			this.yorg = null;

			this.paused = true;
			this.first = true;

			// Read the level we played last
			this.levnr = orbium.storage.readValue("lastlevel");
			if (this.levnr != null) {
				this.levnr = parseInt(this.levnr);
			}

			// If not set start at level -1, else decr level with one
			if (this.levnr == null) {
				this.levnr = -1;
			} else if (this.levnr > orbium.level.length-1) {
				this.levnr = -1;
			} else {
				this.levnr--;
			}
		};

		this.prevLevel = function() {
			if (this.levnr > 0) {
				this.levnr -= 2;
				this.nextLevel();
			}
		};

		this.nextLevel = function() {
			if (this.levnr < orbium.level.length-1) {
				this.levnr++;

				if (this.lane != null) {
					this.lane.destruct();
				}

				for (var j=0; j<this.tiles.length; j++) {
					this.tiles[j].destruct();
				}
				this.tiles.length = 0;

				for (var k=0; k<this.marbles.length; k++) {
					this.marbles[k].destruct();
				}
				this.marbles.length = 0;

				// Set special tiles to null
				this.counter = null;
				this.clock = null;
				this.announcer = null;
				this.matcher = null;
				this.sequencer = null;

				// Add tiles
				var count=0;
				for (var ynr=0; ynr<orbium.Machine.vertTiles; ynr++) {
					for (var xnr=0; xnr<orbium.Machine.horizTiles; xnr++) {
						var symbol = orbium.level[this.levnr][count];

						this.createTile(symbol, count, xnr, ynr);

						count++;
					}
				}

				// Set the correct base for tiles
				this.calculateBases();

				this.lane = new orbium.Lane();

				// Save level progress
				this.saveLevel(this.levnr);
			}
		};

		this.createTile = function(symbol, count, xnr, ynr) {
			var prefix = symbol.substring(0, 1);
			var middle = symbol.substring(1, 2);
			var suffix = symbol.substring(2, 3);

			var variant = parseInt(middle);
			var color = parseInt(suffix);

			if (prefix == "E") {
				var emptytile = new orbium.EmptyTile(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, emptytile);
			} else if (prefix == "R") {
				var rotator = new orbium.Rotator(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, rotator);
			} else if (prefix == "H") {
				var horiztile = new orbium.HorizTile(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, horiztile);
			} else if (prefix == "V") {
				var verttile = new orbium.VertTile(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, verttile);
			} else if (prefix == "X") {
				var crosstile = new orbium.CrossTile(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, crosstile);
			} else if (prefix == "I") {
				var inspector = new orbium.Inspector(count, xnr, ynr,
					variant, color);
				orbium.Util.setArrayElement(count, this.tiles, inspector);
			} else if (prefix == "P") {
				var teleporter = new orbium.Teleporter(count, xnr, ynr,
					variant);
				orbium.Util.setArrayElement(count, this.tiles, teleporter);
			} else if (prefix == "T") {
				var transformer = new orbium.Transformer(count, xnr, ynr,
					variant, color);
				orbium.Util.setArrayElement(count, this.tiles, transformer);
			} else if (prefix == "D") {
				var director = new orbium.Director(count, xnr, ynr, variant);
				orbium.Util.setArrayElement(count, this.tiles, director);
			} else if (prefix == "N") {
				this.counter = new orbium.Counter(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, this.counter);
			} else if (prefix == "C") {
				this.clock = new orbium.Clock(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, this.clock);
			} else if (prefix == "M") {
				this.matcher = new orbium.Matcher(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, this.matcher);
			} else if (prefix == "S") {
				this.sequencer = new orbium.Sequencer(count, xnr, ynr, color);
				orbium.Util.setArrayElement(count, this.tiles, this.sequencer);
			} else if (prefix == "F") {
				var falltile = new orbium.FallTile(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, falltile);
			} else if (prefix == "A") {
				this.announcer = new orbium.Announcer(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, this.announcer);
			} else {
				var unknown = new orbium.EmptyTile(count, xnr, ynr);
				orbium.Util.setArrayElement(count, this.tiles, unknown);
			}
		};

		this.calculateBases = function() {
			// Set the correct base for tiles
			for (var n=0;n<this.tiles.length;n++) {
				this.tiles[n].setBase();
			}
		};

		this.saveLevel = function(levnr) {
			if (!orbium.Machine.editorMode) {
				// Remember this is the level we played last
				orbium.storage.writeValue("lastlevel", levnr);

				// Read the level we have reached
				var reached = orbium.storage.readValue("reachedlevel");
				if (reached != null) {
					reached = parseInt(reached);
				}

				// Save reached level if higher than ever before
				if (reached == null || levnr > reached) {
					orbium.storage.writeValue("reachedlevel", levnr);
				}

				// If reached level is higher than available levels, write
				// available levels as reached
				if (reached != null && reached > orbium.level.length-1) {
					orbium.storage.writeValue("reachedlevel", orbium.level.length-1);
				}
			}
		};

		this.resetLevel = function() {
			this.levnr--;
			this.nextLevel();
		};

		this.startLevel = function() {
			this.paused = false;
			this.lane.injectMarble();
		};

		this.restartLevel = function() {
			this.paused = false;
			this.resetLevel();
			this.lane.injectMarble();
		};

		this.failLevel = function(msg) {
			this.paused = true;
			orbium.menu.fail(msg);
		};

		this.randomizeNextColor = function() {
			this.nextColor = orbium.Util.generateRandomIndex(3);

			if (this.announcer != null) {
				this.announcer.announceNextColor(this.nextColor);
			}
		};

		this.checkLevelComplete = function() {
			var complete = true;

			for (var i=0;i<this.tiles.length;i++) {
				if (this.tiles[i] instanceof orbium.Rotator) {
					var rotator = this.tiles[i];
					if (!rotator.broken) {
						complete = false;
					}
				}
			}

			if (complete) {
				this.paused = true;
				orbium.menu.showCompl();
			}
		};

		this.findXPos = function(e) {
			var xpos = 0;

			if (e.touches && e.touches.length) {
				xpos = e.touches[0].clientX-orbium.xpos;
			} else if (e.clientX) {
				xpos = e.clientX-orbium.xpos;
			} else if (e.pageX) 	{
				xpos = e.pageX-orbium.xpos;
			}

			return xpos;
		};

		this.findYPos = function(e) {
			var ypos = 0;

			if (e.touches && e.touches.length) {
				ypos = e.touches[0].clientY-orbium.ypos;
			} else if (e.clientY) {
				ypos = e.clientY-orbium.ypos;
			} else if (e.pageY) 	{
				ypos = e.pageY-orbium.ypos;
			}

			return ypos;
		};

		this.checkMouse = function(xtap, ytap) {
			var launched = false;

			// Check if a dockee should be launched
			for (var i=0;i<this.tiles.length;i++) {
				if (this.tiles[i] instanceof orbium.Rotator) {
					for (var j=0;j<this.tiles[i].dockees.length;j++) {
						if (this.tiles[i].dockees[j].withinTrigger(
							xtap,
							ytap)) {
							launched = this.tiles[i].launchPosition(
								this.tiles[i].dockees[j].pos);
						}
					}
				}
			}

			// If no dockee was launched, rotate
			if (!launched) {
				this.checkTap(xtap, ytap);
			}
		};

		this.checkTap = function(xtap, ytap) {
			if (!this.paused) {
				for (var k=0;k<this.tiles.length;k++) {
					if (this.tiles[k] instanceof orbium.Rotator) {
						if (orbium.Util.withinRect(
							xtap,
							ytap,
							this.tiles[k].xpos,
							this.tiles[k].ypos,
							orbium.Tile.size,
							orbium.Tile.size)) {
							this.tiles[k].rotate();
						}
					} else if (this.tiles[k] instanceof orbium.Counter) {
						if (orbium.Util.withinRect(
							xtap,
							ytap,
							this.tiles[k].xpos,
							this.tiles[k].ypos,
							orbium.Tile.size,
							orbium.Tile.size)) {
							orbium.menu.pause();
						}
					}
				}
			}

			if (orbium.editor.selected != null) {
				//console.log("selected: "+orbium.editor.selected);

				for (var l=0;l<this.tiles.length;l++) {
					if (this.tiles[l] instanceof orbium.Counter) {
						if (orbium.Util.withinRect(
							xtap,
							ytap,
							this.tiles[l].xpos,
							this.tiles[l].ypos,
							orbium.Tile.size,
							orbium.Tile.size)) {
							orbium.menu.pause();
						}
					} else {
						if (orbium.Util.withinRect(
							xtap,
							ytap,
							this.tiles[l].xpos,
							this.tiles[l].ypos,
							orbium.Tile.size,
							orbium.Tile.size)) {
								var xnr = this.tiles[l].xpos/orbium.Tile.size;
								var ynr = (this.tiles[l].ypos-orbium.Bar.height)/orbium.Tile.size;
								var idx = ynr*orbium.Machine.horizTiles+xnr;

								this.tiles[l].destruct();
								this.createTile(orbium.editor.selected, idx, xnr, ynr);
								this.calculateBases();
								this.lane.calculateSinks();
						}
					}
				}
			}
		};

		this.checkDrag = function(xtap, ytap, dir) {
			for (var k=0;k<this.tiles.length;k++) {
				if (this.tiles[k] instanceof orbium.Rotator) {
					if (orbium.Util.withinRect(
						xtap,
						ytap,
						this.tiles[k].xpos,
						this.tiles[k].ypos,
						orbium.Tile.size,
						orbium.Tile.size)) {
						return this.tiles[k].launchDirection(dir);
					}
				}
			}

			return false;
		};

		this.mouseDown = function(e) {
			if (!e) e = window.event;
			e.cancelBubble = true;
			if (e.stopPropagation) e.stopPropagation();

			var xmouse = this.findXPos(e);
			var ymouse = this.findYPos(e);

			this.checkMouse(xmouse, ymouse);
		};

		this.startDrag = function(e) {
			if (this.xorg == null && this.yorg == null) {
				this.xorg = this.findXPos(e);
				this.yorg = this.findYPos(e);
			}
		};

		this.moveDrag = function(e) {
			if (this.xorg != null && this.yorg != null) {
				var xcur = this.findXPos(e);
				var ycur = this.findYPos(e);

				var dx = xcur-this.xorg;
				var dy = ycur-this.yorg;

				// Check wich direction the drag was and launch accordingly
				if (dx < -orbium.Marble.size) {
					if (this.checkDrag(this.xorg, this.yorg, 3)) {
						this.xorg = null;
						this.yorg = null;
					}
				} else if (dx > orbium.Marble.size) {
					if (this.checkDrag(this.xorg, this.yorg, 1)) {
						this.xorg = null;
						this.yorg = null;
					}
				} else if (dy < -orbium.Marble.size) {
					if (this.checkDrag(this.xorg, this.yorg, 0)) {
						this.xorg = null;
						this.yorg = null;
					}
				} else if (dy > orbium.Marble.size) {
					if (this.checkDrag(this.xorg, this.yorg, 2)) {
						this.xorg = null;
						this.yorg = null;
					}
				}
			}
		};

		this.endDrag = function(e) {
			if (this.xorg != null && this.yorg != null) {
				this.checkTap(this.xorg, this.yorg);
				this.xorg = null;
				this.yorg = null;
			}
		};

		this.showProgress = function(pct) {
			// Only draw progress if we are running over the web with http(s)
			if (orbium.has_canvas && !orbium.Util.isPG()) {
				orbium.ctx.fillStyle = "#808080";
				orbium.ctx.fillRect(0, 0, orbium.width, 10);
				orbium.ctx.fillStyle = "#ffffff";
				orbium.ctx.fillRect(1, 1, Math.round(orbium.width*pct-2), 8);
			} else if (!orbium.has_canvas && !orbium.Util.isPG()) {
				var progress0 = document.getElementById("progress0");
				progress0.style.visibility = "visible";
				progress0.style.left = ""+orbium.xpos+"px";
				progress0.style.top = ""+orbium.ypos+"px";
				progress0.style.width = ""+orbium.width+"px";
				progress0.style.height = "10px";

				var progress1 = document.getElementById("progress1");
				progress1.style.visibility = "visible";
				var left = orbium.xpos+1;
				var top = orbium.ypos+1;
				var width = Math.round(orbium.width*pct-2);
				progress1.style.left = ""+left+"px";
				progress1.style.top = ""+top+"px";
				progress1.style.width = ""+width+"px";
				progress1.style.height = "8px";
			}
		};

		this.hideProgress = function() {
			// If we run on device and from the web, try to hide address bar
			if (orbium.has_touch_screen && !orbium.Util.isPG()) {
				setTimeout(function() {window.scrollTo(0, 1);}, 1000);
			}

			if (!orbium.has_canvas && !orbium.Util.isPG()) {
				var progress0 = document.getElementById("progress0");
				progress0.style.visibility = "hidden";
				var progress1 = document.getElementById("progress1");
				progress1.style.visibility = "hidden";
			}

			if (!orbium.has_canvas) {
				var div0 = document.getElementById("div0");
				div0.style.visibility = "visible";
			}
		};

		this.checkRotatorsFull = function() {
			var again = true;

			while (again) {
				again = false;

				for (var i=0; i<this.tiles.length; i++) {
					var tile = this.tiles[i];

					if (tile instanceof orbium.Rotator) {
						// Only bother to check if not exploding and 4 is docked
						if (tile.fullc == -1 && tile.dockees.length == 4) {
							if (this.matcher != null && this.matcher.active()) {
								if (this.matcher.matches(tile.pattern())) {
									tile.explode();

									again = true;
								}
							} else {
								var matchColor = tile.dockees[0].color;

								var same = 0;
								for (var j=0; j<tile.dockees.length; j++) {
									if (tile.dockees[j].color == matchColor) {
										same++;
									}
								}

								if (same == 4) {
									if (this.sequencer != null && this.sequencer.active()) {
										if (this.sequencer.matches(matchColor)) {
											this.sequencer.advance();

											tile.explode();

											again = true;
										}
									} else {
										tile.explode();

										again = true;
									}
								}
							}
						}
					}
				}
			}
		};

		this.checkTile = function(tile) {
			var collectables = [];
			for (var i=0; i<this.marbles.length; i++) {
				if (tile instanceof orbium.VertTile ||
					tile instanceof orbium.HorizTile ||
					tile instanceof orbium.CrossTile ||
					tile instanceof orbium.Inspector ||
					tile instanceof orbium.Teleporter ||
					tile instanceof orbium.Transformer ||
					tile instanceof orbium.Director ||
					tile instanceof orbium.FallTile ||
					tile instanceof orbium.Rotator) {
					// Check if marble is above tile and we should invalidate it
					if (orbium.Util.withinRect(
						this.marbles[i].xpos,
						this.marbles[i].ypos,
						tile.xpos,
						tile.ypos,
						orbium.Tile.size,
						orbium.Tile.size) ||
					orbium.Util.withinRect(
						this.marbles[i].xpos+orbium.Marble.size,
						this.marbles[i].ypos+orbium.Marble.size,
						tile.xpos,
						tile.ypos,
						orbium.Tile.size,
						orbium.Tile.size)) {
						tile.invalidate();
					}
				}

				if (tile instanceof orbium.Rotator) {
					// Check if marble should dock or bounce
					var within = false;

					if (this.marbles[i].direction == 0) {
						if (orbium.Util.withinRect(
							this.marbles[i].xpos+orbium.Marble.size/2,
							this.marbles[i].ypos,
							tile.xpos+orbium.Tile.size/2-orbium.Marble.size/2,
							tile.ypos+orbium.Tile.size-orbium.Marble.size-orbium.Marble.size/6,
							orbium.Marble.size,
							orbium.Marble.size)) {
								within = true;
						}
					} else if (this.marbles[i].direction == 1) {
						if (orbium.Util.withinRect(
							this.marbles[i].xpos+orbium.Marble.size,
							this.marbles[i].ypos+orbium.Marble.size/2,
							tile.xpos+orbium.Marble.size/6,
							tile.ypos+orbium.Tile.size/2-orbium.Marble.size/2,
							orbium.Marble.size,
							orbium.Marble.size)) {
								within = true;
						}
					} else if (this.marbles[i].direction == 2) {
						if (orbium.Util.withinRect(
							this.marbles[i].xpos+orbium.Marble.size/2,
							this.marbles[i].ypos+orbium.Marble.size,
							tile.xpos+orbium.Tile.size/2-orbium.Marble.size/2,
							tile.ypos+orbium.Marble.size/6,
							orbium.Marble.size,
							orbium.Marble.size)) {
								within = true;
						}
					} else if (this.marbles[i].direction == 3) {
						if (orbium.Util.withinRect(
							this.marbles[i].xpos,
							this.marbles[i].ypos+orbium.Marble.size/2,
							tile.xpos+orbium.Tile.size-orbium.Marble.size-orbium.Marble.size/6,
							tile.ypos+orbium.Tile.size/2-orbium.Marble.size/2,
							orbium.Marble.size,
							orbium.Marble.size)) {
								within = true;
						}
					}

					if (within) {
						var success = tile.dockMarble(this.marbles[i].direction, this.marbles[i].color, this.marbles[i].frame, false);
						if (success) {
							orbium.Util.addArrayElement(collectables, this.marbles[i]);

							// If direction is left we need to invalidate
							// tile rightof this rotator
							if (this.marbles[i].direction == 3) {
								var idx = tile.count+1;
								if (this.tiles[idx] != undefined) {
									this.tiles[idx].invalidate();
								}
							}

							// If direction is up we need to invalidate
							// tile below this rotator
							if (this.marbles[i].direction == 0) {
								var idz = tile.count+orbium.Machine.horizTiles;
								if (this.tiles[idz] != undefined) {
									this.tiles[idz].invalidate();
								}
							}

							this.checkRotatorsFull();
						} else {
							this.marbles[i].bounce();
						}
					}

					// Rotator falldown
					if (tile.count < orbium.Machine.horizTiles && this.marbles[i].fresh) {
						if (this.marbles[i].lastDockTry != tile &&
							orbium.Util.withinRect(
							this.marbles[i].xpos+orbium.Marble.size/2,
							this.marbles[i].ypos+orbium.Marble.size/2,
							tile.xpos+orbium.Tile.size/2-orbium.Marble.size/4,
							tile.ypos-orbium.Bar.height,
							orbium.Marble.size/2,
							orbium.Bar.height)) {
							var falldown = tile.dockMarble(2, this.marbles[i].color, this.marbles[i].frame, true);

							if (falldown) {
								this.marbles[i].destruct();
								orbium.Util.removeArrayElement(this.marbles, this.marbles[i]);
								tile.invalidate();

								this.checkRotatorsFull();

								this.lane.resetTimer();
								this.lane.injectMarble();
							} else {
								this.marbles[i].lastDockTry = tile;
							}
						}
					}
				}

				// FallTile
				if (tile instanceof orbium.FallTile) {
					// FallTile falldown
					if (tile.count < orbium.Machine.horizTiles && this.marbles[i].fresh) {
						if (orbium.Util.withinRect(
							this.marbles[i].xpos+orbium.Marble.size/2,
							this.marbles[i].ypos+orbium.Marble.size/2,
							tile.xpos+orbium.Tile.size/2-orbium.Marble.size/4,
							tile.ypos-orbium.Bar.height,
							orbium.Marble.size/2,
							orbium.Bar.height) &&
							this.counter.isFallAllowed()) {
							tile.fallMarble(this.marbles[i]);
							this.marbles[i].fresh = false;
							this.lane.resetTimer();
							this.lane.injectMarble();
							this.counter.countActiveMarbles();
						}
					}

					// Check if marble should bounce back
					tile.bounceBackMarble(this.marbles[i]);
				}

				// Teleport
				if (tile instanceof orbium.Teleporter) {
					tile.teleportMarble(this.marbles[i]);
				}

				// Inspect
				if (tile instanceof orbium.Inspector) {
					tile.inspectMarble(this.marbles[i]);
				}

				// Transformer
				if (tile instanceof orbium.Transformer) {
					tile.transformMarble(this.marbles[i]);
				}

				// Director
				if (tile instanceof orbium.Director) {
					tile.directMarble(this.marbles[i]);
				}
			}

			for (var o=0; o<collectables.length; o++) {
				collectables[o].destruct();
				orbium.Util.removeArrayElement(this.marbles, collectables[o]);
				this.counter.countActiveMarbles();
			}
		};

		this.run = function() {
			if (this.loaded) {
				var curr = new Date().getTime();
				var dt = (curr-this.last)/1000;
				this.last = curr;

				//orbium.ctx.clearRect(0, 0, orbium.width, orbium.height);

				// Only update if not paused
				if (!this.paused) {
					// Update the lane
					this.lane.update(dt);

					// Update and check tiles
					for (var j=0; j<this.tiles.length; j++) {
						if (this.tiles[j].update != undefined) {
							this.tiles[j].update(dt);
						}

						this.checkTile(this.tiles[j]);
					}

					// Update marbles
					for (var k=0; k<this.marbles.length; k++) {
						this.marbles[k].update(dt);
					}

					// Update sign
					orbium.sign.update(dt);

					// Update tutorial
					orbium.tutorial.update(dt);
				}

				// Draw lane
				this.lane.draw();

				// Draw tiles layer 1 and 2
				for (var m=0; m<this.tiles.length; m++) {
					this.tiles[m].draw1();
					this.tiles[m].draw2();
				}

				// Draw marbles
				for (var n=0; n<this.marbles.length; n++) {
					this.marbles[n].draw1();
				}

				// Draw tiles layer 3
				for (var l=0; l<this.tiles.length; l++) {
					this.tiles[l].draw3();
				}

				if (this.first) {
					this.first = false;

					this.hideProgress();

					orbium.menu.showMain();
				}
			} else {
				var num = 0;
				for (var p=0; p<orbium.loader.props.length; p++) {
					if (orbium.loader[orbium.loader.props[p]].complete || orbium.loader[orbium.loader.props[p]].failure) {
						num++;
					}
				}

				var pct = num/orbium.loader.props.length;
				this.showProgress(pct);

				if (num == orbium.loader.props.length) {
					this.loaded = true;
				}
			}
		};

		this.construct.apply(this, arguments);
	};
}(window.orbium = window.orbium || {}));
