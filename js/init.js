(function(orbium) {
	orbium.has_transform = false;
	orbium.has_canvas = false;
	orbium.has_touch_screen = false;
	orbium.has_touch_api = false;

	orbium.pane = null;
	orbium.canv = null;
	orbium.ctx = null;

	orbium.loader = null;
	orbium.player = null;
	orbium.storage = null;
	orbium.menu = null;
	orbium.editor = null;
	orbium.sign = null;
	orbium.tutorial = null;
	orbium.machine = null;

	orbium.packs = null;
	orbium.pack_idx = null;
	orbium.level = null;

	orbium.xpos = 0;
	orbium.ypos = 0;
	orbium.width = 0;
	orbium.height = 0;

	orbium.gfx_path = null;

	orbium.init = function() {
		// For now use screensize to determine if we run on a device with touch
		// capabilities or if we are on a desktop computer. Touch capable does
		// not mean a touch API is available.
		// FIXME: Detect this in a better way. how?
		if (screen.width <= 1024 && screen.height <= 768) {
			orbium.has_touch_screen = true;
		}

		// Init for webOS
		if (window.PalmSystem) {
			window.PalmSystem.setWindowOrientation("left");
			window.PalmSystem.enableFullScreenMode(true);
			window.PalmSystem.stageReady();
		}

		// Determine the width and height we have avalable for disposal
		var avail_width = 0;
		var avail_height = 0;
		if (!orbium.has_touch_screen) { // Desktop PC
			var w = orbium.Util.getRequestParameter("w");
			var h = orbium.Util.getRequestParameter("h");

			if (w !== undefined && h !== undefined) {
				avail_width = parseInt(w);
				avail_height = parseInt(h);
			} else if (window.innerWidth !== undefined) { // Compliant
				avail_width = window.innerWidth;
				avail_height = window.innerHeight;
			} else { // IE
				avail_width = document.documentElement.clientWidth;
				avail_height = document.documentElement.clientHeight;
			}
		} else { // Device with touch screen
			if (screen.width > 854 || screen.height > 854) {
				avail_width = 1024;
				avail_height = 768;
			} else if (screen.width > 480 || screen.height > 480) {
				avail_width = 800;
				avail_height = 480;
			} else {
				if (orbium.Util.getDevicePixelRatio() === 2) {
					avail_width = 960;
					avail_height = 640;
				} else {
					avail_width = 480;
					avail_height = 320;
				}
			}

			// Palm pixi special case
			if ((screen.width === 400 && screen.height === 320) ||
				(screen.width === 320 && screen.height === 400)) {
				avail_width = 400;
				avail_height = 320;
			}

			// Android ldpi
			if (screen.height === 240) {
				avail_width = 320;
				avail_height = 240;
			}
		}

		var dimensions = null;
		if (avail_width >= 1024 && avail_height >= 697 &&
			orbium.dimensions_1024x697 !== undefined) {
			dimensions = orbium.dimensions_1024x697;
		} else if (avail_width >= 936 && avail_height >= 637 &&
			orbium.dimensions_936x637 !== undefined) {
			dimensions = orbium.dimensions_936x637;
		} else if (avail_width >= 704 && avail_height >= 479 &&
			orbium.dimensions_704x479 !== undefined) {
			dimensions = orbium.dimensions_704x479;
		} else if (avail_width >= 464 && avail_height >= 316 &&
			orbium.dimensions_464x316 !== undefined) {
			dimensions = orbium.dimensions_464x316;
		} else if (avail_width >= 400 && avail_height >= 289 &&
			orbium.dimensions_424x289 !== undefined) {
			dimensions = orbium.dimensions_424x289;
		} else if (avail_width >= 320 && avail_height >= 240 &&
			orbium.dimensions_344x234 !== undefined) {
			dimensions = orbium.dimensions_344x234;
		} else {
			return; // There was not enough screen to draw graphics
		}

		// Determine viewport settings
		var vp = document.getElementById("vp");
		var vp_width = "width=device-width, ";

		var vp_droid_dpi = "target-densitydpi=device-dpi, ";

		var vp_user_scalable = "user-scalable=no, ";

		var scale = "1.0";
		if (orbium.Util.getDevicePixelRatio() === 2) {
			scale = "0.5";
		}

		var vp_initial_scale = "initial-scale="+scale+", ";
		var vp_minimum_scale = "minimum-scale="+scale+", ";
		var vp_maximum_scale = "maximum-scale="+scale;

		vp.attributes.content.value = vp_width+vp_droid_dpi+vp_user_scalable+
			vp_initial_scale+vp_minimum_scale+vp_maximum_scale;

		// Apple touch icon
		var ai = document.getElementById("ai");
		if (avail_width >= 1024) {
			ai.attributes.href.value = "ico/app_72x72.png";
		} else if (avail_width >= 936) {
			ai.attributes.href.value = "ico/app_114x114.png";
		} else {
			ai.attributes.href.value = "ico/app_57x57.png";
		}

		orbium.Machine.timeLimits = true;
		orbium.Machine.editorMode = false;
		orbium.Machine.horizTiles = 8;
		orbium.Machine.vertTiles = 5;

		orbium.Tile.size = dimensions.tile_size;
		orbium.Marble.size = dimensions.marble_size;
		orbium.Bar.height = dimensions.bar_height;

		orbium.gfx_path = dimensions.gfx_path;

		var refMarbleSpeed = 48;
		var refRotatorSpeed = 60;
		var refTilesize = 36;
		orbium.Marble.speed =
			Math.round(orbium.Tile.size/refTilesize*refMarbleSpeed);
		orbium.Rotator.speed =
			Math.round(orbium.Tile.size/refTilesize*refRotatorSpeed);

		orbium.packs = [];
		orbium.pack_idx = 0;

		orbium.packs[orbium.pack_idx] = {
			id: "000000",
			name: "DEFAULT",
			level: null
		}

		if (orbium.level_show !== undefined) {
			orbium.packs[orbium.pack_idx].level = orbium.level_show;
		} else if (orbium.level_full !== undefined) {
			orbium.packs[orbium.pack_idx].level = orbium.level_full;
		} else if (orbium.level_free !== undefined) {
			orbium.packs[orbium.pack_idx].level = orbium.level_free;
		} else {
			return; // No levels was found
		}

		orbium.level = orbium.packs[orbium.pack_idx].level;

		orbium.width = orbium.Tile.size*orbium.Machine.horizTiles;
		orbium.height = orbium.Tile.size*orbium.Machine.vertTiles+
			orbium.Bar.height;

		orbium.xpos = Math.round(avail_width/2-orbium.width/2);
		orbium.ypos = Math.round(avail_height/2-orbium.height/2);

		orbium.pane = document.getElementById("pane");
		orbium.pane.style.width = ""+orbium.width+"px";
		orbium.pane.style.height = ""+orbium.height+"px";

		// Use translate3d if webkitTransform is available
		// Do not use it for older pre 4th gen iOS devices
		if (orbium.pane.style.webkitTransform !== undefined &&
			!(orbium.Util.isUA("iPhone") &&
			orbium.Util.getDevicePixelRatio() === 1)) {
			orbium.has_transform = true;

			orbium.pane.style.webkitTransform = "translate3d("+
				orbium.xpos+"px,"+orbium.ypos+"px,0px)";
		} else {
			orbium.pane.style.left = ""+orbium.xpos+"px";
			orbium.pane.style.top = ""+orbium.ypos+"px";

			// Try to create a canvas element to determine if device has
			// canvas capability
			if (!!document.createElement("canvas").getContext &&
				!orbium.Util.hasDrawImageScalingBug()) {
				orbium.has_canvas = true;

				orbium.canv = document.getElementById("canv");
				orbium.canv.style.visibility = "visible";
				orbium.canv.width = orbium.width;
				orbium.canv.height = orbium.height;

				orbium.ctx = orbium.canv.getContext("2d");
			}
		}

		if (orbium.has_touch_screen && !orbium.Util.isPG()) {
			orbium.Util.attachListener(window, "orientationchange",
				function() {setTimeout(function() {window.scrollTo(0, 1);},
					1000);});
		}

		orbium.loader = new orbium.Loader();
		orbium.player = new orbium.Player();
		orbium.storage = new orbium.Storage();
		orbium.menu = new orbium.Menu();
		orbium.sign = new orbium.Sign();
		orbium.perf = new orbium.Perf();
		orbium.tutorial = new orbium.Tutorial();
		orbium.machine = new orbium.Machine();
		orbium.machine.nextLevel();

		if (orbium.has_touch_screen) {
			// Prevent the viewport from being panned. To do this we have a
			// div that covers the whole screen, that we set up event
			// listeners on and prevent the default action.
			var scr = document.getElementById("screen");
			orbium.Util.attachListener(scr, "touchstart",
				function(e) {e.stopPropagation(); e.preventDefault();});
			orbium.Util.attachListener(scr, "touchend",
				function(e) {e.stopPropagation(); e.preventDefault();});
			orbium.Util.attachListener(scr, "touchmove",
				function(e) {e.stopPropagation(); e.preventDefault();});

			// Check if device has touch API. Some browsers like Chrome have
			// touch API and tells us it support it even though its running on a
			// regular non touch screen PC, sigh..
			// So screen check size above prevents us from even doing this check
			var el = document.createElement("div");
			el.setAttribute("ontouchmove", "return;");

			if (typeof el.ontouchmove === "function") {
				orbium.has_touch_api = true;
			}

			// Set touch events if avalable, otherwise fall back on mouse events
			if (orbium.has_touch_api) {
				orbium.Util.attachListener(orbium.pane, "touchstart",
					function(e) {orbium.machine.startDrag(e);});
				orbium.Util.attachListener(orbium.pane, "touchend",
					function(e) {orbium.machine.endDrag(e);});
				orbium.Util.attachListener(orbium.pane, "touchmove",
					function(e) {orbium.machine.moveDrag(e);});

				orbium.menu.setupTouchEvents();
			} else {
				orbium.Util.attachListener(orbium.pane, "mousedown",
					function(e) {orbium.machine.startDrag(e);});
				orbium.Util.attachListener(orbium.pane, "mouseup",
					function(e) {orbium.machine.endDrag(e);});
				orbium.Util.attachListener(orbium.pane, "mousemove",
					function(e) {orbium.machine.moveDrag(e);});

				orbium.menu.setupMouseEvents();
			}
		} else {
			orbium.has_touch_api = false;

			// IE has an annoying habit of interpreting fast mousedowns as
			// a doubleclick event. Workaround is to use mouseup for IE
			// instead. This results in IE having somewhat slower interactivity
			if (orbium.pane.addEventListener) {
				orbium.Util.attachListener(orbium.pane, "mousedown",
					function(e) {orbium.machine.mouseDown(e);});
			} else if (orbium.pane.attachEvent) {
				orbium.Util.attachListener(orbium.pane, "mouseup",
					function(e) {orbium.machine.mouseDown(e);});
			}

			orbium.menu.setupMouseEvents();
		}

		orbium.menu.updateStart();
		orbium.menu.updateSound();
		orbium.menu.updateTutorial();
		orbium.menu.updateLimits();

		orbium.editor = new orbium.Editor();

		var target_fps = 60;
		if (orbium.has_touch_screen) {
			target_fps = 30;
		}

		setInterval(function() {orbium.machine.run();}, Math.round(1000/target_fps));
	};
}(window.orbium = window.orbium || {}));
