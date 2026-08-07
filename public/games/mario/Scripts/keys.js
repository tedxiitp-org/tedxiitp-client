/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */

var keys = {
	bind : function() {
		$(document).on('keydown', function(event) {	
			return keys.handler(event, true);
		});
		$(document).on('keyup', function(event) {	
			return keys.handler(event, false);
		});
		
		var touchHandler = function(event) {
			event.preventDefault();
			
			if (!keys.isFullScreen) {
				var docElm = document.documentElement;
				if (docElm.requestFullscreen) { docElm.requestFullscreen(); }
				else if (docElm.webkitRequestFullScreen) { docElm.webkitRequestFullScreen(); }
				keys.isFullScreen = true;
			}
			
			keys.reset();
			var touches = event.originalEvent.touches;
			for (var i = 0; i < touches.length; i++) {
				var touch = touches[i];
				var el = document.elementFromPoint(touch.clientX, touch.clientY);
				if (el) {
					if (el.id === 'tc-up' || el.id === 'tc-jump') keys.up = true;
					if (el.id === 'tc-left') keys.left = true;
					if (el.id === 'tc-right') keys.right = true;
					if (el.id === 'tc-down') keys.down = true;
					if (el.id === 'tc-fire') keys.fire = true;
				}
			}
			
			// Update button visual states
			$('.tc-btn').removeClass('active');
			if (keys.up) { $('#tc-up').addClass('active'); $('#tc-jump').addClass('active'); }
			if (keys.left) $('#tc-left').addClass('active');
			if (keys.right) $('#tc-right').addClass('active');
			if (keys.down) $('#tc-down').addClass('active');
			if (keys.fire) $('#tc-fire').addClass('active');
		};
		
		$(document).on('touchstart touchmove touchend touchcancel', touchHandler);
		
		keys.resize();
		$(window).on('resize', keys.resize);
	},
	resize : function() {
		var game = $('#game');
		var scale = Math.min(window.innerWidth / 640, window.innerHeight / 480);
		game.css('transform', 'translate(-50%, -50%) scale(' + scale + ')');
	},
	reset : function() {
		keys.left = false;
		keys.right = false;
		keys.accelerate = false;
		keys.fire = false;
		keys.up = false;
		keys.down = false;
	},
	unbind : function() {
		$(document).off('keydown');
		$(document).off('keyup');
		$(document).off('touchstart touchmove touchend touchcancel');
		$(window).off('resize');
	},
	handler : function(event, status) {
		switch(event.keyCode) {
			case 16://SHIFT
			case 32://SPACE
				keys.fire = status;
				break;
			case 57392://CTRL on MAC
			case 17://CTRL
			case 65://A
				keys.accelerate = status;
				break;
			case 40://DOWN ARROW
				keys.down = status;
				break;
			case 39://RIGHT ARROW
				keys.right = status;
				break;
			case 37://LEFT ARROW
				keys.left = status;			
				break;
			case 38://UP ARROW
				keys.up = status;
				break;
			default:
				return true;
		}
			
		event.preventDefault();
		return false;
	},
	accelerate : false,
	fire: false,
	left : false,
	up : false,
	right : false,
	down : false,
	isFullScreen : false
};