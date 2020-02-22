var resizeCanvas;
$(document).ready(function() {
	resizeCanvas = function(){
		var game = $("#game")[0];
		game.style.width = (game.width = screen.width * .9) + "px";
		game.style.height = (game.height = game.width * .45) + "px";
	}
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas)
})
var isFullScreen = false;

var fs = function(){
	if('onfullscreenchange' in document){					//Generic
		return ['', 'Fullscreen', 'exit', 'request'];
	}
	if('onmozfullscreenchange' in document){				//Firefox
		return ['moz','FullScreen', 'Cancel', 'Request'];
	}
	if('onwebkitfullscreenchange' in document){				//Chrome, Safari
		return ['webkit', 'Fullscreen', 'Exit', 'Request'];
	}
	if('onmsfullscreenchange' in document){					//Internet Explorer
		return ['ms', 'Fullscreen', 'Exit', 'Request'];
	}
}();
var isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);

$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', fullScreenHandler);
function fullScreenHandler(){
	isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
	//console.log(isFullScreen, !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement))
	if (!isFullScreen)	//If it is no longer fullscreen
	{
		setTimeout(function(){
			window.addEventListener('resize', resizeCanvas);
			resizeCanvas();

		}, 100)
		if (Library.isIE)//Internet Explorer apparently disobeyes css selector for fullscreen element.
		{
			document.getElementById('game').style.margin = '30px';
			document.getElementById('game').style.marginLeft = 'auto';
			document.getElementById('game').style.marginRight = 'auto';
			document.body.style.overflow = "visible"
		}
	}
	else				//If it is now fullscreen
	{
		setTimeout(function(){
			window.removeEventListener('resize', resizeCanvas)
			var game = $("#game")[0];
			game.style.width = (game.width = screen.width) + "px";
			game.style.height = (game.height = screen.height) + "px";

		}, 100)
		if (Library.isIE)//Internet Explorer apparently disobeyes css selector for fullscreen element.
		{
			document.getElementById('game').style.margin = 0;
			document.body.style.overflow = "hidden"
		}
	}
	document.getElementById('game').focus();
	$(window).trigger('resize');
}


window.onload = function(){
	start();
}
//document.getElementById("sup").innerHTML = "Potato"

/* FIX JAVASCRIPT STUFF GOES HERE */
Number.prototype.roundTo = function(num) {
	var resto = this%num;
	if (resto <= (num/2)) {
		return this-resto;
	} else {
		return this+num-resto;
	}
}
Math.rand = function(min,max)
{
	return Math.floor(Math.random()*(max-min+1)+min);
}
Math.cbrt = Math.cbrt || function(x) {
    var sign = x === 0 ? 0 : x > 0 ? 1 : -1;

    return sign * Math.pow(Math.abs(x), 1 / 3);
}
Math.sign = function(x) {
  //x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return (x > 0 || x === true) ? 1 : -1;
}
window.lastClicked = $("html");
$("*").click(function(e){
	window.lastClicked = this;
	e.stopPropagation();
})
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) { //http://stackoverflow.com/a/7838871/2280505
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	this.beginPath();
	this.moveTo(x+r, y);
	this.arcTo(x+w, y,   x+w, y+h, r);
	this.arcTo(x+w, y+h, x,   y+h, r);
	this.arcTo(x,   y+h, x,   y,   r);
	this.arcTo(x,   y,   x+w, y,   r);
	this.closePath();
}
Path2D.prototype.roundRect = function(x, y, w, h, r) { //http://stackoverflow.com/a/7838871/2280505
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	this.moveTo(x+r, y);
	this.arcTo(x+w, y,   x+w, y+h, r);
	this.arcTo(x+w, y+h, x,   y+h, r);
	this.arcTo(x,   y+h, x,   y,   r);
	this.arcTo(x,   y,   x+w, y,   r);
}
function selectText(element) {
	var doc = document
		, text = doc.getElementById(element)
		, range, selection
	;
	if (doc.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(text);
		range.select();
	} else if (window.getSelection) {
		selection = window.getSelection();
		range = document.createRange();
		range.selectNodeContents(text);
		selection.removeAllRanges();
		selection.addRange(range);
	}
}
findDimensions = function(canvasTextObj){
	scene.ctx.font = canvasTextObj.style + " " + canvasTextObj.size + "px " + canvasTextObj.font;
	var original = canvasTextObj.lines.slice();

	var div = document.createElement('DIV');
		div.innerHTML = canvasTextObj.text;
		div.style.position = 'absolute';
		div.style.top = '-100px';
		div.style.left = '-100px';
		div.style.fontFamily = canvasTextObj.font;
		div.style.fontWeight = canvasTextObj.style.toLowerCase().includes("bold") ? 'bold' : 'normal';
		div.style.fontSize = canvasTextObj.size + 'pt';
		div.style.whiteSpace = "nowrap";
	document.body.appendChild(div);

	var size = [div.offsetWidth, div.offsetHeight];

	document.body.removeChild(div);

	var height = size[1] / 2;

	canvasTextObj.lineHeight = height
    canvasTextObj.height = canvasTextObj.lineHeight * canvasTextObj.lines.length + (canvasTextObj.lines.length - 1) * canvasTextObj.linePadding
	canvasTextObj.width = (scene.ctx.measureText((canvasTextObj.lines).sort(function (a, b) {return scene.ctx.measureText(b).width - scene.ctx.measureText(a).width})[0]).width)
	canvasTextObj.lines = original;
}
findUsable = function(canvasTextObj, scopeText){
	if (scopeText == "")
	{
		canvasTextObj.lines = [""];
	}
	else
	{
        canvasTextObj.lines = scopeText.split("\n");//.match(/.*([^\r\n])/g);
	}
}

function Scene(canvas) {
	this.fps = 60;
	this.scaleX = 1;
	this.scaleY = 1;
	this.translateX = 0;
	this.translateY = 0;
	this.centers;
	this.shapes = [];
	this.atFront = [];
	this.ctx = undefined;
	this.canvas = canvas;
	this.canvasFocus = false;
	this.axesOn = false;
	this.rect = undefined;
	this.canvasX = undefined;
	this.canvasY = undefined;
	this.contextMenu = true;
	this.mouseDownShapes = [];
	this.mouseUpShapes = [];
	this.mouseEnterShapes = [];
	this.mouseMoveShapes = [];
	this.mouseLeaveShapes = [];
	this.clickShapes = [];
	this.imageObjects = {};
	this.loadImages = function(/*Using the arguments array instead*/){
		//Usage: scene.loadImages(<Name>, <Link>, <CallBack>)
		var loadedImageCount = 0;
		var totalCount = (arguments.length - 1) / 2
		var callBack = (arguments.length % 2 == 1) ? arguments[arguments.length - 1] : function(){};
		for (var i = 0; i < arguments.length - 1; i += 2)
		{
			var img = new Image()
			img.src = arguments[i+1]
			this.imageObjects[arguments[i]] = img;
			img.onload = function()
			{
				loadedImageCount++;
				if (loadedImageCount == totalCount)
				{
					callBack();
				}
			}
		}
	}
	this.loadFonts = function(/*Using the arguments array instead*/){
		//Usage: scene.loadFonts(<Name>, <Link>, <CallBack>)
		var loadedFontCount = 0;
		var totalCount = (arguments.length - 1) / 2
		var callBack = (arguments.length % 2 == 1) ? arguments[arguments.length - 1] : function(){};
		for (var i = 0; i < arguments.length - 1; i += 2)
		{
			$("head").prepend(
				"<style type=\"text/css\">@font-face {font-family: \""+arguments[i]+"\"; src: url('/fonts/"+arguments[i+1]+"') format('opentype');}</style>'"
			);
			fontSpy(arguments[i], {
				glyphs: '\ue81a\ue82d\ue823',
				success: function() {
					loadedFontCount++;
					if (loadedFontCount == totalCount)
					{
						callBack();
					}
				},
				failure: function() {
					//alert("My Icons failed to load");
				}
			});
		}
	}
	this.background = {
		distance: 1,
		style: 0,
		color: "#FFFFFF",
		sources: [],
		scales: false,
		changeStyle: function (method, num) {
			if (method == "to")
			{
				if (num < 0)
				{
					num = this.sources.length;
				}
				else if (num > this.sources.length)
				{
					num = 0;
				}
				this.style = num;
			}
			else if (method == "add")
			{
				num += this.style;
				if (num < 0)
				{
					num = this.sources.length;
				}
				else if (num > this.sources.length)
				{
					num = 0;
				}
				this.style = num;
			}
		},
		addBackground: function (src) {
			var BG = {}
			BG.img = new Image();
			BG.img.src = src;
			BG.loaded = false;
			BG.src = src;

			BG.img.addEventListener("load", loadIt);
			function loadIt(event) {
				BG.loaded = true;
				BG.width = BG.img.naturalWidth;
				BG.height = BG.img.naturalHeight;

			}

			this.sources.push(BG)
		}
	}

	this.clearEventListeners = function(method) {
		if (method == "mouseDown")
		{
			this.mouseDownShapes = [];
		}
		else if (method == "mouseUp")
		{
			this.mouseUpShapes = [];
		}
		else if (method == "mouseEnter")
		{
			this.mouseEnterShapes = [];
		}
		else if (method == "mouseLeave")
		{
			this.mouseLeaveShapes = [];
		}
		else if (method == "click")
		{
			this.clickShapes = [];
		}
		else
		{
			this.mouseDownShapes = [];
			this.mouseUpShapes = [];
			this.mouseEnterShapes = [];
			this.mouseLeaveShapes = [];
			this.clickShapes = [];
		}
	}
	this.addShape = function(shape) {
        this.shapes.push(shape);
    };
	this.showMouse = function() {
		this.canvas.style.cursor = Library.mouse.form;
	}
	this.changeMouse = function(form, x, y) {
		this.canvas.style.cursor = form;
		Library.mouse.pointerOffsetX = x;
		Library.mouse.pointerOffsetY = y;
		if (form.endsWith('.cur'))
		{
			this.canvas.style.cursor = "url(" + form + ")" + (Library.mouse.pointerOffsetX || "") + " " + (Library.mouse.pointerOffsetY || "") + ", auto";
		}
		Library.mouse.form = this.canvas.style.cursor;
	}
	this.hideMouse = function() {
		this.canvas.style.cursor = "none";
	}
	this.setMousePos = function(){
		if (Library.mouse.lastEvent)
		{
			var e = window.event || Library.mouse.lastEvent
			var baseX = ((e.offsetX || e.layerX) - canvas.clientLeft)
			var baseY = ((e.offsetY || e.layerY) - canvas.clientTop)
			Library.mouse.lastXPos = Library.mouse.x;
			Library.mouse.lastYPos = Library.mouse.y;
			Library.mouse.lastCanvasXPos = Library.mouse.canvasXPos;
			Library.mouse.lastCanvasYPos = Library.mouse.canvasYPos;

			Library.mouse.canvasXPos = (baseX) * (canvas.width / parseInt(canvas.style.width));
			Library.mouse.canvasYPos = (baseY) * (canvas.height / parseInt(canvas.style.height));
			Library.mouse.x = (((baseX * (canvas.width / parseInt(canvas.style.width))) - scene.translateX) / this.scaleX);
			Library.mouse.y = (((baseY * (canvas.height / parseInt(canvas.style.height))) - scene.translateY) / this.scaleY);
		}

	}
	this.moveOffset = function(x, y)
	{
		this.translateX += x * this.scaleX;
		this.translateY += y * this.scaleY;
		this.setMousePos()
	}
	this.setOffset = function(x, y)
	{
		this.translateX = x;
		this.translateY = y;
		/*this.xOffset = x;
		this.yOffset = y;
		this.center = {
			x: this.rect.width / 2,
			y: this.rect.height / 2
		}*/
		this.setMousePos()
	}
	this.zoom = function(scaleX, scaleY, x, y)
    {
        var oldSX = this.scaleX;
        var oldSY = this.scaleY;
        var oldTX = this.translateX;
        var oldTY = this.translateY;

		x = x || 0;
        y = y || 0;
		this.translateX = (this.translateX * scaleX) - (x * (scaleX - 1)) //You have no idea what a nightmare it was to come up with this
		this.translateY = (this.translateY * scaleY) - (y * (scaleY - 1))
		this.scaleX *= scaleX;
        this.scaleY *= scaleY;

        /**/for (var i = 0; i < Library.touches.length; i++) { //Reverse engineering to get the new touch coordinates
            console.log(Library.touches[i].x, Library.touches[i].y)
            Library.touches[i].x = (Library.touches[i].x * oldSX + oldTX - this.translateX) / this.scaleX;
            Library.touches[i].y = (Library.touches[i].y * oldSY + oldTY - this.translateY) / this.scaleY;
            console.log(Library.touches[i].x, Library.touches[i].y)
        }/**/
	}
	this.reset = function()
	{
		while (scene.shapes.length)
		{
			scene.shapes[0].delete();
		}
		this.translateX = 0;
		this.translateY = 0;
	}
	this.onScreen = function(shape)
	{
		var screen = {
			x: 0,
			y: 0,
			width: this.canvas.width,
			height: this.canvas.height,
			type: "rect",
			visible: true,
			fixed: true,
			rotation: 0,
		}
		return colliding(screen, shape)
	}
	this.drawCircle = function(x, y, r, c, fixed, padding, border){
		c = c || "#FFFFFF";
		fixed = fixed || false;
		padding = padding || 0;
		border = border || false;
		this.ctx.beginPath();
		this.ctx.arc(x, y, (r + (padding * border)),0,2*Math.PI);
		this.ctx.fillStyle = c;
		this.ctx.fill()
	};
	this.onFrameFunctions = [];
	this.onFrame = function(func){
		this.onFrameFunctions.push({paused: false, func:func});
	}
	this.togglePauseOnFrame = function(func){
		for (var i = 0; i < this.onFrameFunctions.length; i++)
		{
			if (this.onFrameFunctions[i].func === func)
			{
				this.onFrameFunctions.paused = !this.onFrameFunctions.paused ;
			}
		}
	}
	this.removeOnFrame = function(func)
	{
		for (var i = 0; i < this.onFrameFunctions.length; i++)
		{
			if (func === undefined || this.onFrameFunctions[i].func === func)
			{
				this.onFrameFunctions.splice(i, 1);
			}
		}
	}
	this.center = undefined;
}

var Library = {
	isOpera: !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,						// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	isFirefox: typeof InstallTrigger !== 'undefined',											// Firefox 1.0+
	isSafari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,	// At least Safari 3+: "[object HTMLElementConstructor]"
	isChrome: !!window.chrome && !this.isOpera,													// Chrome 1+
	isIE: /*@cc_on!@*/false || !!document.documentMode,											// At least IE6
	isMobile: navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i),
	console: {
		log: function(){
			var string = "";
			for (var i = 0; i < arguments.length; i++)
			{
				string += " " + arguments[i];
			}
			console.log(string)
		}
	},
	mouse: {
		type: 'rect',		//For compatibility with collision detection
		x: 0,				//mouse position
		y: 0,				//mouse position
		width: 1,			//For compatibility with collision detection
		height: 1,			//For compatibility with collision detection
		leftDown: false,	//if left click is being held down
		middleDown: false,	//if middle click is being held down
		rightDown:false,	//if right click is being held down
		wheel: 0,			//Scroll Wheel. 1 if scrolled up, -1 if scrolled down
		lastXPos: 0,
		lastYPos: 0,
		origXPos: 0,		//Location of last click
		origYPos: 0,		//Location of last click
		origCanvasXPos: 0,
		origCanvasYPos: 0,
		fixed: true,		//For compatibility with collision detection
		form: "default",
		canvasXPos: 0,
		canvasYPos: 0,
		lastCanvasXPos: 0,
		lastCanvasYPos: 0,
		lastEvent: undefined,
		pointerOffsetX: 0,
		pointerOffsetY: 0,
		visible: true,
		rotation: 0,
		centered: true
	},
	touches: [],
	openFullScreen: function(){
		document.getElementById('game')[fs[0]+fs[3]+fs[1]]();
	},
	closeFullScreen: function(){
		console.log(document[fs[0]+fs[2]+fs[1]])
		document[fs[0]+fs[2]+fs[1]]();
	},
	getTextWidth: function(text, font, size) {
		scene.ctx.font = scene.ctx.font = size + "px " + font;
		return scene.ctx.measureText(text).width;
	},
	docCookies: {
		getItem: function (sKey) {
			if (!sKey) { return null; }
			return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
		},
		setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
			if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
			var sExpires = "";
			if (vEnd)
			{
				switch (vEnd.constructor)
				{
					case Number:
						sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
						break;
					case String:
						sExpires = "; expires=" + vEnd;
						break;
					case Date:
						sExpires = "; expires=" + vEnd.toUTCString();
						break;
				}
			}
			document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
			return true;
		},
		removeItem: function (sKey, sPath, sDomain) {
			if (!this.hasItem(sKey)) { return false; }
			document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
			return true;
		},
		hasItem: function (sKey) {
			if (!sKey) { return false; }
			return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
		},
		keys: function () {
			var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
			for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
			return aKeys;
		}
	},
	keyboard: {
		keyDown: [],
		keyUp: 0,
		lastPressed: 0,
		keyPressed: false
	},
	newMath: {
		toFixed: function(num, to){
			return (Math.round(num * Math.pow(10, to))) / Math.pow(10, to)
		},
		toOnes: function(num, to){
			return Array(1 + to - num.toString().length).join(0) + num.toString()
		},
		normalizeVectors: function(vx, vy){
			var hypot = Math.hypot(vx, vy)
			return {
				nvx: vx / hypot,
				nvy: vy / hypot,
				distance: hypot
			}
		},
		handleInfinity: function(variable, changeTo){
			if (Math.abs(variable) == Infinity)
			{
				return changeTo || 0;
			}
			return variable;
		}
	},
	object:
	{
		size: function(obj)
		{
			var size = 0, key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) size++;
		    }
			return size;
		}
	},
	array: {
		equals: function (array1, array2)
		{
			if (!array1)
				return false;

			if (array2.length != array1.length)
			{
				return false;
			}

			for (var i = 0, l=array2.length; i < l; i++) {

				/*if (array2[i] instanceof Array && array1[i] instanceof Array) {
					if (!array2[i].equals(array1[i]))
						return false;
				}
				else*/ if (array2[i] != array1[i]) {
					return false;
				}
			}
			return true;
		}
	},
	color:
	{
		hexToRgb: function(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		},
		rgbToHsl: function(r, g, b) {
			r /= 255, g /= 255, b /= 255;
			var max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			var h, s, l = (max + min) / 2;

			if (max == min) {
				h = s = 0; // achromatic
			} else {
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}
				h /= 6;
			}

			return ({
				h: h,
				s: s,
				l: l,
			});
		},
		hslToRgb: function(h, s, l){
			var r, g, b;

			if(s == 0){
				r = g = b = l; // achromatic
			}else{
				var hue2rgb = function hue2rgb(p, q, t){
					if(t < 0) t += 1;
					if(t > 1) t -= 1;
					if(t < 1/6) return p + (q - p) * 6 * t;
					if(t < 1/2) return q;
					if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
					return p;
				}

				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = hue2rgb(p, q, h + 1/3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1/3);
			}

			return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
		},
		rgbToHex: function(r, g, b)
		{
			r = Math.round(r);
			g = Math.round(g);
			b = Math.round(b);
			r = r > 255 ? 255:r;
			g = g > 255 ? 255:g;
			b = b > 255 ? 255:b;
			r = r < 0 ? 0:r;
			g = g < 0 ? 0:g;
			b = b < 0 ? 0:b;
			return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
			function componentToHex(c) { //http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
				var hex = c.toString(16);
				return hex.length == 1 ? ("0" + hex):hex;
			}
		}
	},
	easings:
	{
		linear: function(percent){return percent},
		inQuad: function(percent){return percent*percent},
		outQuad: function(percent){return percent*(2-percent)},
		inOutQuad: function(percent){
			percent *= 2;
			if (percent < 1) return 1/2*percent*percent;
			percent--;
			return -1/2 * (percent*(percent-2) - 1);
		},
		/*************************************/
		inCubic: function(percent){return percent*percent*percent;},
		outCubic: function(percent) {
			percent--;
			return (percent*percent*percent + 1);
		},
		inOutCubic: function (percent) {
			percent *= 2;
			if (percent < 1) return 1/2*percent*percent*percent;
			percent -= 2;
			return 1/2*(percent*percent*percent + 2);
		},
		/*************************************/
		inQuart: function(percent){return percent*percent*percent*percent;},
		outQuart: function(percent) {
			percent--;
			return (1 - percent*percent*percent*percent);
		},
		inOutQuart: function (percent) {
			percent *= 2;
			if (percent < 1) return 1/2*percent*percent*percent*percent;
			percent -= 2;
			return 1/2 * (2 - percent*percent*percent*percent);
		},
		/*************************************/
		inQuint: function(percent){return percent*percent*percent*percent*percent;},
		outQuint: function(percent) {
			percent--;
			return (1 + percent*percent*percent*percent*percent);
		},
		inOutQuint: function (percent) {
			percent *= 2;
			if (percent < 1) return 1/2*percent*percent*percent*percent*percent;
			percent -= 2;
			return 1/2*(percent*percent*percent*percent*percent + 2);
		},
		/*************************************/
		inSine: function (percent) {return -Math.cos(percent * (Math.PI/2)) + 1;},
		outSine: function (percent) {return Math.sin(percent * (Math.PI/2));},
		inOutSine: function(percent){return -1/2 * (Math.cos(Math.PI*percent) - 1)},
		/*************************************/
		inExpo: function(percent){return Math.pow(2, 10 * (percent - 1))},
		outExpo: function(percent){return -Math.pow(2, -10 * percent) + 1},
		inOutExpo: function(percent){
			percent *= 2;
			if (percent < 1) return 1/2 * Math.pow(2, 10 * (percent - 1));
			percent--;
			return 1/2 * -Math.pow(2, -10 * percent) + 1;
		},
		/*************************************/
		inCirc: function(percent){return -(Math.sqrt(1 - percent*percent) - 1)},
		outCirc: function(percent){
			percent--;
			return Math.sqrt(1 - percent*percent);
		},
		inOutCirc: function (percent) {
			percent *= 2;
			if (percent < 1) return -1/2 * (Math.sqrt(1 - percent*percent) - 1);
			percent -= 2;
			return 1/2 * (Math.sqrt(1 - percent*percent) + 1);
		},
		/*************************************/
		inBack: function(percent){
			var s = 1.70158;
			return percent*percent*(percent*s+percent-s);
		},
		outBack: function(percent){ /* Crikey */
			var s = 1.70158
			var b = -percent + 1
			return 1-b*b*((s+1)*b-s)
		},
		inOutBack: function(percent){
			var s = 1.70158;
			if ((percent*=2) < 1) return 1/2*(percent*percent*(((s*=(1.525))+1)*percent - s));
			return 1/2*((percent-=2)*percent*(((s*=(1.525))+1)*percent + s) + 2);
		},
		/*************************************/
		inElastic: function(percent){
			if (percent==0) return 0;  if (percent==1) return 1;
			return -Math.pow(2,(10*(percent-1)))*Math.sin((19*Math.PI*percent)/5.4);
		},
		outElastic: function(percent){
			var b = 1 - percent
			if (percent==0) return 0;  if (percent==1) return 1;
			return 1+Math.pow(2,(10*(b-1)))*Math.sin((19*Math.PI*b)/5.4);
		},
		inOutElastic: function(percent){
			var b = 1.9345742-2*percent;
			var c = 2*percent-0.0654257;
			if (percent==0) return 0;  if (percent==1) return 1;
			if (percent < .5) return -Math.pow(2,(10 * (c-1))) * Math.sin((19*Math.PI*c)/5.4);
			return 1+Math.pow(2,(10 * (b-1))) * Math.sin((19*Math.PI*b)/5.4);
		},
		/*************************************/
		inBounce: function(percent) {
			var a = -percent + 1;
			if ((a) < (1/2.75)) return 1 - (7.5625*a*a);
			if (a < (2/2.75)) return 1 - (7.5625*(a-=(1.5/2.75))*a + .75);
			if (a < (2.5/2.75)) return 1 - (7.5625*(a-=(2.25/2.75))*a + .9375);
			return 1 - (7.5625*(a-=(2.625/2.75))*a + .984375);
		},
		outBounce: function(percent) {
			if ((percent) < (1/2.75)) return 7.5625*percent*percent;
			if (percent < (2/2.75)) return 7.5625*(percent-=(1.5/2.75))*percent + .75;
			if (percent < (2.5/2.75)) return 7.5625*(percent-=(2.25/2.75))*percent + .9375;
			return 7.5625*(percent-=(2.625/2.75))*percent + .984375;
		},
		inOutBounce: function(percent) {
			if (percent < .5) return Library.easings.inBounce(percent*2) * .5;
			else return Library.easings.outBounce((percent-.5)*2) * .5 + .5;
		}
	}
}
colliding = function(shape1, shape2)
{
	if (shape1.visible && shape2.visible)
	{
		if (shape1 == shape2)
		{
			return false
		}
		else if (shape1.type == "rect" && shape2.type == "rect")
		{
			return collObj.areRectanglesColliding(shape1, shape2)
		}
		else if (shape1.type == "rect" && shape2.type == "circ" || shape1.type == "circ" && shape2.type == "rect")
		{
			return collObj.areRectangleAndCirclesColliding(shape1, shape2)
		}
		else if (shape1.type == "circ" && shape2.type == "circ")
		{
			return collObj.areCirclesColliding(shape1, shape2)
		}
		else if (shape1.type == "mouse" && shape2.type == "rect" || shape1.type == 'rect' && shape2.type == "mouse" || shape1.type == "mouse" && shape2.type == "sprite" || shape1.type == 'sprite' && shape2.type == "mouse")
		{

			return collObj.isMouseOn(shape1, shape2)
		}
		else{
			return false;
		}
	}
	else
	{
		return false;
	}
}

function getDistance( fromX, fromY, toX, toY ) {
	var dX = fromX - toX;
	var dY = fromY - toY;

	return Math.sqrt( ( dX * dX ) + ( dY * dY ) );
}
collObj = {
	areRectanglesColliding: function(shape1, shape2) {
		var s1AlignOffset = 0;
		if (shape1.align == "end" || shape1.align == "right")
		{
			s1AlignOffset = shape1.width;
		}
		else if (shape1.align == "center" || shape1.align == "middle")
		{
			s1AlignOffset = shape1.width / 2;
		}

		var s2AlignOffset = 0;
		if (shape2.align == "end" || shape2.align == "right")
		{
			s2AlignOffset = shape2.width;
		}
		else if (shape2.align == "center" || shape2.align == "middle")
		{
			s2AlignOffset = shape2.width / 2;
		}

		var rect1 = {
			x: ((shape1.canvasXPos || shape1.x - (shape1.paddingLeft || shape1.padding) - s1AlignOffset) - (shape1.width / 2) * shape1.centered) * ((scene.scaleX * !shape1.fixed) || 1) + scene.translateX * !shape1.fixed,
			y: ((shape1.canvasYPos || shape1.y - (shape1.paddingTop || shape1.padding)) - (shape1.height / 2) * shape1.centered) * ((scene.scaleY * !shape1.fixed) || 1) + scene.translateY * !shape1.fixed,
			width: ((shape1.width + (shape1.paddingLeft || (shape1.padding)) + (shape1.paddingRight || (shape1.padding))) || 1) * ((scene.scaleX * !shape1.fixed) || 1),
			height: ((shape1.height + (shape1.paddingTop || (shape1.padding)) + (shape1.paddingBottom || (shape1.padding))) || 1) * ((scene.scaleX * !shape1.fixed) || 1),
			fixed: shape1.fixed || false,
			rotation: shape1.rotation || 0
		}
		var rect2 = {
			x: ((shape2.canvasXPos || shape2.x - (shape2.paddingLeft || shape2.padding) - s2AlignOffset) - (shape2.width / 2) * shape2.centered) * ((scene.scaleX * !shape2.fixed) || 1) + scene.translateX * !shape2.fixed,
			y: ((shape2.canvasYPos || shape2.y - (shape2.paddingTop || shape2.padding)) - (shape2.height / 2) * shape2.centered) * ((scene.scaleY * !shape2.fixed) || 1) + scene.translateY * !shape2.fixed,
			width: ((shape2.width + (shape2.paddingLeft || (shape2.padding)) + (shape2.paddingRight || (shape2.padding))) || 1) * ((scene.scaleX * !shape2.fixed) || 1),
			height: ((shape2.height + (shape2.paddingTop || (shape2.padding)) + (shape2.paddingBottom || (shape2.padding))) || 1) * ((scene.scaleX * !shape2.fixed) || 1),
			fixed: shape2.fixed || false,
			rotation: shape2.rotation || 0
		}

		if (shape1.rotation === 0 && shape2.rotation === 0)
		{
			var right = rect1.x < rect2.x + rect2.width;
			var left = rect1.x + rect1.width > rect2.x;
			var bottom = rect1.y < rect2.y + rect2.height;
			var top = rect1.y + rect1.height > rect2.y;
			return left && right && top && bottom;
		}
		else
		{
			var sin = rect1.height * Math.sin(rect1.rotation * Math.PI / 180) / 2
			var cos = rect1.height * Math.cos(rect1.rotation * Math.PI / 180) / 2
			var top1X = (rect1.x + (rect1.width / 2)) - sin;
			var top1Y = (rect1.y + (rect1.height / 2)) - cos;
			var low1X = (rect1.x + (rect1.width / 2)) + sin;
			var low1Y = (rect1.y + (rect1.height / 2)) + cos;
			var normVector1X = ((top1X - (rect1.x + rect1.width / 2)) / rect1.height)
			var normVector1Y = ((top1Y - (rect1.y + rect1.height / 2)) / rect1.height)

			var sin = rect2.height * Math.sin(rect2.rotation * Math.PI / 180) / 2
			var cos = rect2.height * Math.cos(rect2.rotation * Math.PI / 180) / 2
			var top2X = (rect2.x + rect2.width / 2) - sin;
			var top2Y = (rect2.y + rect2.height / 2) - cos;
			var low2X = (rect2.x + rect2.width / 2) + sin;
			var low2Y = (rect2.y + rect2.height / 2) + cos;
			var normVector2X = ((top2X - (rect2.x + rect2.width / 2)) / rect2.height)
			var normVector2Y = ((top2Y - (rect2.y + rect2.height / 2)) / rect2.height)

			var result = true;
			var a = [{x: top1X + normVector1Y * rect1.width, y: top1Y - normVector1X * rect1.width},
				{x: top1X - normVector1Y * rect1.width, y: top1Y + normVector1X * rect1.width},
				{x: low1X - normVector1Y * rect1.width, y: low1Y + normVector1X * rect1.width},
				{x: low1X + normVector1Y * rect1.width, y: low1Y - normVector1X * rect1.width}]
			var b = [{x: top2X + normVector2Y * rect2.width, y: top2Y - normVector2X * rect2.width},
				{x: top2X - normVector2Y * rect2.width, y: top2Y + normVector2X * rect2.width},
				{x: low2X - normVector2Y * rect2.width, y: low2Y + normVector2X * rect2.width},
				{x: low2X + normVector2Y * rect2.width, y: low2Y - normVector2X * rect2.width}]

			//http://stackoverflow.com/a/10965077/2280505
			var polygons = [a, b];
			var minA, maxA, projected, i, i1, j, minB, maxB;

			for (i = 0; i < polygons.length; i++) {
				var polygon = polygons[i];
				for (i1 = 0; i1 < polygon.length; i1++) {
					var i2 = (i1 + 1) % polygon.length;
					var p1 = polygon[i1];
					var p2 = polygon[i2];
					var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

					minA = maxA = undefined;
					for (j = 0; j < a.length; j++) {
						projected = normal.x * a[j].x + normal.y * a[j].y;
						if ((minA === undefined) || projected < minA) {
							minA = projected;
						}
						if ((maxA === undefined) || projected > maxA) {
							maxA = projected;
						}
					}
					minB = maxB = undefined;
					for (j = 0; j < b.length; j++) {
						projected = normal.x * b[j].x + normal.y * b[j].y;
						if ((minB === undefined) || projected < minB) {
							minB = projected;
						}
						if ((maxB === undefined) || projected > maxB) {
							maxB = projected;
						}
					}
					if (maxA < minB || maxB < minA) {
						result = false;
					}
				}
			}
			return result;
		}
	},
	areRectangleAndCirclesColliding: function(shape1, shape2) {
		var circle, rect;
		if(shape1.type == "circ")
		{
			circle = {
				x: (shape1.x) * ((scene.scaleX * !shape1.fixed) || 1) + scene.translateX * !shape1.fixed,
				y: (shape1.y) * ((scene.scaleY * !shape1.fixed) || 1) + scene.translateY * !shape1.fixed,
				r: shape1.r * ((scene.scaleX * !shape1.fixed) || 1),
				fixed: shape1.fixed || false,
			}
			rect = {
				x: ((shape2.canvasXPos || shape2.x) - (shape2.width / 2 * shape2.centered)) * ((scene.scaleX * !shape2.fixed) || 1) + scene.translateX * !shape2.fixed,
				y: ((shape2.canvasYPos || shape2.y) - (shape2.height / 2 * shape2.centered)) * ((scene.scaleY * !shape2.fixed) || 1) + scene.translateY * !shape2.fixed,
				width: (shape2.width || 1) * ((scene.scaleX * !shape2.fixed) || 1),
				height: (shape2.height || 1) * ((scene.scaleX * !shape2.fixed) || 1),
				fixed: shape2.fixed || false,
				rotation: -shape2.rotation * Math.PI / 180
			}
		}
		else
		{
			circle = {
				x: (shape2.x) * ((scene.scaleX * !shape2.fixed) || 1) + scene.translateX * !shape2.fixed,
				y: (shape2.y) * ((scene.scaleY * !shape2.fixed) || 1) + scene.translateY * !shape2.fixed,
				r: shape2.r * ((scene.scaleX * !shape2.fixed) || 1),
				fixed: shape2.fixed || false,
			}
			rect = {
				x: ((shape1.canvasXPos || shape1.x) - (shape1.width / 2 * shape1.centered)) * ((scene.scaleX * !shape1.fixed) || 1) + scene.translateX * !shape1.fixed,
				y: ((shape1.canvasYPos || shape1.y) - (shape1.height / 2 * shape1.centered)) * ((scene.scaleY * !shape1.fixed) || 1) + scene.translateY * !shape1.fixed,
				width: (shape1.width || 1) * ((scene.scaleX * !shape1.fixed) || 1),
				height: (shape1.height || 1) * ((scene.scaleX * !shape1.fixed) || 1),
				fixed: shape1.fixed || false,
				rotation: -shape1.rotation * Math.PI / 180
			}
		}


		var rectCenterX = rect.x + rect.width / 2;
		var rectCenterY = rect.y + rect.height / 2;

		var rectX = rect.x;
		var rectY = rect.y;

		var distance = Math.sqrt((rectCenterX - circle.x) * (rectCenterX - circle.x) + (rectCenterY - circle.y) * (rectCenterY - circle.y));
		var angle = Math.atan2(-(rectCenterY - circle.y),(rectCenterX - circle.x)) + rect.rotation;
		var unrotatedCircleX = rectCenterX + Math.cos(angle) * distance;
		var unrotatedCircleY = rectCenterY + Math.sin(angle) * distance;
		var closestX, closestY;
		if ( unrotatedCircleX < rectX ) {
			closestX = rectX;
		} else if ( unrotatedCircleX > rectX + rect.width ) {
			closestX = rectX + rect.width;
		} else {
			closestX = unrotatedCircleX;
		}
		if ( unrotatedCircleY < rectY ) {
			closestY = rectY;
		} else if ( unrotatedCircleY > rectY + rect.height ) {
			closestY = rectY + rect.height;
		} else {
			closestY = unrotatedCircleY;
		}
		var collision = false;
		var distance = getDistance( unrotatedCircleX, unrotatedCircleY, closestX, closestY );

		if ( distance < circle.r) {
			collision = true;
		}
		else {
			collision = false;
		}
		return collision;

	},
    areCirclesColliding: function(shape1, shape2)
	{
		//console.log(shape1)
		//console.log(shape2)
		var circ1 = {
			x: shape1.x * ((scene.scaleX * !shape1.fixed) || 1) + scene.translateX * !shape1.fixed,
			y: shape1.y * ((scene.scaleY * !shape1.fixed) || 1) + scene.translateY * !shape1.fixed,
			r: (shape1.r || Math.min(shape1.height, shape1.width) / 2) * ((scene.scaleX * !shape1.fixed) || 1)
		}
		var circ2 = {
			x: shape2.x * ((scene.scaleX * !shape2.fixed) || 1) + scene.translateX * !shape2.fixed,
			y: shape2.y * ((scene.scaleY * !shape2.fixed) || 1) + scene.translateY * !shape2.fixed,
			r: (shape2.r || Math.min(shape1.height, shape1.width) / 2) * ((scene.scaleX * !shape2.fixed) || 1)
		}

		var dx = (circ1.x) - (circ2.x)
		var dy = (circ1.y) - (circ2.y)
		return dx * dx + dy * dy < (circ1.r + circ2.r) * (circ1.r + circ2.r)
	}
}

var canvas = undefined;



function start(){

	canvas = document.getElementById('canvas') || document.getElementById('game');
	if (canvas.getContext){

		scene = new Scene(canvas);
		scene.ctx = canvas.getContext('2d');
		//scene.ctx.rotate(Math.PI / 20)

		function getBorders()
		{

			scene.rect = canvas.getBoundingClientRect();
			setTimeout(function(){
				scene.rect = canvas.getBoundingClientRect();
				scene.canvasX = scene.rect.left;
				scene.canvasY = scene.rect.top;
				scene.center = {
					x: scene.rect.width / 2,
					y: scene.rect.height / 2
				}
				scene.scaleCX = scene.center.x;
				scene.scaleCY = scene.center.y;
				//console.log(($("#stage").width()) + " " + $("#stage")[0].width + " " + (scene.rect.width - (canvas.clientLeft * 2)) + " " + ($("#stage").height()) + " " + $("#stage")[0].height + " " + (scene.rect.height - (canvas.clientTop * 2)));
			}, 250)		//250 seemed like a consistently successful delay after fullscreen has been exited/entered
		}
		getBorders();
		window.addEventListener('resize', getBorders)
		scene.canvas.origSize = {};
		scene.canvas.origSize.height = scene.rect.height;
		scene.canvas.origSize.width = scene.rect.width;



		function onMouseMove(event) {
			Library.mouse.lastEvent = jQuery.extend({}, event);
			scene.setMousePos()
			if (scene.canvas.style.cursor != "none")
			{
				var none = true;
				for (var i = 0; i < scene.shapes.length; i++)
				{

					if (scene.shapes[i].linked && scene.shapes[i] != undefined && colliding(Library.mouse, scene.shapes[i]))
					{
						scene.canvas.style.cursor = "pointer";
						none = false;
					}
				}
				if (none)
				{
					scene.canvas.style.cursor = Library.mouse.form;
				}
			}

			for (var i = 0; i < scene.mouseMoveShapes.length; i++)
			{
				if (scene.mouseMoveShapes[i].shape.visible && colliding(Library.mouse, scene.mouseMoveShapes[i].shape))
				{
					scene.mouseMoveShapes[i].func.call(scene.mouseMoveShapes[i].shape, {target:scene.mouseMoveShapes[i].shape, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseMove", forced: false});
				}
			}
			//MOUSEENTER EVENT LISTENER LOGIC
			for (var i = 0; i < scene.mouseEnterShapes.length; i++)
			{
				if (scene.mouseEnterShapes[i].shape.visible && colliding(Library.mouse, scene.mouseEnterShapes[i].shape))
				{

					if (!scene.mouseEnterShapes[i].over)
					{
						scene.mouseEnterShapes[i].over = true;
						scene.mouseEnterShapes[i].func.call(scene.mouseEnterShapes[i].shape, {target:scene.mouseEnterShapes[i].shape, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseEnter", forced: false});
					}
				}
				else
				{
					scene.mouseEnterShapes[i].over = false;
				}
			}
			//MOUSELEAVE EVENT LISTENER LOGIC
			for (var i = 0; i < scene.mouseLeaveShapes.length; i++)
			{
				var collided = colliding(Library.mouse, scene.mouseLeaveShapes[i].shape)
				if (!collided && scene.mouseLeaveShapes[i].shape.visible)
				{
					if (scene.mouseLeaveShapes[i].over)
					{
						scene.mouseLeaveShapes[i].over = false;
						scene.mouseLeaveShapes[i].func.call(scene.mouseLeaveShapes[i].shape, {target:scene.mouseLeaveShapes[i].shape, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseLeave", forced: false});
					}
				}
				else if (collided)
				{
					scene.mouseLeaveShapes[i].over = true;
				}
			}



		}
		canvas.addEventListener("mousemove", onMouseMove);

		function mouseDownHandler(event)
		{
			if (lastClicked == scene.canvas || $("#stage:hover")[0] === scene.canvas)
			{
				event.preventDefault();
			}
			if (event.which == 1)
			{
				Library.mouse.leftDown = true
			}
			else if (event.which == 2)
			{
				Library.mouse.middleDown = true
			}
			else if (event.which == 3)
			{
				Library.mouse.rightDown = true
			}

			Library.mouse.origXPos = Library.mouse.x;
			Library.mouse.origYPos = Library.mouse.y;

			Library.mouse.origCanvasXPos = Library.mouse.canvasXPos;
			Library.mouse.origCanvasYPos = Library.mouse.canvasYPos;

			for (var i = 0; i < scene.mouseDownShapes.length; i++)
			{
				if (colliding(Library.mouse, scene.mouseDownShapes[i].shape) && scene.mouseDownShapes[i].shape.visible)
				{
					scene.mouseDownShapes[i].func.call(scene.mouseDownShapes[i].shape, {target:scene.mouseDownShapes[i].shape, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseDown", forced: false});
				}
			}
			for (var i = 0; i < scene.clickShapes.length; i++)
			{
				if (colliding(Library.mouse, scene.clickShapes[i].shape) && scene.clickShapes[i].shape.visible)
				{
					scene.clickShapes[i].down = true;
				}
				else
				{
					scene.clickShapes[i].down = false;
				}
			}
		};
		canvas.addEventListener("mousedown", mouseDownHandler)


		function mouseUpHandler(event)
		{
			if (event.which == 1)
			{
				Library.mouse.leftDown = false
			}
			else if (event.which == 2)
			{
				Library.mouse.middleDown = false
			}
			else if (event.which == 3)
			{
				Library.mouse.rightDown = false
			}
			for (var i = 0; i < scene.mouseUpShapes.length; i++)
			{
				if (colliding(Library.mouse, scene.mouseUpShapes[i].shape) && scene.mouseUpShapes[i].shape.visible)
				{
					scene.mouseUpShapes[i].func.call(scene.mouseUpShapes[i].shape, {target:scene.mouseUpShapes[i].shape, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseUp", forced: false});
				}
			}
			for (var i = 0; i < scene.clickShapes.length; i++)
			{
				if (colliding(Library.mouse, scene.clickShapes[i].shape) && scene.clickShapes[i].down == true && scene.clickShapes[i].shape.visible)
				{
					scene.clickShapes[i].func.call(scene.clickShapes[i].shape, {target:scene.clickShapes[i].shape, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"click", forced: false});
				}
			}
		}
		canvas.addEventListener("mouseup", mouseUpHandler)


		function mouseWheelHandler(e)
		{
			var e = window.event || e;
			Library.mouse.wheel = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		}
		if (Library.isFirefox)
		{
			window.addEventListener('DOMMouseScroll', mouseWheelHandler);
		}
		else
		{
			canvas.addEventListener("mousewheel", mouseWheelHandler);
		}


		window.ongoingTouchIndexById = function(idToFind)
		{
			for (var i = 0; i < Library.touches.length; i++)
			{
				if (Library.touches[i].id == idToFind)
				{
					return i;
				}
			}
			return -1;    // not found
		}


		function handleStart(event)
		{
			event.preventDefault()
			for (var i = 0; i < event.changedTouches.length; i++)
			{
				var touch = event.changedTouches[i]
                var baseX = (event.changedTouches[i].pageX - canvas.offsetLeft)
                var baseY = (event.changedTouches[i].pageY - canvas.offsetTop)
				Library.touches.push({
					id: touch.identifier,
					x: ((baseX * canvas.width / parseInt(canvas.style.width)) - scene.translateX) / scene.scaleX,
					y: ((baseY * canvas.height / parseInt(canvas.style.height)) - scene.translateY) / scene.scaleY,
					origX: ((baseX * canvas.width / parseInt(canvas.style.width)) - scene.translateX) / scene.scaleX,
					origY: ((baseY * canvas.height / parseInt(canvas.style.height)) - scene.translateY) / scene.scaleY,
					canvasXPos: (baseX) * (canvas.width / parseInt(canvas.style.width)),
					canvasYPos: (baseY) * (canvas.height / parseInt(canvas.style.height)),
					origCanvasXPos: (baseX) * (canvas.width / parseInt(canvas.style.width)),
					origCanvasYPos: (baseY) * (canvas.height / parseInt(canvas.style.height)),
                })
			}
		}
		canvas.addEventListener("touchstart", handleStart, false);

		function handleMove(event)
		{
			event.preventDefault()
			for (var i = 0; i < event.changedTouches.length; i++)
			{
                for (var j = 0; j < Library.touches.length; j++) {
                    if (Library.touches[j].id == event.changedTouches[i].identifier) {
                        var baseX = (event.changedTouches[i].pageX - canvas.offsetLeft)
                        var baseY = (event.changedTouches[i].pageY - canvas.offsetTop)

                        Library.touches[j].x = ((baseX * canvas.width / parseInt(canvas.style.width)) - scene.translateX) / scene.scaleX;
                        Library.touches[j].y = ((baseY * canvas.height / parseInt(canvas.style.height)) - scene.translateY) / scene.scaleY;

                        Library.touches[j].canvasXPos = (baseX) * (canvas.width / parseInt(canvas.style.width));
                        Library.touches[j].canvasYPos = (baseY) * (canvas.height / parseInt(canvas.style.height));
                    }
                }
			}
		}
		canvas.addEventListener("touchmove", handleMove, false);

		function handleEnd(event)
		{
			setTimeout(function(){
				for (var i = 0; i < event.changedTouches.length; i++)
				{
					var idx = ongoingTouchIndexById(event.changedTouches[i].identifier)
					if (idx >= 0)
					{
						Library.touches.splice(idx, 1);
					}
				}
			}, 10)
		}
		canvas.addEventListener("touchend", handleEnd, false);

		function handleCancel(event){
			if (lastClicked == scene.canvas || $("#stage:hover")[0] === scene.canvas)
			{
				event.preventDefault();
			}
			console.log("cancelled")

			var touches = event.changedTouches;

			for (var i = 0; i < touches.length; i++)
			{
				Library.touches.splice(i, 1);  // remove it; we're done
			}
		}

		function keyDownHandler(event)
		{
			Library.keyboard.keyPressed = true;
			var event = window.event || event;
			Library.keyboard.lastPressed = event.keyCode;
			if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1)
			{
				if (lastClicked == scene.canvas || $("#stage:hover")[0] === scene.canvas)
				{
					event.preventDefault();
				}
			}
			if(Library.keyboard.keyDown.indexOf(event.keyCode) == -1)
			{
				Library.keyboard.keyDown.push(event.keyCode);
			}
		}
		window.addEventListener("keydown", keyDownHandler, false);

		function keyUpHandler(e)
		{
			var e = window.event || e;
			Library.keyboard.keyDown.splice(Library.keyboard.keyDown.indexOf(e.keyCode), 1);
			if (Library.keyboard.keyDown.indexOf(e.keyCode) == -1)
			{
				Library.keyboard.lastPressed = e.keyCode;
			}
			if (Library.keyboard.keyDown.length == 0)
			{
				Library.keyboard.keyPressed = false;
			}
			Library.keyboard.keyUp = e.keyCode;
		}
		window.addEventListener("keyup", keyUpHandler, false);

		function handleTabLeave(event)
		{
			for (var i = 0; i < Library.keyboard.keyDown.length; i++)
			{
				var eventObj = document.createEventObject ? document.createEventObject() : document.createEvent("Events");
				if(eventObj.initEvent){
					eventObj.initEvent("keyup", true, true);
				}
				eventObj.keyCode = Library.keyboard.keyDown[i];
				eventObj.which = Library.keyboard.keyDown[i];
				document.body.dispatchEvent ? document.body.dispatchEvent(eventObj) : document.body.fireEvent("onkeyup", eventObj);
			}
		}
		window.addEventListener("blur", handleTabLeave);

		function contextMenu()
		{
			return scene.contextMenu;
		}
		scene.canvas.oncontextmenu = contextMenu;

		Shape = function(x, y) {
			if (this.type != 'line')
			{
				this.x = x;
				this.y = y;
			}
			this.rotation = 0;
			this.visible = true;
			this.fixed = false;
			this.linked = false;
			this.centered = false;
			if (this.opacity === undefined)
			{
				this.opacity = 1;
			}
			this.events = {
				mouseDown: [],
				mouseUp: [],
				mouseEnter: [],
				mouseLeave: [],
				mouseMove: [],
				click: [],
			}
			this.animations = {};
			this.colorAnimations = {};

			scene.addShape(this);

			this.fadeIn = function(time, callBack)
            {
                if (!this.visible) {
                    this.opacity = 0;
                }
				this.visible = true;
				this.animate({opacity: 1}, (!time && time === 0) ? 0 : 400, "linear", callBack)
			}
			this.fadeOut = function(time, callBack)
            {
                callBack = callBack || (function () { })
				this.animate({opacity: 0}, (!time && time === 0) ? 0 : 400, "linear", function(){
					this.visible = false;
					callBack.call(this);
				})
			}
			this.animate = function(propObj, duration, ease, callBack)
			{
				if (arguments.length === 0)
				{
					throw "Error: Expected between 1-4 arguments. 0 given.";
				}
				if (!((typeof duration !== "number" || arguments.length > 1) || (typeof ease !== "string" || arguments.length > 2) || (typeof callBack !== "function" || arguments.length > 3)))
				{
					throw "Error: Unexpected parameters. Expected (object [, number] [, string] [, function])";
				}
				var that = this;
				var completed = 0;
                if (duration == undefined) {
                    duration = 400;
                }
				for (var key in propObj)
				{
					if (key.toLowerCase().includes("color"))
					{
						var obj = {}
						obj[key] = propObj[key];
						this.animateColor(obj, duration, ease || "linear", callBack || new Function())
					}
					else
					{
						if (that.animations[key])
						{
							clearInterval(this.animations[key].interval)
						}
						that.animations[key] = {};
						that.animations[key].origValue = that[key];
						that.animations[key].step = 0;
						that.animations[key].change = (propObj[key] - that[key]);
						that.animations[key].percentComplete = 0;
						that.animations[key].functionThing = 0;


						this.animations[key].interval = setInterval(function(key){
							that.animations[key].step++;
							that.animations[key].percentComplete = 10 * that.animations[key].step / duration;
							that.animations[key].functionThing = Library.easings[ease||"linear"](that.animations[key].percentComplete)
							that[key] = that.animations[key].origValue + that.animations[key].change * that.animations[key].functionThing//change * percentComplete;
							if (that.animations[key].percentComplete >= 1 || that.animations[key].percentComplete === Infinity)
							{
								clearInterval(that.animations[key].interval)
								delete that.animations[key];
								that[key] = propObj[key]
                                completed++;
								if (completed === Object.keys(propObj).length && callBack)
								{
									callBack.call(that);
								}
							}
						}, 10, key)
					}
				}
			}
			this.animateColor = function(propObj, duration, ease, callBack)
			{
				if (arguments.length === 0)
				{
					throw "Error: Expected between 1-4 arguments. 0 given.";
				}
				if (!((typeof duration !== "number" || arguments.length > 1) || (typeof ease !== "string" || arguments.length > 2) || (typeof callBack !== "function" || arguments.length > 3)))
				{
					throw "Error: Unexpected parameters. Expected (object [, number] [, string] [, function])";
				}
				var that = this;
				var completed = 0;
				var duration = duration || 400;
				for (var key in propObj)
				{
					that.colorAnimations[key] = {};
					var oldColor = parseCSSColor(that[key]);
					var newColor = parseCSSColor(propObj[key]);

					that.colorAnimations[key].step = 0;
					that.colorAnimations[key].percentComplete = 0;
					that.colorAnimations[key].functionThing = 0;

					var keys = ["r", "g", "b", "a"]
					for (var i = 0; i < keys.length; i++)
					{
						that.colorAnimations[key][keys[i]] = {};
						that.colorAnimations[key][keys[i]].origValue = oldColor[i];
						that.colorAnimations[key][keys[i]].change = newColor[i] - oldColor[i];
					}

					that.colorAnimations[key].interval = setInterval(function(key){
						that.colorAnimations[key].step++;
						that.colorAnimations[key].percentComplete = 10 * that.colorAnimations[key].step / duration;
						that.colorAnimations[key].functionThing = Library.easings[ease||"linear"](that.colorAnimations[key].percentComplete)
						var r = that.colorAnimations[key].r.origValue + that.colorAnimations[key].r.change * that.colorAnimations[key].functionThing
						var g = that.colorAnimations[key].g.origValue + that.colorAnimations[key].g.change * that.colorAnimations[key].functionThing
						var b = that.colorAnimations[key].b.origValue + that.colorAnimations[key].b.change * that.colorAnimations[key].functionThing
						var a = that.colorAnimations[key].a.origValue + that.colorAnimations[key].a.change * that.colorAnimations[key].functionThing
						that[key] = "rgba(" + Math.round(r) + ", " + Math.round(g) + ", " + Math.round(b) + ", " + Math.round(a) + ")";
						if (that.colorAnimations[key].percentComplete === 1)
						{
							clearInterval(that.colorAnimations[key].interval)
							delete that.colorAnimations[key];
							that[key] = propObj[key]
							completed++;
							if (completed === Object.keys(propObj).length && callBack)
							{
								callBack.call(that);
							}
						}
					}, 10, key)
				}
			}
			this.stopAnimation = function()
            {
				if (arguments.length === 0)
				{
					for (var key in this.animations)
					{
						clearInterval(this.animations[key].interval);
						delete this.animations[key];
					}
					for (var key in this.colorAnimations)
					{
						clearInterval(this.colorAnimations[key].interval);
						delete this.colorAnimations[key];
					}
					return;
				}
				for (var i = 0; i < arguments[i]; i++)
				{
					clearInterval(this.animations[arguments[i]].interval);
					delete this.animations[arguments[i]];
				}
			}
			this.setProperties = function(propObj)
			{
				for (var key in propObj)
				{
					this[key] = propObj[key];
				}
				return this;
			}

			this.trigger = function(method)
			{
				if (method == "mouseDown")
				{
					for (var i = 0; i < this.events.mouseDown.length; i++)
					{
						this.events.mouseDown[i].func.call(this, {target:this, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseDown", forced: true});
					}
				}
				else if (method == "mouseUp")
				{
					for (var i = 0; i < this.events.mouseUp.length; i++)
					{
						this.events.mouseUp[i].func.call(this, {target:this, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseUp", forced: true});
					}
				}
				else if (method == "mouseEnter")
				{
					for (var i = 0; i < this.events.mouseEnter.length; i++)
					{
						this.events.mouseEnter[i].func.call(this, {target:this, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseEnter", forced: true});
					}
				}
				else if (method == "mouseLeave")
				{
					for (var i = 0; i < this.events.mouseLeave.length; i++)
					{
						this.events.mouseLeave[i].func.call(this, {target:this, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseLeave", forced: true});
					}
				}
				else if (method == "mouseMove")
				{
					for (var i = 0; i < this.events.mouseMove.length; i++)
					{
						this.events.mouseMove[i].func.call(this, {target:this, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"mouseMove", forced: true});
					}
				}
				else if (method == "click")
				{
					for (var i = 0; i < this.events.click.length; i++)
					{
						this.events.click[i].func.call(this, {target:this, screenX:Library.mouse.x, screenY:Library.mouse.y, type:"click", forced: true});
					}
				}
			}

			this.addEventListener = function(method, func)
			{
				if (method == "mouseDown")
				{
					var eventObject = {shape:this, func:func}
					this.events.mouseDown.push(eventObject)
					scene.mouseDownShapes.push(eventObject)
				}
				else if (method == "mouseUp")
				{
					var eventObject = {shape:this, func:func}
					this.events.mouseUp.push(eventObject)
					scene.mouseUpShapes.push(eventObject)
				}
				else if (method == "mouseEnter")
				{
					var eventObject = {shape:this, func:func, over:false}
					this.events.mouseEnter.push(eventObject)
					scene.mouseEnterShapes.push(eventObject)
				}
				else if (method == "mouseLeave")
				{
					var eventObject = {shape:this, func:func, over:false}
					this.events.mouseLeave.push(eventObject)
					scene.mouseLeaveShapes.push(eventObject)
				}
				else if (method == "mouseMove")
				{
					var eventObject = {shape:this, func:func}
					this.events.mouseMove.push(eventObject)
					scene.mouseMoveShapes.push(eventObject)
				}
				else if (method == "click")
				{
					var eventObject = {shape:this, func:func, over:false, down:false}
					this.events.click.push(eventObject)
					scene.clickShapes.push(eventObject)
				}
			}

			this.removeEventListener = function(method, func)
			{
				if (!method || method == "mouseDown")
				{
					for (var i = 0; i < scene.mouseDownShapes.length; i++) {
						if (scene.mouseDownShapes[i].shape === this && (scene.mouseDownShapes[i].func === func || func === undefined)) {
							scene.mouseDownShapes.splice(i, 1);
						}
					}
					for (var i = 0; i < this.events.mouseDown.length; i++)
					{
						if (this.events.mouseDown[i].func == func || func === undefined)
						{
							this.events.mouseDown.splice(i, 1);
						}
					}
				}
				if (!method || method == "mouseUp")
				{
					for (var i = 0; i < scene.mouseUpShapes.length; i++)
					{
						if (scene.mouseUpShapes[i].shape === this && (scene.mouseUpShapes[i].func === func || func === undefined)) {
							scene.mouseUpShapes.splice(i, 1);
						}
					}
					for (var i = 0; i < this.events.mouseUp.length; i++)
					{
						if (this.events.mouseUp[i].func == func || func === undefined)
						{
							this.events.mouseUp.splice(i, 1);
						}
					}
				}
				if (!method || method == "mouseEnter")
				{
					for (var i = 0; i < scene.mouseEnterShapes.length; i++)
					{
						if (scene.mouseEnterShapes[i].shape === this && (scene.mouseEnterShapes[i].func === func || func === undefined)) {
							scene.mouseEnterShapes.splice(i, 1);
						}
					}
					for (var i = 0; i < this.events.mouseEnter.length; i++)
					{
						if (this.events.mouseEnter[i].func == func || func === undefined)
						{
							this.events.mouseEnter.splice(i, 1);
						}
					}
				}
				if (!method || method == "mouseLeave")
				{
					for (var i = 0; i < scene.mouseLeaveShapes.length; i++)
					{
						if (scene.mouseLeaveShapes[i].shape === this && (scene.mouseLeaveShapes[i].func === func || func === undefined)) {
							scene.mouseLeaveShapes.splice(i, 1);
						}
					}
					for (var i = 0; i < this.events.mouseLeave.length; i++)
					{
						if (this.events.mouseLeave[i].func == func || func === undefined)
						{
							this.events.mouseLeave.splice(i, 1);
						}
					}
				}
				if (!method || method == "click")
				{
					for (var i = 0; i < scene.clickShapes.length; i++)
					{
						if (scene.clickShapes[i].shape === this && (scene.clickShapes[i].func === func || func === undefined)) {
							scene.clickShapes.splice(i, 1);
						}
					}
					for (var i = 0; i < this.events.click.length; i++)
					{
						if (this.events.click[i].func == func || func === undefined)
						{
							this.events.click.splice(i, 1);
						}
					}
				}
			}

			this.toFront = function(){
				if (scene.shapes.indexOf(this) !== -1)
				{
					scene.shapes.splice(scene.shapes.indexOf(this), 1)
					scene.shapes.push(this)
				}
			}
			this.toBack = function(){
				scene.shapes.splice(scene.shapes.indexOf(this), 1)
				scene.shapes.unshift(this)
			}
			this.changePosition = function(x, y, fixed, visible, opacity, sizeOne, sizeTwo){
				if (arguments.length > 0)
				{
					this.x = x;
					this.y = y;
				}
				if (arguments.length > 2 && fixed != -1)
				{
					this.fixed = fixed;
				}
				if (arguments.length > 3 && visible != -1)
				{
					this.visible = visible;
				}
				if (arguments.length > 4 && opacity != -1)
				{
					this.opacity = opacity;
				}
				if (this.type == 'rect' || this.type == "circ")
				{
					if (arguments.length > 5 && sizeOne != -1)
					{
						if (this.type == 'rect')
						{
							this.width = sizeOne;
						}
						if (this.type == 'circ')
						{
							this.r = sizeOne;
						}
					}
					if (arguments.length > 6 && sizeTwo != -1)
					{
						if (this.type == 'rect')
						{
							this.height = sizeTwo;
						}
						if (this.type == 'circ')
						{
							throw "Unexpected arguments";
						}
					}
					if (arguments.length > 7 && this.type == 'rect')
					{
						throw "Unexpected arguments";
					}
				}
				else if (arguments.length < 2)
				{
					throw "Possible argument counts: 2, 3, 4, 5, 6 if circle, 7 if rectangle. Arguments given: " + arguments.length;
				}
			}
			this.delete = function(){
				this.removeEventListener();
				if(scene.shapes[scene.shapes.indexOf(this)] === this)
				{
					scene.shapes.splice(scene.shapes.indexOf(this), 1)
				}
			}
		}

		Rectangle = function(x, y, w, h, c)
		{
			this.width = w;
			this.height = h;
			this.color = c;
			this.type = "rect";
			this.padding = 0;
			this.paddingTop = 0;
			this.paddingRight = 0;
			this.paddingBottom = 0;
			this.paddingLeft = 0;
			this.border = false;
			this.borderColor = "#FFFFFF";
			this.borderSize = 2;
			this.borderRadius = 0;
			this.borderDotOffset = 0;
			this.borderDots = [0, 0]
			this.hollow = false;
			this.path = new Path2D()
			this.path.rect((-(this.width/2) - (this.paddingLeft || this.padding)), (-(this.height/2) - (this.paddingTop || this.padding)), (this.width + (this.paddingLeft || (this.padding)) + (this.paddingRight || (this.padding))), (this.height + (this.paddingTop || (this.padding)) + (this.paddingBottom || (this.padding))));

			/* Any variables that might change, but need to be tracked */
			var lastWidth = this.width;
			var lastHeight = this.height;
			var lastBorderRadius = this.borderRadius;

			this.draw = function(){
				if (lastWidth !== this.width || lastHeight !== this.height || lastBorderRadius !== this.borderRadius)
				{
					this.path = new Path2D()
					if (this.borderRadius)
					{
						this.path.roundRect((-(this.width/2) - (this.paddingLeft || this.padding)), (-(this.height/2) - (this.paddingTop || this.padding)), (this.width + (this.paddingLeft || (this.padding)) + (this.paddingRight || (this.padding))), (this.height + (this.paddingTop || (this.padding)) + (this.paddingBottom || (this.padding))), this.borderRadius);
					}
					else
					{
						this.path.rect((-(this.width/2) - (this.paddingLeft || this.padding)), (-(this.height/2) - (this.paddingTop || this.padding)), (this.width + (this.paddingLeft || (this.padding)) + (this.paddingRight || (this.padding))), (this.height + (this.paddingTop || (this.padding)) + (this.paddingBottom || (this.padding))));
					}
					lastWidth = this.width;
					lastHeight = this.height;
					lastBorderRadius = this.borderRadius;
				}
				if (!this.hollow)
				{
					scene.ctx.fillStyle = this.color;
					scene.ctx.fill(this.path);
				}
				if (this.border)
				{
					scene.ctx.lineWidth = this.borderSize;
					scene.ctx.strokeStyle = this.borderColor;
					scene.ctx.lineDashOffset = this.borderDotOffset;
					scene.ctx.setLineDash(this.borderDots);
					scene.ctx.stroke(this.path);
				}

			}
			Shape.prototype.constructor.call(this, x, y);
		}

		Text = function(x, y, str, s, font, c, style){
			this.x = x;
			this.y = y;
			this.color = c;
			this.type = "rect";
			this.size = s;
			this.font = font;
			this.align = "left"
			this.padding = 0;
			this.border = false;
			this.back = false;
			this.backColor = "#AAAAAA";
			this.backBorder = false;
			this.backBorderColor = "#000000";
			this.borderColor = "#000000"
			this.borderSize = 2;
			this.backBorderSize = 2;
			this.backBorderRadius = 0;
			this.backBorderDotOffset = 0;
			this.backBorderDots = [0, 0];
			this.paddingTop = 0;
			this.paddingLeft = 0;
			this.paddingRight = 0;
			this.paddingBottom = 0;
			this.lineHeight = 0;
			this.linePadding = 4;

			var usable;
			var scopeText = str + "";

			Object.defineProperties(this,
				{
					"text": {
						"get": function() {
							return scopeText;
						},
						"set": function(str) {
							scopeText = str + ""
							this.changeText()
						}
					}
				}
			);

			//The line separating regex expression returns NULL if string is empty


			this.style = style || ""
			scene.ctx.font = this.style + " " + this.size + "px " + this.font;
			this.size = s;

			findUsable(this, scopeText)
			findDimensions(this);

			this.changeText = function(changeObj)
            {
                var newDimensions;
                //console.log(!!changeObj)
				if (changeObj)
                {
                    newDimensions = !!(changeObj.text && scopeText !== changeObj.text) || !!(changeObj.size && changeObj.size !== this.size) || !!(changeObj.font && changeObj.font !== this.font) || !!(changeObj.linePadding && changeObj.linePadding !== this.linePadding) || !!(changeObj.style && changeObj.style !== this.style);
                    //debugger;
                    //console.log(!!(changeObj.text && scopeText !== changeObj.text) || !!(changeObj.size && changeObj.size !== this.size) || !!(changeObj.font && changeObj.font !== this.font) || !!(changeObj.linePadding && changeObj.linePadding !== this.linePadding) || !!(changeObj.style && changeObj.style !== this.style))
                    for (var key in changeObj)
					{
						this[key] = changeObj[key];
					}
				}
				else
				{
					var newDimensions = true;
				}
				scopeText += "";

                this.lines = scopeText.split("\n");//.split("\n");//.match(/.*([^\r\n])/g) || [scopeText];
				if (newDimensions)
				{
					findDimensions(this);
					findUsable(this, scopeText)
				}
			}

			this.fitText = function(width, height)
			{
				scene.ctx.font = this.style + " " + this.size + "px " + this.font;
                this.lines = [];
				var newLines = this.text.split("\n");
				for (var i = 0; i < newLines.length; i++)
				{
					var currentLine = "";
					var otherNewLines = [];
					var currentLineWidth = 0;
					if (newLines[i] !== "\n")
					{
                        var words = newLines[i].match(/[^ ]+(\W+|.$)+/gmi) || ""; //If newLines[i] is empty (ie ""), the for loop errors out because *words* is null
						for (var j = 0; j < words.length; j++)
						{

							var newWidth = scene.ctx.measureText(words[j]).width
							if (currentLineWidth + newWidth < width)
							{
								currentLine += words[j];
								currentLineWidth += newWidth;
							}
							else
							{
								otherNewLines.push(currentLine)
								currentLine = words[j]
								currentLineWidth = newWidth;
							}
						}
						otherNewLines.push(currentLine)
					}

					for (var j = 0; j < otherNewLines.length; j++)
                    {
                        this.lines.push(otherNewLines[j]);
                    }

				}

                //this.lines = newText.split("\n");//.match(/.*([^\r?\n])/gmi);
				/*if (this.lines[0] == "\n")
				{
					this.lines.splice(0, 1)
                }
                if (this.lines[this.lines.length - 1] == "") { //TO DO: Get rid of this. Shouldn't need to remove it. Just prevent it from being added in the first place.
                    this.lines.splice(this.lines.length - 1, 1)
                }*/
				findDimensions(this);
			}

            this.draw = function () {
                var alignOffset = 0;
				if (this.align == "start" || this.align == "left")
				{
					alignOffset = 0;
				}
				else if (this.align == "end" || this.align == "right")
				{
					alignOffset = this.width;
				}
				else if (this.align == "center" || this.align == "middle")
				{
					alignOffset = this.width / 2;
                }


				if (this.back || this.backBorder)
				{
					scene.ctx.beginPath();
					if (this.backBorderRadius)
					{
						scene.ctx.roundRect((-(this.width/2) - (this.paddingLeft || this.padding)), (-(this.height/2) - (this.paddingTop || this.padding)), (this.width + (this.paddingLeft || (this.padding)) + (this.paddingRight || (this.padding))), (this.height + (this.paddingTop || (this.padding)) + (this.paddingBottom || (this.padding))), this.backBorderRadius);
					}
					else
					{
                        scene.ctx.rect((-(this.width / 2) - (this.paddingLeft || this.padding)), (-(this.height / 2) - (this.paddingTop || this.padding)), (this.width + (this.paddingLeft || (this.padding)) + (this.paddingRight || (this.padding))), (this.height + (this.paddingTop || (this.padding)) + (this.paddingBottom || (this.padding))));
					}
				}
				if (this.back)
				{
					scene.ctx.fillStyle = this.backColor;
					scene.ctx.fill();
				}
				if (this.backBorder)
				{
					scene.ctx.lineWidth = this.backBorderSize;
					scene.ctx.strokeStyle = this.backBorderColor;

					scene.ctx.lineDashOffset = this.backBorderDotOffset;
					scene.ctx.setLineDash(this.backBorderDots);
					scene.ctx.stroke();
				}


				scene.ctx.font = this.style + " " + this.size + "px " + this.font;
				scene.ctx.textBaseline = 'hanging';
				scene.ctx.textAlign = this.align;
				scene.ctx.fillStyle = this.color;
				scene.ctx.strokeStyle = this.borderColor;

                scene.ctx.lineWidth = this.borderSize;
				for (var i = 0; i < this.lines.length; i++)
				{
					if (this.border)
					{
						scene.ctx.strokeText(this.lines[i], alignOffset - (this.width / 2), -(this.height / 2) + this.linePadding * i + this.lineHeight * i);
					}
					scene.ctx.fillText(this.lines[i], alignOffset - (this.width / 2), -(this.height / 2) + this.linePadding * i + this.lineHeight * i);
				}
			}
			Shape.prototype.constructor.call(this, x, y);
		}


		Circle = function(x, y, r, c){
			this.r = r;
			this.color = c;
			this.type = "circ";
			this.padding = 0;
			this.hollow = false;
			this.border = false;
			this.borderColor = "#FFFFFF";
			this.borderSize = 2;
			this.borderDotOffset = 0;
			this.borderDots = [0, 0];
			this.path = new Path2D()
			this.path.arc(0, 0, (this.r + (this.padding * this.border)),0,2*Math.PI);

			/* Any variables that might change, but need to be tracked */
			var lastRadius = this.r;

			this.draw = function(){
				if (lastRadius != this.r)
				{
					this.path = new Path2D()
					this.path.arc(0, 0, (this.r + (this.padding * this.border)),0,2*Math.PI);
				}
				scene.ctx.lineWidth = this.borderSize
				scene.ctx.fillStyle = this.color;
				if (!this.hollow)
				{
					scene.ctx.fill(this.path)
				}
				if (this.border)
				{
					scene.ctx.lineDashOffset = this.borderDotOffset;
					scene.ctx.setLineDash(this.borderDots);
					scene.ctx.strokeStyle = this.borderColor;
					scene.ctx.stroke(this.path);
				}
			}
			Shape.prototype.constructor.call(this, x, y);
			this.centered = false;
		}

		Pixel = function(x, y, c){
			this.color = c;
			this.type = "rect";
			this.width = 1;
			this.height = 1;

			this.draw = function(){
				scene.ctx.fillStyle = this.color;
				scene.ctx.fillRect(-(this.width/2), -(this.height/2), 1, 1);
			}
			Shape.prototype.constructor.call(this, x, y);
		}

		Line = function(coordSetOne, coordSetTwo, width, color){
			this.length = 0;
			this.color = color;
			this.type = "line";
			this.width = width;
			this.coordSet = [{x: coordSetOne.x, y: coordSetOne.y, draw: true}, {x: coordSetTwo.x, y: coordSetTwo.y, draw: true}];
			this.dotOffset = 0;
			this.dots = [0, 0];

			this.changePoint = function(point, x, y)
			{
				if (point > 0)
				{
					this.coordSet[point - 1] = {x:x, y:y, draw: true}
				}
				else if (point < 0)
				{
					this.coordSet[this.coordSet.length + point] = {x:x, y:y, draw: true}
				}
				else
				{
					throw "Point needs to be in range. You entered " + point + ". Range is 0-" + (this.coordSet.length - 1)
				}
			}

			this.animatePoint = function(propObj, duration, ease, callBack) /* propObj should be {point: id, x: x, y: y} or [<thatObj>, <thatObj>]. 1 <= id <= coordSet.length */
			{
				if (!Array.isArray(propObj))
				{
					propObj = [propObj]
				}
				if (arguments.length === 0)
				{
					throw "Error: Expected between 1-4 arguments. 0 given.";
				}
				if (!((typeof duration !== "number" || arguments.length > 1) || (typeof ease !== "string" || arguments.length > 2) || (typeof callBack !== "function" || arguments.length > 3)))
				{
					throw "Error: Unexpected parameters. Expected (object [, number] [, string] [, function])";
				}
				var that = this;
				var completed = 0;
				var duration = duration || 400;

				for (var i = 0; i < propObj.length; i++)
				{
					/* Access each point the same way as changePoint and other Line methods */
					if (propObj[i].point > 0)
					{
						var point = this.coordSet[propObj[i].point - 1]
					}
					else if (propObj[i].point < 0)
					{
						var point = this.coordSet[this.coordSet.length + propObj[i].point]
					}

					if (point.animation)
					{
						clearInterval(point.animation.interval)
					}
					point.animation = {};
					point.animation.origXValue = point.x;
					point.animation.changeX = (propObj[i].x - point.x);
					point.animation.origYValue = point.y;
					point.animation.changeY = (propObj[i].y - point.y);
					point.animation.step = 0;
					point.animation.percentComplete = 0;
					point.animation.functionThing = 0;


					point.animation.interval = setInterval(function(i){
						point.animation.step++;
						point.animation.percentComplete = 10 * point.animation.step / duration;
						point.animation.functionThing = Library.easings[ease||"linear"](point.animation.percentComplete)
						var newX = point.animation.origXValue + point.animation.changeX * point.animation.functionThing;
						var newY = point.animation.origYValue + point.animation.changeY * point.animation.functionThing;
						that.changePoint(propObj[i].point, newX, newY)

						if (point.animation.percentComplete === 1)
						{
							clearInterval(point.animation.interval)
							delete point.animation;
							that.changePoint(propObj[i].point, propObj[i].x, propObj[i].y)
							completed++;
							if (completed === Object.keys(propObj).length && callBack)
							{
								callBack.call(that);
							}
						}
					}, 10, i)
				}
			}

			this.addPoint = function(x, y)
			{
				this.coordSet.push({x:x, y:y, draw: true})
				if (this.coordSet.length > 2)
				{
					var nL = this.coordSet.length - 2;
					var angle = Library.newMath.toFixed((this.coordSet[nL].y - this.coordSet[nL - 1].y) / (this.coordSet[nL].x - this.coordSet[nL - 1].x), 1)
					var newAngle = Library.newMath.toFixed((this.coordSet[nL + 1].y - this.coordSet[nL].y) / (this.coordSet[nL + 1].x - this.coordSet[nL].x), 1)
					if (angle === newAngle)
					{
						this.coordSet[nL].draw = false;
					}
				}
			}

			this.removePoint = function(point)
			{
				if (point > 0)
				{
					this.coordSet.splice(point - 1, 1);
				}
				else if (point < 0)
				{
					this.coordSet.splice(this.coordSet.length + point, 1);
				}
				else
				{
					throw "Point needs to be in range. You entered " + point + ". Range is 0-" + (this.coordSet.length - 1)
				}
			}

			this.clearPoints = function()
			{
				this.coordSet = [];
			}

			this.draw = function()
			{
				if (this.coordSet.length > 1)
				{
					scene.ctx.lineJoin='bevel';
					scene.ctx.beginPath();
					scene.ctx.lineWidth = this.width/scene.scaleX//Math.max(this.width, this.width / scene.scaleX);
					scene.ctx.strokeStyle = this.color;
					scene.ctx.moveTo(this.coordSet[0].x, (this.coordSet[0].y));
					for (var i = 0; i < this.coordSet.length; i++)
					{
						if (this.coordSet[i].draw)
						{
							scene.ctx.lineTo(this.coordSet[i].x, this.coordSet[i].y);
						}
					}
					scene.ctx.lineDashOffset = this.dotOffset;
					scene.ctx.setLineDash(this.dots);
					scene.ctx.stroke();
				}
			}
			Shape.prototype.constructor.call(this);
		}

		Sprite = function(img, x, y, sx, sy, sw, sh, w, h){
			this.img = img;
			this.frame = 0;
			this.width = w;
			this.height = h;
			this.type = "rect";
			this.frameObjs = [];
			this.padding = 0;
			this.border = false;
			this.borderColor = "#FFFFFF";
			this.borderSize = 2;
			this.borderDotOffset = 0;
			this.borderDots = [0, 0];

			this.back = false;
			this.backColor = "#AAAAAA";
			this.backBorder = false;
			this.backBorderColor = "#000000";
			this.backBorderSize = 2;
			this.backBorderDotOffset = 0;
			this.backBorderDots = [0, 0];
			this.borderRadius = 0;

			this.paddingTop = 0;
			this.paddingLeft = 0;
			this.paddingRight = 0;
			this.paddingBottom = 0;
			this.smooth = true;


			if (arguments.length == 9) /* If all parameters are used */
			{
				this.width = w;
				this.height = h;
			}
			else if (arguments.length == 7) /* If x, y are set and img should be cropped */
			{
				/* sx, sy, sw, sh are already set, will be used down below. We don't need to set them. */
				this.width = sw;
				this.height = sh;
			}
			else if (arguments.length == 5) /* If the x, y, width and height values are set */
			{
				this.width = sx; /* If just 5 arguments, then it should look like "new Sprite(img, x, y, width, height)" */
				this.height = sy;
				sx = 0;
				sy = 0;
				sw = this.img.naturalWidth;
				sh = this.img.naturalHeight;
			}
			else if (arguments.length == 3) /* If the bare minimum arguments are used */
			{
				sx = 0;
				sy = 0;
				this.width = this.img.width;
				this.height = this.img.height;
				sw = this.img.naturalWidth;
				sh = this.img.naturalHeight;
			}
			else
			{
				throw "Expected 3, 5, 7, or 9 arguments. Got " + arguments.length;
			}

			this.addFrame = function(sx, sy, sw, sh)
			{
				this.frameObjs.push({
				sx: sx,
				sy: sy,
				sw: sw,
				sh: sh
				})
			}

			this.addFrame(sx, sy, sw, sh)

			this.changeFrame = function(num, changeSize)
			{
				this.frame = +num;
				if (this.frame >= this.frameObjs.length)
				{
					console.log(this)
					throw "Sprite doesn't have " + (this.frame + 1) + " frames."
				}
				this.width = (this.frameObjs[this.frame].sw * changeSize) || this.width; /* Last part makes it possible to scale the image on changeFrame */
				this.height = (this.frameObjs[this.frame].sh * changeSize) || this.height;
			}
			this.changeImage = function(img)
			{
				if (this.width == this.img.width && this.height == this.img.height)
				{
					this.width = img.width;
					this.height = img.height;
					this.frameObjs[0].sw = img.width;
					this.frameObjs[0].sh = img.height;
				}
				this.img = img;

			}

			Shape.prototype.constructor.call(this, x, y);
			this.draw = function()
			{
				if (this.img)
				{
					if (this.back || this.border || this.borderRadius)
					{
						scene.ctx.beginPath();
						if (this.borderRadius)
						{
							scene.ctx.roundRect((-(this.width/2) - this.padding), (-(this.height/2) - this.padding), (this.width + (this.padding * 2)), (this.height + (this.padding * 2)), this.borderRadius);
							scene.ctx.save()
							scene.ctx.clip();
						}
						else
						{
							scene.ctx.rect((-(this.width/2) - this.padding), (-(this.height/2) - this.padding), (this.width + (this.padding * 2)), (this.height + (this.padding * 2)));
						}
					}
					if (this.back)
					{
						scene.ctx.fillStyle = this.backColor;
						scene.ctx.fill();
						if (this.backBorder)
						{
							scene.ctx.lineWidth = this.backBorderSize;
							scene.ctx.strokeStyle = this.backBorderColor;

							scene.ctx.lineDashOffset = this.backBorderDotOffset;
							scene.ctx.setLineDash(this.backBorderDots);
							scene.ctx.stroke();
						}
					}

					scene.ctx.drawImage(this.img,this.frameObjs[this.frame].sx,this.frameObjs[this.frame].sy,this.frameObjs[this.frame].sw,this.frameObjs[this.frame].sh, -(this.width/2), -(this.height/2), this.width, this.height);
					if (this.borderRadius)
					{
						scene.ctx.restore()
					}
					if (this.border)
					{
						scene.ctx.lineDashOffset = this.borderDotOffset;
						scene.ctx.setLineDash(this.borderDots);
						scene.ctx.lineWidth = this.borderSize;
						scene.ctx.strokeStyle = this.borderColor;
						scene.ctx.stroke();//scene.ctx.strokeRect((-(this.width/2) - (this.paddingLeft || this.padding)), (-(this.height/2) - (this.paddingTop || this.padding)), (this.width + (this.paddingLeft || (this.padding)) + (this.paddingRight || (this.padding))), (this.height + (this.paddingTop || (this.padding)) + (this.paddingBottom || (this.padding))));
					}
				}
			}
		}
		var lastCalledTime;

		window.render = function(){
			if(!lastCalledTime) {
				lastCalledTime = Date.now();
				scene.fps = 0;
			}
			else {
				delta = (Date.now() - lastCalledTime)/1000;
				lastCalledTime = Date.now();
				scene.fps = Library.newMath.toFixed((1/delta + scene.fps) / 2, 1);
			}
			for (var i = 0; i < scene.onFrameFunctions.length; i++)
			{
				if (!scene.onFrameFunctions[i].paused)
				{
					scene.onFrameFunctions[i].func();
				}
			}

			scene.ctx.globalAlpha = 1;
			scene.ctx.fillStyle = scene.background.color;
			scene.ctx.fillRect(0, 0, canvas.width, canvas.height)

			if (scene.background.style && scene.background.sources[scene.background.style-1].loaded)
			{
				var width = scene.background.sources[scene.background.style-1].width * scene.scaleX;
				var height = scene.background.sources[scene.background.style-1].height * scene.scaleY;
				var img = scene.background.sources[scene.background.style-1].img;
				for (var i = -1; i < Math.ceil(scene.canvas.width / width) + 1; i++)
				{
					for (var j = -1; j < Math.ceil(scene.canvas.height / height) + 1; j++)
					{
						scene.ctx.translate(scene.translateX * scene.background.distance % width, scene.translateY * scene.background.distance % height)
						scene.ctx.drawImage(img, width * i, height * j, width, height);
						scene.ctx.translate(-scene.translateX * scene.background.distance % width, -scene.translateY * scene.background.distance % height)
					}
				}
			}

			if (scene.axesOn)
			{
				scene.ctx.beginPath();
				scene.ctx.moveTo(scene.translateX * scene.scale, -2147483000);
				scene.ctx.lineTo(scene.translateX * scene.scale, 2147483000);
				scene.ctx.lineWidth = scene.scale;
				scene.ctx.strokeStyle = "#FFFFFF";
				scene.ctx.stroke();

				scene.ctx.beginPath();
				scene.ctx.moveTo(-2147483000, scene.translateY * scene.scale);
				scene.ctx.lineTo(2147483000, scene.translateY * scene.scale);
				scene.ctx.lineWidth = scene.scale;
				scene.ctx.strokeStyle = "#FFFFFF";
				scene.ctx.stroke();
			}
			//console.time("render")
			for (var i = 0; i < scene.shapes.length ; i++)
			{
				if (scene.shapes[i].visible == true)
				{
					scene.ctx.imageSmoothingEnabled = scene.shapes[i].smooth;
					var halfWidth = ((scene.shapes[i].width / 2) * !scene.shapes[i].centered || 0)
					var halfHeight = ((scene.shapes[i].height / 2) * !scene.shapes[i].centered || 0)
					if (scene.shapes[i].align == "center" || scene.shapes[i].align == "middle")
					{
						halfWidth = 0
					}
					else if (scene.shapes[i].align == "right")
					{
						halfWidth *= -1;
					}

					var alignOffset = 0;
					if (scene.shapes[i].align == "end" || scene.shapes[i].align == "right")
					{
						alignOffset = scene.shapes[i].width;
					}
					else if (scene.shapes[i].align == "center" || scene.shapes[i].align == "middle")
					{
						alignOffset = scene.shapes[i].width / 2;
					}

					if (!scene.shapes[i].fixed)
					{
						scene.ctx.translate(scene.translateX, scene.translateY)
						scene.ctx.scale(scene.scaleX, scene.scaleY)
					}

					scene.ctx.translate(scene.shapes[i].x + halfWidth, scene.shapes[i].y + halfHeight)
					scene.ctx.rotate(-(scene.shapes[i].rotation)*(Math.PI/180))

					scene.ctx.globalAlpha = Math.max(0,Math.min(1,scene.shapes[i].opacity));
					scene.shapes[i].draw();

					if (scene.centers)
					{
						scene.ctx.fillStyle = "#00FF00";
						scene.ctx.translate(-halfWidth - alignOffset, -1)
						scene.ctx.fillRect(0, 0, scene.shapes[i].width, 2);
						scene.ctx.translate(halfWidth - 1 + alignOffset, -halfHeight + 1)
						scene.ctx.fillRect(0, 0, 2, scene.shapes[i].height);
					}
					scene.ctx.imageSmoothingEnabled = true;



					scene.ctx.setTransform(1, 0, 0, 1, 0, 0);
				}
			}
			//console.timeEnd("render")
			//debugger;
			window.requestAnimationFrame(render);
		}
		window.requestAnimationFrame(render);

		var playing = true;
		/**********************************************************/
		/* If there is any code to run before starting the game, */
		/* it will be in startUp. startUp should call play, the   */
		/* code to actually start the game. If startUp doesn't   */
		/* exist, just go straight to the game.                  */
		/**********************************************************/
		if (typeof startUp == "function")
		{
			startUp();
		}
		else if (typeof play == "function")
		{
			play();
		}
		else
		{
			playing = false;
			throw "No function found to start game";
		}
		if (!playing)
		{
			play();
		}

	}
	else{
		console.log("Canvas not supported. Try a different browser.")
	}
}
