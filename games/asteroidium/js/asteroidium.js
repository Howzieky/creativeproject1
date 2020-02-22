function startUp(){
	scene.loadImages("demoSprites", "images/demoSprites.png", "demoCursor", "images/demoCursor.png", "bigShip", "images/bigShip.png", "generationShadow","images/shadow.png", "generationClouds","images/clouds.png", "star", "images/star.png", "asteroidium", "images/Asteroidium.png", "ship", "images/ship.png", "iconSheet", "images/gravityImages.png", "bgDisplays", "images/bgDisplays.png", "gravityBigBtns", "images/gravityBigBtns.png", "achievementIcons", "images/achievementIcons.png", "tipArrow", "images/tipArrow.png", "toggleArrow", "images/toggleArrow.png", play)
}

function play()
{
	var generationCanvas = $("<canvas></canvas>")[0];
	generationCanvas.style.width = (generationCanvas.width = 512) + "px";
	generationCanvas.style.height = (generationCanvas.height = 512) + "px";
	var generationCtx = generationCanvas.getContext("2d");

	/* render */
	function generatePlanet(mass){
		/* Size of planets */
		var scale = mass/75000 + .5
		generationCanvas.style.width = (generationCanvas.width = 256 * scale) + "px";
		generationCanvas.style.height = (generationCanvas.height = 256 * scale) + "px";
		/* Clear generationCanvas for redraw */
		generationCtx.clearRect(0, 0, generationCanvas.width, generationCanvas.height);

		/* Select a circle that all shapes will be rendered and cropped to */
		generationCtx.save();
		generationCtx.arc(generationCanvas.width / 2, generationCanvas.height / 2, 128 * scale, 0, 2*Math.PI);
		generationCtx.clip();


		/* Place scene.imageObjects.generationClouds onto planet */
		var textureX = Math.round(Math.random()*256)-256*Math.max(1, scale);
		var textureY = Math.round(Math.random()*256)-256*Math.max(1, scale);
		var textureA = Math.random()*.5 + .5;
		generationCtx.globalAlpha = textureA;
		generationCtx.drawImage(scene.imageObjects.generationClouds, textureX, textureY, scene.imageObjects.generationClouds.naturalWidth * Math.max(1, scale), scene.imageObjects.generationClouds.naturalHeight * Math.max(1, scale))

		/* Color Planet */
		generationCtx.globalAlpha = 1;
		generationCtx.globalCompositeOperation = "multiply";
		var color = "hsl("+Math.random()*256+", "+Math.random()*100+"%, 50%)"
		generationCtx.fillStyle = color;
		generationCtx.fillRect(0,0,generationCanvas.width,generationCanvas.height)

		/* Save planet image */
		var planet = new Image();
		planet.src = generationCanvas.toDataURL();

		/* Clear the canvas and draw the shadow */
		generationCtx.clearRect(0, 0, generationCanvas.width, generationCanvas.height);
		generationCtx.globalCompositeOperation = "source-over";
		generationCtx.globalAlpha = .5
		generationCtx.drawImage(scene.imageObjects.generationShadow, scale*128-355, 0, scene.imageObjects.generationShadow.naturalWidth, generationCanvas.height)

		generationCtx.restore();
		/* Save the shadow separately */
		var shadow = new Image();
		shadow.src = generationCanvas.toDataURL();

		return {planet, shadow, scale, textureX, textureY, textureA, color};
	}
	var behavior = {
		initAdventureShip: function()
		{
			Sprite.prototype.constructor.call(this, scene.imageObjects.ship, this.x, this.y, 0, 0, 15, 23);

			this.addFrame(15, 0, 15, 23)
			this.addFrame(30, 0, 15, 23)
			this.addFrame(45, 0, 15, 23)
			this.setProperties({r: 8, centered: true, smooth: false, bodyType: 2, vertShift: 3})

			this.color = "#8E8E8E";
			this.ready = false;
			this.readyTimer = undefined;
			space.ship = this;
			space.atFront.unshift(this)
		},
		initAdventureStar: function()
		{
			Sprite.prototype.constructor.call(this, scene.imageObjects.star, this.x, this.y);
			this.centered = true;
			this.bodyType = 3;
			this.r = 385;
			space.star = this;
		},
		initAdventurePlanet: function (argObj)
		{
			Sprite.prototype.constructor.call(this, argObj.planet, this.x, this.y);

			this.shadow = new Sprite(argObj.shadow, this.x, this.y);
			this.shadow.centered = true;

			this.setProperties({border: true, borderRadius: 1000, borderColor: "black"});
			this.centered = true;
			this.bodyType = 0;
			this.r = this.width / 2;
			this.vr = Math.random();

			/* Shapes that will move with the planet. X and Y are the offsets */
			this.attached = [{shape: this.shadow, x: 0, y: 0}]

			//this.setProperties({borderSize: 1.5, borderColor: "#00FFFF"})

		},
		initSandboxPlanet: function()
		{
			Circle.prototype.constructor.call(this, this.x, this.y, space.sizeFormula(this.m), space.colorFormula(this.m));

			this.setProperties({borderSize: 1.5, borderColor: "#00FFFF"})
			this.bodyType = 0;

		},
		initSandboxShip: function()
		{
			Sprite.prototype.constructor.call(this, scene.imageObjects.ship, this.x, this.y, 0, 0, 15, 23);

			this.addFrame(15, 0, 15, 23)
			this.addFrame(30, 0, 15, 23)
			this.addFrame(45, 0, 15, 23)
			this.setProperties({r: 8, centered: true, smooth: false, bodyType: 2})

			this.color = "#8E8E8E";
			this.ready = false;
			this.readyTimer = undefined;
			if (space.ship)
			{
				space.ship.remove();
			}
			space.ship = this;
		},
		enableStar: function(){
			this.starify = function()
			{
				this.bodyType = 1;
				this.border = true;
			}
			if (this.bodyType === 1)
			{
				this.starify();
			}
		},
		enableRemove: function()
		{
			this.delete();
			if (this.connection)
			{
				this.connection.delete();
			}
			if (this == space.bodies[space.bodies.indexOf(this)])
			{
				space.bodies.splice(space.bodies.indexOf(this), 1)
			}
			for (var i = 0; i < this.under.length; i++)
			{
				if (this.under[i].above === this)
				{
					this.under[i].above = undefined;
				}
			}
			this.above = undefined;

			if (space.focus && space.focus.planet == this)
			{
				space.focus.focusing = false;
				space.focus.outline.visible = false;
			}
			if (space.tracing)
			{
				this.trace.dead = true;
			}
			//COME BACK RETURN FIX THIS
			if (space.mainStats)
			{
				space.mainStats.text = "Drag X Velocity: 0.000\nDrag Y Velocity: 0.000\nCelestial Bodies: " + space.bodies.length + "\nMass: " + Library.newMath.toOnes(space.placeSize, 9) + "\nZoom Level: " + Math.round(Math.log(scene.scaleX)/Math.log(10/9))
			}
		},
		enableFocus: function()
		{
			space.focus.planet = this;
			space.focus.focusing = true;
			space.focus.outline.visible = true;
			space.focus.outline.r = this.r * 2;
			space.focus.outline.border = true;
			space.focus.outline.bColor = "#FFFFFF";
			space.focus.outline.x = this.x;
			space.focus.outline.y = this.y;
		},
		enableConnection: function() {
			this.connection = new Line({x:this.x, y:this.y}, {x:this.x, y:this.y}, 1, this.color)
			this.connection.toBack();
			this.orbiting = false;
			this.top = 0;
			this.topP = 0;
			this.topD = 0;

			this.temp = {
				top: 0,
				topP: 0,
				topD: 0
			}
		},
		enableTrace: function() {
			this.trace = new Line({x:this.x, y:this.y}, {x:this.x, y:this.y}, 1, this.color);
			this.trace.clearPoints();
			space.traces.push(this.trace);
			this.trace.toBack();
		},
		setColor: function() {
			this.color = space.colorFormula(this.m);
		},
		setNoise: function(){
			this.seed = Math.random()
			var seed = this.seed;
			//this.perlin = new SimplexNoise(Math)//{random: function(){return seed}})
		},
		adventureCollide: function(obj1, obj2) {
			//console.log(obj1, obj2)
			/*if ((obj1.bodyType == 0 || obj1.bodyType == 1) && (obj2.bodyType == 0 || obj2.bodyType == 1))
			{
				var x,
					y;

				if (obj1.bodyType === obj2.bodyType)
				{
					x = ((obj1.x * obj1.m + obj2.x * obj2.m) / (obj1.m + obj2.m))
					y = ((obj1.y * obj1.m + obj2.y * obj2.m) / (obj1.m + obj2.m))
				}
				else if (obj1.bodyType === 1)
				{
					x = obj1.x
					y = obj1.y
				}
				else if (obj2.bodyType === 1)
				{
					x = obj2.x
					y = obj2.y
				}
				//var newPlanet = createSandboxPlanet(x, y, ((((obj2.bodyType !== 1) * obj1.m) + ((obj1.bodyType !== 1) * obj2.m)) || obj1.m + obj2.m), (((obj1.m*obj1.vx) + (obj2.m*obj2.vx )) / (obj1.m + obj2.m)), (((obj1.m*obj1.vy) + (obj2.m*obj2.vy )) / (obj1.m + obj2.m)));
				if ((obj1.bodyType === 1 || obj2.bodyType === 1))
				{
					newPlanet.starify();
				}


				for (var i = 0; i < obj1.under.length; i++)
				{
					obj1.under[i].above = newPlanet;
					newPlanet.under.push(obj1.under[i]);

					var distance = Math.sqrt((obj1.under[i].x - obj1.x)*(obj1.under[i].x - obj1.x) + (obj1.under[i].y - obj1.y)*(obj1.under[i].y - obj1.y));
					var nx = (obj1.under[i].x - obj1.x) / distance;
					var ny = (obj1.under[i].y - obj1.y) / distance;

					obj1.under[i].x = newPlanet.x + nx * (newPlanet.r + 3)
					obj1.under[i].y = newPlanet.y + ny * (newPlanet.r + 3)
				}
				for (var i = 0; i < obj2.under.length; i++)
				{
					obj2.under[i].above = newPlanet;
					newPlanet.under.push(obj2.under[i]);

					var distance = Math.sqrt((obj2.under[i].x - obj2.x)*(obj2.under[i].x - obj2.x) + (obj2.under[i].y - obj2.y)*(obj2.under[i].y - obj2.y));
					var nx = (obj2.under[i].x - obj2.x) / distance;
					var ny = (obj2.under[i].y - obj2.y) / distance;

					obj2.under[i].x = newPlanet.x + nx * (newPlanet.r + 3)
					obj2.under[i].y = newPlanet.y + ny * (newPlanet.r + 3)
				}

				obj1.remove();
				//obj2.remove();
			}*/
			if (obj1.bodyType === 0 && obj2.bodyType === 0)
			{
				var xDist = obj1.x - obj2.x;
				var yDist = obj1.y - obj2.y;
				var distSquared = xDist * xDist + yDist * yDist
				var xVelocity = obj2.vx - obj1.vx;
				var yVelocity = obj2.vy - obj1.vy;
				var dotProduct = xDist*xVelocity + yDist*yVelocity;
				//Neat vector maths, used for checking if the objects moves towards one another.
				if(dotProduct > 0){
					var collisionScale = dotProduct / distSquared;
					var xCollision = xDist * collisionScale;
					var yCollision = yDist * collisionScale;
					//The Collision vector is the speed difference projected on the Dist vector,
					//thus it is the component of the speed difference needed for the collision.
					var combinedMass = obj1.m + obj2.m;
					var collisionWeightA = 2 * obj2.m / combinedMass;
					var collisionWeightB = 2 * obj1.m / combinedMass;
					obj1.vx += collisionWeightA * xCollision;
					obj1.vy += collisionWeightA * yCollision;
					obj2.vx -= collisionWeightB * xCollision;
					obj2.vy -= collisionWeightB * yCollision;
				}
			}
			else if (obj1.bodyType === 2 || obj2.bodyType === 2)
			{
				//debugger;
				//space.ship.toFront()
				var ship = (obj1.bodyType === 2) ? obj1 : obj2;
				var planet = (obj1.bodyType === 2) ? obj2 : obj1;
				if (ship.above == undefined)
				{
					planet.under.push(ship)
					ship.above = planet;
					var distance = Math.sqrt((ship.x - planet.x)*(ship.x - planet.x) + (ship.y - planet.y)*(ship.y - planet.y));
					var nx = (ship.x - planet.x) / distance;
					var ny = (ship.y - planet.y) / distance;
					ship.x = planet.x + nx * (planet.r + 3)
					ship.y = planet.y + ny * (planet.r + 3)
					ship.rotation = Math.atan2(planet.x - ship.x, planet.y - ship.y) * (180 / Math.PI);
					ship.ready = false;
					ship.readyTimer = setTimeout(function(){
						ship.ready = true;
					}, 200)
				}
				console.log("Hey")
				space.enterPlanetBtn.visible = true;
				space.enterPlanetBtn.trigger("mouseLeave")
				space.enterPlanetBtn.animate({opacity: 1, y: scene.canvas.height - 75}, 250, "outQuad")
			}
			/*else
			{
				alert("what")
				debugger;
			}*/
		},
		sandboxCollide: function(obj1, obj2){
			if ((obj1.bodyType == 0 || obj1.bodyType == 1) && (obj2.bodyType == 0 || obj2.bodyType == 1))
			{
				var x,
					y;

				if (obj1.bodyType === obj2.bodyType)
				{
					x = ((obj1.x * obj1.m + obj2.x * obj2.m) / (obj1.m + obj2.m))
					y = ((obj1.y * obj1.m + obj2.y * obj2.m) / (obj1.m + obj2.m))
				}
				else if (obj1.bodyType === 1)
				{
					x = obj1.x
					y = obj1.y
				}
				else if (obj2.bodyType === 1)
				{
					x = obj2.x
					y = obj2.y
				}
				var newPlanet = createSandboxPlanet(x, y, ((((obj2.bodyType !== 1) * obj1.m) + ((obj1.bodyType !== 1) * obj2.m)) || obj1.m + obj2.m), (((obj1.m*obj1.vx) + (obj2.m*obj2.vx )) / (obj1.m + obj2.m)), (((obj1.m*obj1.vy) + (obj2.m*obj2.vy )) / (obj1.m + obj2.m)));
				if ((obj1.bodyType === 1 || obj2.bodyType === 1))
				{
					newPlanet.starify();
				}

				if (space.tracing)
				{
					obj1.trace.addPoint(newPlanet.x, newPlanet.y)
					obj2.trace.addPoint(newPlanet.x, newPlanet.y)

				}
				if ((space.focus.planet == obj1 || space.focus.planet == obj2) && space.focus.focusing)
				{
					newPlanet.focus();
				}

				for (var i = 0; i < obj1.under.length; i++)
				{
					obj1.under[i].above = newPlanet;
					newPlanet.under.push(obj1.under[i]);

					var distance = Math.sqrt((obj1.under[i].x - obj1.x)*(obj1.under[i].x - obj1.x) + (obj1.under[i].y - obj1.y)*(obj1.under[i].y - obj1.y));
					var nx = (obj1.under[i].x - obj1.x) / distance;
					var ny = (obj1.under[i].y - obj1.y) / distance;

					obj1.under[i].x = newPlanet.x + nx * (newPlanet.r + 3)
					obj1.under[i].y = newPlanet.y + ny * (newPlanet.r + 3)
				}
				for (var i = 0; i < obj2.under.length; i++)
				{
					obj2.under[i].above = newPlanet;
					newPlanet.under.push(obj2.under[i]);

					var distance = Math.sqrt((obj2.under[i].x - obj2.x)*(obj2.under[i].x - obj2.x) + (obj2.under[i].y - obj2.y)*(obj2.under[i].y - obj2.y));
					var nx = (obj2.under[i].x - obj2.x) / distance;
					var ny = (obj2.under[i].y - obj2.y) / distance;

					obj2.under[i].x = newPlanet.x + nx * (newPlanet.r + 3)
					obj2.under[i].y = newPlanet.y + ny * (newPlanet.r + 3)
				}

				obj1.remove();
				obj2.remove();
			}
			else if (obj1.bodyType === 2 || obj2.bodyType === 2)
			{
				var ship = (obj1.bodyType === 2) ? obj1 : obj2;
				var planet = (obj1.bodyType === 2) ? obj2 : obj1;
				if (ship.above == undefined)
				{
					planet.under.push(ship)
					ship.above = planet;
					var distance = Math.sqrt((ship.x - planet.x)*(ship.x - planet.x) + (ship.y - planet.y)*(ship.y - planet.y));
					var nx = (ship.x - planet.x) / distance;
					var ny = (ship.y - planet.y) / distance;
					ship.x = planet.x + nx * (planet.r + 3)
					ship.y = planet.y + ny * (planet.r + 3)
					ship.rotation = Math.atan2(planet.x - ship.x, planet.y - ship.y) * (180 / Math.PI);
					ship.ready = false;
					ship.readyTimer = setTimeout(function(){
						ship.ready = true;
					}, 200)
				}
			}
			else
			{
				alert("what")
				debugger;
			}
		}
	}
	window.space = undefined;
	window.planet = undefined;

	var preset = [];

	scene.background.color = "#000000";
	scene.background.style = 0;
	scene.contextMenu = false;
	scene.background.addBackground("images/backgrounds/1.png")
	scene.background.addBackground("images/backgrounds/2.png")
	scene.background.addBackground("images/backgrounds/3.png")
	scene.background.addBackground("images/backgrounds/4.png")
	scene.background.addBackground("images/backgrounds/5.png")
	scene.background.addBackground("images/backgrounds/6.png")
	scene.background.addBackground("images/backgrounds/7.png")
	scene.background.addBackground("images/backgrounds/8.png")

	window.Galaxy = function(mode)
	{
		this.begin = function()
		{
			this.events.editCorners();
			window.addEventListener("resize", space.events.editCorners)
			window.addEventListener("keydown", space.events.keyDown)
			window.addEventListener("keyup", space.events.keyUp)
			scene.canvas.addEventListener("click", space.events.clickEvent);
			scene.canvas.addEventListener("mousedown", space.events.mouseDown);
			scene.canvas.addEventListener("mouseup", space.events.mouseUp)
			scene.canvas.addEventListener("mousemove", space.events.mouseMove);
			scene.onFrame(space.events.onFrame);
			if (Library.isFirefox)
			{
				window.addEventListener("DOMMouseScroll", space.events.scroll);
			}
			else
			{
				scene.canvas.addEventListener("mousewheel", space.events.scroll);
			}
		}

		if (space)
		{
			window.removeEventListener("resize", space.events.editCorners)
			window.removeEventListener("keydown", space.events.keyDown)
			window.removeEventListener("keyup", space.events.keyUp)
			scene.canvas.removeEventListener("click", space.events.clickEvent);
			scene.canvas.removeEventListener("mousedown", space.events.mouseDown);
			scene.canvas.removeEventListener("mouseup", space.events.mouseUp)
			scene.canvas.removeEventListener("mousemove", space.events.mouseMove);
			scene.removeOnFrame()
			if (Library.isFirefox)
			{
				window.removeEventListener("DOMMouseScroll", space.events.scroll);
			}
			else
			{
				scene.canvas.removeEventListener("mousewheel", space.events.scroll);
			}
			scene.reset();
			space = undefined;
		}
		space = this;
		this.type = mode;
		this.time = 0;
		this.constant = 1
		this.atFront = [];
		this.fixed = [];
		this.bodies = [];
		this.planets = [];
		this.ships = [];
		this.netForceX = 0;
		this.netForceY = 0;
		this.totalMass = 0;
		this.buttonClicked = false;
		this.paused = false;
		this.hovering = undefined;
		this.helpTxt = new Text(300, 200, "", 10, "Roboto Mono", "#FFFFFF");
		this.ship = undefined;
		this.speed = 1;

		scene.zoom(1/scene.scaleX, 1/scene.scaleY);
		scene.background.distance = .7;
		scene.changeMouse("default");

		if (mode === "sandbox")
		{
			function updatePositions(element, i, array)
			{
				element.age++;
				if (!space.paused)
				{
					if (element.above == undefined)
					{

						element.temp.top = 0;
						element.temp.topP = 0;
						element.temp.topD = 0;

						element.vx *= !(element.bodyType === 1);
						element.vy *= !(element.bodyType === 1);

						element.x += element.vx * space.speed// * space.constant;
						element.y += element.vy * space.speed// * space.constant;

						for (var j = 0; j < element.under.length; j++)
						{
							element.under[j].x += element.vx;
							element.under[j].y += element.vy;

							element.under[j].vx = element.vx;
							element.under[j].vy = element.vy;
						}
					}
					if (space.focus.focusing)
					{
						if (element == space.focus.planet)
						{
							space.focus.outline.x = space.focus.planet.x;
							space.focus.outline.y = space.focus.planet.y;
							scene.setOffset(scene.translateX - space.speed * scene.scaleX * (element.above || element).vx/* * space.constant*/, scene.translateY - space.speed * scene.scaleY * (element.above || element).vy/* * space.constant*/)
						}
						if (element.under.indexOf(space.focus.planet) != -1) //To keep things in sync
						{
							space.focus.outline.x = space.focus.planet.x;
							space.focus.outline.y = space.focus.planet.y;
						}
					}
				}

				if (element.age > 60 && colliding(Library.mouse, element))
				{
					space.templetiables.hoveringBool = true;
					space.hovering = element;
				}
				if(space.tracing && element.bodyType !== 1)
				{
					space.bodies[i].trace.addPoint(space.bodies[i].x, space.bodies[i].y)
				}
			}

			window.demoKey = function(x, y, key, pressed)
			{
				var sx;
				var sy;
				var sw;
				var sh;
				switch (key)
				{
					case "tab":
						sx = 0;
						sy = 64;
						sw = 32;
						sh = 16;
						break;
					case "cplk":
						sx = 0;
						sy = 80;
						sw = 32;
						sh = 16;
						break;
					case "shft":
						sx = 0;
						sy = 96;
						sw = 32;
						sh = 16;
						break;
					case "ctrl":
						sx = 0;
						sy = 112;
						sw = 32;
						sh = 16;
						break;
					case "1":
						sx = 32;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "2":
						sx = 48;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "3":
						sx = 64;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "4":
						sx = 80;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "5":
						sx = 96;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "6":
						sx = 112;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "7":
						sx = 128;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "8":
						sx = 144;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "9":
						sx = 160;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "0":
						sx = 176;
						sy = 48;
						sw = 16;
						sh = 16;
						break;
					case "q":
						sx = 32;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "w":
						sx = 48;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "e":
						sx = 64;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "r":
						sx = 80;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "t":
						sx = 96;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "y":
						sx = 112;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "u":
						sx = 128;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "i":
						sx = 144;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "o":
						sx = 160;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "p":
						sx = 176;
						sy = 64;
						sw = 16;
						sh = 16;
						break;
					case "a":
						sx = 32;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "s":
						sx = 48;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "d":
						sx = 64;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "f":
						sx = 80;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "g":
						sx = 96;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "h":
						sx = 112;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "j":
						sx = 128;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "k":
						sx = 144;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "l":
						sx = 160;
						sy = 80;
						sw = 16;
						sh = 16;
						break;
					case "entr":
						sx = 176;
						sy = 80;
						sw = 32;
						sh = 16;
						break;
					case "z":
						sx = 32;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case "x":
						sx = 48;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case "c":
						sx = 64;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case "v":
						sx = 80;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case "b":
						sx = 96;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case "n":
						sx = 112;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case "m":
						sx = 128;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case ",":
						sx = 144;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case ".":
						sx = 160;
						sy = 96;
						sw = 16;
						sh = 16;
						break;
					case "up":
						sx = 16;
						sy = 128;
						sw = 16;
						sh = 16;
						break;
					case "left":
						sx = 0;
						sy = 144;
						sw = 16;
						sh = 16;
						break;
					case "down":
						sx = 16;
						sy = 144;
						sw = 16;
						sh = 16;
						break;
					case "right":
						sx = 32;
						sy = 144;
						sw = 16;
						sh = 16;
						break;
				}
				var sprite = new Sprite(scene.imageObjects.demoSprites, x, y, sx, sy, sw, sh);
				sprite.addFrame(sx, sy+112, sw, sh)
				sprite.fixed = true;
				if (pressed)
				{
					sprite.changeFrame(1);
				}
				space.demo.temp.push(sprite)
				return sprite;
			}

			this.demo = {}
			this.demo.temp = [];

			this.demo.mouse = new Sprite(scene.imageObjects.demoSprites, 0, 0, 0, 0, 30, 48)
			this.demo.mouse.addFrame(30, 0, 30, 48)
			this.demo.mouse.addFrame(60, 0, 30, 48)
			this.demo.mouse.addFrame(90, 0, 30, 48)
			this.demo.mouse.setProperties({opacity: 0, visible: false, fixed: true, centered: true})

			this.demo.clickCircle = new Circle(0, 0, 0, "black")
			this.demo.clickCircle.setProperties({hollow: true, border: true, borderColor: "white", opacity: 0, fixed: true, visible: false})

			this.demo.outline = new Circle(0, 0, 0, "black")
			this.demo.outline.setProperties({hollow: true, border: true, borderColor: "white", opacity: 0, fixed: true, visible: false})

			this.demo.planetOne = new Circle(0, 0, 5, "red");
			this.demo.planetOne.setProperties({opacity: 0, visible: false, fixed: true})

			this.demo.planetTwo = new Circle(0, 0, 5, "red");
			this.demo.planetTwo.setProperties({opacity: 0, visible: false, fixed: true})

			this.demo.box = new Rectangle(0, 0, 5, 5, "red");
			this.demo.box.setProperties({opacity: 0, visible: false, fixed: true})

			this.demo.line = new Line({x:0, y:0}, {x:0, y:0}, 0, "#FF0000")
			this.demo.line.setProperties({opacity: 0, visible: false, fixed: true})

			this.demo.icon = new Sprite(scene.imageObjects.iconSheet, 0, 0, 0, 0, 16, 16, 32, 32)
			this.demo.icon.addFrame(0, 16, 16, 16);
			this.demo.icon.setProperties({smooth: false, opacity: 0, visible: false})

			this.demo.text = new Text(0, 0, "", 24, "Consolas", "white")
			this.demo.text.setProperties({opacity: 0, visible: false, fixed: true})

			this.demo.pointer = new Sprite(scene.imageObjects.demoCursor, 0, 0, 0, 113, 12, 19)//, 30, 30 * (113 / 69))
			this.demo.pointer.addFrame(69, 0, 69, 69)
			this.demo.pointer.addFrame(138, 0, 69, 69)
			this.demo.pointer.setProperties({opacity: 0, visible: false, fixed: true})

			function endAnimation(){
				space.demo.mouse.setProperties({opacity: 0, visible: false})
				space.demo.icon.setProperties({opacity: 0, visible: false});
				space.demo.pointer.setProperties({opacity: 0, visible: false})
				space.demo.clickCircle.setProperties({opacity: 0, visible: false, r: 0})
				space.demo.planetOne.setProperties({opacity: 0, visible: false, color: "red", r: 5})
				space.demo.planetTwo.setProperties({opacity: 0, visible: false, color: "red", r: 5})
				space.demo.box.setProperties({opacity: 0, visible: false, color: "red"})
				space.demo.text.setProperties({visible: false, opacity: 0})
				space.demo.line.setProperties({visible: false, opacity: 0, width: 2, color: "red"})
				space.demo.outline.setProperties({visible: false, opacity: 0})
				space.demo.pointer.changeFrame(0)//, 30/69)
				space.demo.mouse.changeFrame(0)
				space.demo.icon.changeFrame(1)
				scene.showMouse();
				space.previews[0].preview.visible = true;
				for (var key in space.demo)
				{
					if (space.demo[key].stopAnimation)
					{
						space.demo[key].stopAnimation();
					}
				}
				for (var i = 0; i < space.demo.temp.length; i++)
				{
					space.demo.temp[i].delete()
				}
				space.demo.temp = [];
			}
			window.demonstrate = function(input){
				endAnimation()
				switch (input)
				{
					case 0:
						var startX = scene.canvas.width / 4;
						var startY = scene.canvas.height / 4;
						var moveX = 400;
						var moveY = 50;
						var endX = startX + moveX;
						var endY = startY + moveY;

						scene.hideMouse();
						space.previews[0].preview.visible = false;

						space.demo.pointer.setProperties({opacity: 1, visible: true, x: Library.mouse.canvasXPos, y: Library.mouse.canvasYPos})

						space.demo.clickCircle.setProperties({visible: true, opacity: 1, x: startX, y: startY})

						space.demo.planetOne.setProperties({opacity: 1, visible: true, x: Library.mouse.canvasXPos, y: Library.mouse.canvasYPos, r: space.previews[0].preview.r})

						space.demo.mouse.setProperties({visible: true, x: scene.canvas.width / 2, y: scene.canvas.height - 100})

						space.demo.line.changePoint(1, startX, startY)
						space.demo.line.changePoint(2, startX, startY)
						space.demo.line.opacity = 1;

						space.demo.mouse.fadeIn()
						space.demo.planetOne.animate({x: startX, y: startY}, 2000, "inOutQuad")
						space.demo.pointer.animate({x: startX, y: startY}, 2000, "inOutQuad", function(){
							setTimeout(function(){
								space.demo.mouse.changeFrame(1)
								space.demo.clickCircle.animate({r: 25}, 400, "linear", function(){
									space.demo.clickCircle.animate({x: endX, y: endY}, 2000, "inOutQuad")
									space.demo.line.animatePoint({point: 2, x: endX, y: endY}, 2000, "inOutQuad")
									space.demo.line.visible = true;
									space.demo.pointer.animate({x: endX, y: endY}, 2000, "inOutQuad", function(){
										createSandboxPlanet((startX - scene.translateX) / scene.scaleX, (startY - scene.translateY) / scene.scaleY, space.placeSize, 1, .25)
										space.demo.planetOne.x = space.demo.pointer.x;
										space.demo.planetOne.y = space.demo.pointer.y;
										space.demo.line.visible = false;
										space.demo.clickCircle.visible = false;
										space.demo.planetOne.animate({x: Library.mouse.canvasXPos, y: Library.mouse.canvasYPos}, 2000, "inOutQuad")
										space.demo.pointer.animate({x: Library.mouse.canvasXPos, y: Library.mouse.canvasYPos}, 2000, "inOutQuad", function(){
											endAnimation();
										})
										/*space.demo.clickCircle.animate({opacity: 0}, 400, "linear")
										space.demo.line.visible = false;
										space.demo.mouse.changeFrame(0)
										console.log((startX + moveX * 2) / 2000, (startY + moveY * 2) / 2000)
										space.demo.planetOne.animate({x: startX + moveX * 2, y: startY + moveY * 2}, 2000, "linear", function(){
											endAnimation()
										})*/
									})
								})
							}, 500)
						})
						break;
					case 1:
						var startX = scene.canvas.width / 2;
						var startY = 3*scene.canvas.height / 8;
						var xMovements = [1, -1, -1, 1];
						var yMovements = [1, 1, -1, -1];
						var ease = ["outSine", "inSine"]
						var radius = 75;
						var onMove = 0;

						space.demo.planetOne.setProperties({visible: true, x: startX, y: startY})
						space.demo.pointer.setProperties({visible: true, x: startX - 300, y: startY})
						space.demo.mouse.setProperties({visible: true, x: scene.canvas.width / 2, y: scene.canvas.height - 100})

						function move(){
							if (onMove == 4)
							{
								endAnimation()
							}
							else
							{
								space.demo.mouse.changeFrame(2)
								space.demo.pointer.changeFrame(1, 1)
								space.demo.planetOne.animate({x: space.demo.planetOne.x + xMovements[onMove] * radius}, 600, ease[onMove % 2])
								space.demo.planetOne.animate({y: space.demo.planetOne.y + yMovements[onMove] * radius}, 600, ease[(onMove + 1) % 2], function(){
									space.demo.mouse.changeFrame(0)
									space.demo.pointer.changeFrame(0, 30/69)
									space.demo.pointer.animate({x: startX - 50, y: startY + 20}, 500, "linear", function(){
										move()
									})
								})
								space.demo.pointer.animate({x: space.demo.pointer.x + xMovements[onMove] * radius}, 600, ease[onMove % 2])
								space.demo.pointer.animate({y: space.demo.pointer.y + yMovements[onMove] * radius}, 600, ease[(onMove + 1) % 2])
							}
							onMove++;
						}

						space.demo.planetOne.fadeIn()
						space.demo.mouse.fadeIn()
						space.demo.pointer.fadeIn(400, function(){
							space.demo.pointer.changeFrame(0, 30/69)
							space.demo.pointer.animate({x: startX - 50, y: startY + 20}, 1000, "outQuad", function(){
								move()
							})
						})
						break;
					case 2:
						var startX = scene.canvas.width / 2;
						var startY = 3*scene.canvas.height / 8;
						space.demo.line.changePoint(1, startX - 150, startY + 100)
						space.demo.line.changePoint(2, startX - 150, startY + 100)
						space.demo.line.setProperties({width: 1, visible: true, opacity:1})

						var shift = demoKey(scene.canvas.width / 2 - 50, scene.canvas.height - 100, "shft", false)
						shift.opacity = 0;
						space.demo.planetOne.setProperties({visible: true, x: startX - 150, y: startY + 100})
						space.demo.pointer.setProperties({visible: true, x: startX - 300, y: startY})
						space.demo.mouse.setProperties({visible: true, x: scene.canvas.width / 2 + 50, y: scene.canvas.height - 100})


						shift.fadeIn()
						space.demo.planetOne.fadeIn()
						space.demo.mouse.fadeIn()
						space.demo.pointer.fadeIn(400, function(){
							space.demo.pointer.animate({x: space.demo.planetOne.x + 200}, 2000, "linear")
							space.demo.pointer.animate({y: space.demo.planetOne.y - 20}, 2000, "outSine")
							setTimeout(function(){
								space.demo.pointer.changeFrame(2, 0.5)
								shift.changeFrame(1)
							}, 750)
							space.demo.line.animatePoint({point: 2, x: space.demo.planetOne.x + 200, y: space.demo.planetOne.y - 20}, 2000, "linear")
							space.demo.planetOne.animate({x: space.demo.planetOne.x + 200, y: space.demo.planetOne.y - 20}, 2000, "linear", function(){
								space.demo.outline.visible = true;
								space.demo.outline.opacity = 1;
								space.demo.outline.x = this.x;
								space.demo.outline.y = this.y;
								space.demo.outline.r = this.r * 2;
								space.demo.mouse.changeFrame(1)
								setTimeout(function(){
									space.demo.mouse.changeFrame(0)
									shift.changeFrame(0)
									space.demo.pointer.changeFrame(0, 30/69)
								}, 250)
								space.demo.line.animatePoint({point: 1, x: startX - 150 - 200, y: startY + 100 + 20}, 2000, "linear", function(){
									endAnimation()
								})
							})
						})
						break;
					case 3:
						var startX = scene.canvas.width / 2;
						var startY = 3*scene.canvas.height / 8

						space.demo.planetOne.setProperties({visible: true, x: startX, y: startY})
						space.demo.pointer.setProperties({visible: true, x: startX, y: startY})
						space.demo.mouse.setProperties({visible: true, x: scene.canvas.width / 2, y: 3 * scene.canvas.height / 4})

						space.demo.planetOne.fadeIn()
						space.demo.mouse.fadeIn()
						space.demo.pointer.fadeIn(400, function(){
							space.demo.mouse.changeFrame(3)
							space.demo.planetOne.animate({r: 20, color: "blue"}, 2000, "outQuad", function(){
								endAnimation()
							})
						})
						break;
					case 4:
						var startX = scene.canvas.width / 2;
						var startY = 3*scene.canvas.height / 8;
						var mass = 50;
						var digit = 6;

						space.demo.planetOne.setProperties({visible: true, x: startX, y: startY})
						space.demo.pointer.setProperties({visible: true, x: startX, y: startY})
						space.demo.mouse.setProperties({visible: true, x: scene.canvas.width / 2, y: 3 * scene.canvas.height / 4})
						space.demo.text.setProperties({visible: true, x: scene.canvas.width / 4, y: scene.canvas.height / 4})
						space.demo.box.setProperties({visible: true, x: scene.canvas.width / 4, y: scene.canvas.height / 4})
						space.demo.text.text = "Mass: " + Library.newMath.toOnes(mass, 9)
						space.demo.box.setProperties({visible: true, x: space.demo.text.x + space.demo.text.width * (6+digit) / space.demo.text.text.length + 1, y: space.demo.text.y, width: space.demo.text.width / space.demo.text.text.length, height: space.demo.text.height})

						space.demo.planetOne.fadeIn()
						space.demo.mouse.fadeIn()
						space.demo.text.fadeIn()
						space.demo.box.fadeIn()
						space.demo.pointer.fadeIn(400, function(){
							space.demo.mouse.changeFrame(3)
							space.demo.text.text = "Mass: " + Library.newMath.toOnes(mass, 9)
							var interval = setInterval(function(){
								mass += Math.pow(10, Math.abs(9 - digit) - 1)
								space.demo.text.text = "Mass: " + Library.newMath.toOnes(mass, 9)
							}, 100)
							space.demo.planetOne.animate({r: 15, color: "rgb(128, 0, 128)"}, 2000, "outQuad", function(){
								clearInterval(interval)
								setTimeout(function(){
									digit--;
									space.demo.box.x = space.demo.text.x + space.demo.text.width * (6+digit) / space.demo.text.text.length + 1;
									setTimeout(function(){
										interval = setInterval(function(){
											mass += Math.pow(10, Math.abs(9 - digit) - 1)
											space.demo.text.text = "Mass: " + Library.newMath.toOnes(mass, 9)
										}, 100)
										space.demo.planetOne.animate({r: 35, color: "rgb(46, 0, 210)"}, 2000, "outQuad", function(){
											clearInterval(interval)
											endAnimation();
										})
									}, 1000)
								}, 1000)
								//endAnimation()
							})
						})
						break;
					case 5:
						var startX = scene.canvas.width / 2;
						var startY = 3*scene.canvas.height / 8

						space.demo.planetOne.setProperties({visible: true, x: startX, y: startY})
						space.demo.planetTwo.setProperties({visible: true, x: 300, y: 150})
						space.demo.pointer.setProperties({visible: true, x: startX, y: startY})
						space.demo.mouse.setProperties({visible: true, x: scene.canvas.width / 2, y: 3 * scene.canvas.height / 4})
						space.demo.icon.setProperties({visible: true, x: scene.canvas.width / 2 - 100, y: scene.canvas.height / 2 + 50})
						space.demo.icon.changeFrame(0)
						space.demo.line.opacity = 1;

						space.demo.planetOne.fadeIn()
						space.demo.planetTwo.fadeIn()
						space.demo.icon.fadeIn()
						space.demo.mouse.fadeIn()
						space.demo.pointer.fadeIn(400, function(){
							space.demo.planetTwo.animate({x: space.demo.planetTwo.x + 200, y: space.demo.planetTwo.y + 40}, 1750)
							space.demo.planetOne.animate({x: space.demo.icon.x + 16, y: space.demo.icon.y + 16}, 1500, "outQuad")
							space.demo.pointer.animate({x: space.demo.icon.x + 16, y: space.demo.icon.y + 16}, 1500, "outQuad", function(){
								setTimeout(function(){
									space.demo.icon.changeFrame(1)
									space.demo.mouse.changeFrame(1)
									setTimeout(function(){
										space.demo.mouse.changeFrame(0)
										space.demo.planetOne.animate({x: space.demo.pointer.x - 25, y: space.demo.pointer.y - 100}, 1500, "outQuad")
										space.demo.pointer.animate({x: space.demo.pointer.x - 25, y: space.demo.pointer.y - 100}, 1500, "outQuad", function(){
											space.demo.line.changePoint(1, this.x, this.y)
											space.demo.line.changePoint(2, this.x, this.y)
											space.demo.line.visible = true;
											space.demo.mouse.changeFrame(1)
											space.demo.line.animatePoint({point: 2, x: space.demo.pointer.x + 20, y: space.demo.pointer.y - 125}, 1500, "outQuad")
											space.demo.pointer.animate({x: space.demo.pointer.x + 20, y: space.demo.pointer.y - 125}, 1500, "outQuad", function(){
												space.demo.line.visible = false;
												space.demo.mouse.changeFrame(0)
												space.demo.pointer.animate({x: space.demo.icon.x + 16, y: space.demo.icon.y + 16}, 1500, "outQuad", function(){
													setTimeout(function(){
														space.demo.icon.changeFrame(0)
														space.demo.mouse.changeFrame(1)
														setTimeout(function(){
															space.demo.mouse.changeFrame(0)
														}, 250)
														space.demo.planetOne.animate({x: space.demo.planetOne.x + 32, y: space.demo.planetOne.y - 198}, 1750)
														space.demo.planetTwo.animate({x: space.demo.planetTwo.x + 200, y: space.demo.planetTwo.y + 40}, 1750, "linear", function(){
															endAnimation()
															//demonstrate(5)
														})
													}, 250)
												})
											})
										})
									}, 250)
								}, 250)
							})
						})
						break;
					case 6:
						var startX = scene.canvas.width / 2;
						var startY = scene.canvas.height / 4;
						var xMovements = [1, -1, -1, 1];
						var yMovements = [1, 1, -1, -1];
						var ease = ["outSine", "inSine"]
						var radius = 75;
						var onMove = 0;
						var dotOne = new Circle(0, 0, 3, "#00FF00")
						var dotTwo = new Circle(0, 0, 3, "#00FF00")

						space.demo.temp.push(dotOne, dotTwo)

						space.demo.planetOne.setProperties({visible: true, x: startX, y: startY + radius})
						space.demo.planetTwo.setProperties({visible: true, x: startX, y: startY + radius})
						dotOne.setProperties({visible: true, x: startX - 100, y: startY})
						dotTwo.setProperties({visible: true, x: startX + 100, y: startY})
						space.demo.outline.setProperties({visible: true, x: space.demo.planetOne.x, y: space.demo.planetOne.y, r: space.demo.planetTwo.r * 2})
						space.demo.pointer.setProperties({visible: true, x: startX, y: startY + radius})
						space.demo.mouse.setProperties({visible: true, x: scene.canvas.width / 2, y: 3 * scene.canvas.height / 4})
						space.demo.line.changePoint(1, startX, startY)
						space.demo.line.changePoint(2, startX, startY)
						space.demo.line.opacity = 1;


						function move(){
							if (onMove == 4)
							{
								endAnimation()
							}
							else
							{
								space.demo.planetTwo.animate({x: space.demo.planetTwo.x + xMovements[onMove] * radius}, 600, ease[onMove % 2])
								space.demo.planetTwo.animate({y: space.demo.planetTwo.y + yMovements[onMove] * radius}, 600, ease[(onMove + 1) % 2], function(){
									move()
								})

							}
							onMove++;
						}

						space.demo.planetOne.fadeIn()
						space.demo.planetTwo.fadeIn()
						space.demo.outline.fadeIn()
						space.demo.mouse.fadeIn()
						space.demo.pointer.fadeIn(400, function(){
							space.demo.pointer.changeFrame(0, 30/69)
							space.demo.planetTwo.animate({x: startX, y: startY}, 1000, "inOutSine")
							space.demo.pointer.animate({x: startX, y: startY}, 1000, "inOutSine", function(){
								space.demo.mouse.changeFrame(1)
								dotOne.visible = true;
								dotTwo.visible = true;
								space.demo.line.visible = true;
								space.demo.line.animatePoint({point: 2, x: dotTwo.x, y: dotTwo.y}, 1000, "inOutSine")
								space.demo.line.animate({color: "#00FF00"}, 1000, "inOutSine")
								space.demo.pointer.animate({x: dotTwo.x, y: dotTwo.y}, 1000, "inOutSine", function(){
									setTimeout(function(){
										space.demo.mouse.changeFrame(0)
										dotOne.visible = false;
										dotTwo.visible = false;
										space.demo.line.visible = false;
										move()
									}, 500)
								})
							})
						})
						break;
				}

			}

			this.showingOrbitStrength = false;
			this.helping = true;
			this.setting = false;
			this.placeMode = 0;
			this.pathFind = false;
			this.bgBoxes = [];
			this.bgBack = new Rectangle(scene.canvas.width - 74, -5, 74, 8, "#333333");
			this.bgToggleBtn = new Rectangle(scene.canvas.width - 85, 0, 14, 1, "#000000");
			this.bgToggleArrows = [new Sprite(scene.imageObjects.toggleArrow, scene.canvas.width - 88, (scene.canvas.height - 16) / 2)];
			this.focus = {         //Contain variables used when focusing
				focusing: false,
				planet: undefined,
				outline: new Circle(0, 0, 0, "#000000")
			}
			this.previews = [{     //Preview planet and red line shown when dragging and firing new planet
					preview: new Circle(0, 0, 3.285390748670416, "#FF0000"),
					line: new Line({x:0, y:0}, {x:0, y:0}, 0, "#FF0000")
				}
			]
			this.previewShip = new Sprite(scene.imageObjects.ship, 10, 10, 0, 0, 15, 16);
			this.buttons = {       //Any GUI that could be clicked on
				exit: new Sprite(scene.imageObjects.iconSheet, 100, 100, 96, 0, 16, 16),
				reset: new Sprite(scene.imageObjects.iconSheet, 0, 0, 32, 0, 16, 16),
				nextFrame: new Sprite(scene.imageObjects.iconSheet, 0, 0, 112, 0, 16, 16),
				pause: new Sprite(scene.imageObjects.iconSheet, 0, 0, 0, 0, 16, 16),
				trace: new Sprite(scene.imageObjects.iconSheet, 0, 0, 16, 0, 16, 16),
				connect: new Sprite(scene.imageObjects.iconSheet, 0, 0, 0, 32, 16, 16),
				placeMode: new Sprite(scene.imageObjects.iconSheet, 0, 0, 48, 0, 16, 16),
				pathFind: new Sprite(scene.imageObjects.iconSheet, 0, 0, 64, 0, 16, 16),
				fullscreen: new Sprite(scene.imageObjects.iconSheet, 0, 0, 32, 32, 16, 16),
				settings: new Sprite(scene.imageObjects.iconSheet, 0, 0, 32, 16, 16, 16),
				qustn: new Sprite(scene.imageObjects.iconSheet, 0, 0, 80, 0, 16, 16),
				save: new Sprite(scene.imageObjects.iconSheet, 0, 0, 112, 16, 16, 16),
			};
			this.galaxyBox = {
				back: new Rectangle(0, scene.canvas.height - 210, 120, 200, "#333333"), //Background box
				planetCounter: new Text(5, scene.canvas.height - 202, "Count: 399", 12, "Verdana", "rgb(0, 160, 222)", "bold"),
				bars: {

					density: new Rectangle(20, scene.canvas.height - 185, 10, 150, "#000000"),
					size: new Rectangle(55, scene.canvas.height - 185, 10, 150, "#000000"),
					speed: new Rectangle(90, scene.canvas.height - 185, 10, 150, "#000000"),
				},
				sliders: {
					density: new Rectangle(15, scene.canvas.height - 72, 20, 10, "#333333"),
					size: new Rectangle(50, scene.canvas.height - 128, 20, 10, "#333333"),
					speed: new Rectangle(85, scene.canvas.height - 85, 20, 10, "#333333"),
				},
				labels: {
					density: new Text(25, scene.canvas.height - 33, "Density", 10, "Verdana", "rgb(0, 160, 222)"),
					size: new Text(60, scene.canvas.height - 33, "Size", 10, "Verdana", "rgb(0, 160, 222)"),
					speed: new Text(95, scene.canvas.height - 33, "Speed", 10, "Verdana", "rgb(0, 160, 222)"),
				},
				size: 178,
				density: .2,
				speed: .3,
				sliding: undefined,
				origHeight: 0,
				shapesHere: [],
				preview: new Circle(0, 0, 178, "#FF0000"),
			};
			this.metaBox = {       //letiables for help or settings screen
				back: new Rectangle(50, 50, scene.canvas.width - 100, scene.canvas.height - 100, "#9999FF"), //Background box
				exit: undefined,                                                                         //Exit button, same as space.buttons.exit
				settings: {  //letiables and shapes needed for the settings screen
				}
			};
			this.templetiables = {
				hoveringBool: false
			};
			this.pathLine = new Line({x:0, y:0}, {x:0, y:0}, 1, "#777777");
			this.pathLength = 50;
			this.placeSize = 50;   //Mass of next planet to be placed
			this.traces = [];      //Array of trace lines
			this.tracing = 0;  //If we are tracing
			this.dragging = false; //If we are panning around
			this.colorFormula = function(m){return Library.color.rgbToHex(255 - (Math.round(Math.cbrt(m/((4/3)*Math.PI))) * 20) + 50, 0, Math.round(Math.cbrt(m/((4/3)*Math.PI))) * 20)}; //Formula used to determine color of planet based on its size
			this.sizeFormula = function(m){return Math.cbrt(m/((4/3)*Math.PI)) + 1};
			this.massTextCharacterWidth = 9.00146484375;//Library.getTextWidth("0", "Roboto Mono", 15);
			this.massDigit = 3;
			this.mainStats = new Text(3, 3, "Drag X Velocity: 0.000\nDrag Y Velocity: 0.000\nCelestial Bodies: 0\nMass: 000000050\nZoom Level: 0", 15, "Roboto Mono", "#FFFFFF");  //Text displaying would be vx of planet about to be placed
			this.massHighlighter = new Rectangle(((this.mainStats.lines[3].length - 1) * this.massTextCharacterWidth + 3) - this.massTextCharacterWidth * (Math.abs(this.massDigit) - 1), 59, this.massTextCharacterWidth, 17, "#FF0000");
			this.rate = 10;                                                  //Game rate. Will be for speeding up game, if I can figure it out
			this.fireStrength = 30;                                          //Higher the value, lower the firing strength when placing new planet
			this.optimalBallOne = new Circle(0, 0, 3, "#00FF00");            //Used to display where to let go of mouse in order to get perfect orbit
			this.optimalBallTwo = new Circle(0, 0, 3, "#00FF00");            //Used to display where to let go of mouse in order to get perfect orbit
			this.trailLength = 100;
			this.background = 0;
			this.achievement = {
				title: new Text(scene.canvas.width / 2 + 32, 27, "Achievement Placeholder Text", 30, "Tahoma", "#00BB88"),
				icon: new Sprite(scene.imageObjects.achievementIcons, 10, 10, 0, 0, 64, 64),
				previousAchievements: (!!localStorage.getItem("finishedTasks") == "") ? [] : JSON.parse(localStorage.getItem("finishedTasks")),
				doneTimer: undefined,
				helpHoverTxt: "",
				achievementUp: false,
				clearAchievement: function(){
					space.achievement.achievementUp = false;
					space.achievement.title.fadeOut(1000, function(){
						if (space.hovering == space.achievement.title){
							space.hovering = undefined;
						}
					});
					space.achievement.icon.fadeOut(1000, function(){
						if (space.hovering == space.achievement.icon){
							space.hovering = undefined;
						}
					})
				},
				loadAchievement: function(name, helpHover, id, blockId){
					if (space.achievement.previousAchievements.indexOf(id) == -1)
					{
						space.achievement.achievementUp = true;
						clearTimeout(space.achievement.doneTimer);
						space.achievement.title.text = "New Achievement:\n" + name;
						space.achievement.title.y = scene.canvas.height - space.achievement.title.height - 50
						space.achievement.title.fadeIn(500);
						space.achievement.icon.fadeIn(500);
						space.achievement.previousAchievements.push(id);
						space.achievement.helpHoverTxt = helpHover;
						space.achievement.icon.changeFrame(id);
						localStorage.setItem("finishedTasks", JSON.stringify(space.achievement.previousAchievements));

						space.achievement.icon.x = space.achievement.title.x - space.achievement.title.width / 2 - 74
						space.achievement.icon.y = (space.achievement.title.y + space.achievement.title.height / 2) - (space.achievement.icon.height / 2)
						space.achievement.doneTimer = setTimeout(space.achievement.clearAchievement, 5000)
					}
				}
			};
	/**/	this.tips = {
				text: new Text(scene.canvas.width / 2, 20, "Tip Placeholder Text\nTip Placeholder\nTip", 20, "Tahoma", "#01DEA1", "bold"),
				arrow: new Sprite(scene.imageObjects.tipArrow, 0, 0),
				previous: new Sprite(scene.imageObjects.tipArrow, 0, 0),
				next: new Sprite(scene.imageObjects.tipArrow, 0, 0),
				showButton: new Rectangle(0,0,0,0,"#01DEA1"),
				list: [
			/*0*/	"Click on any blank space to create a new planet",
			/*1*/	"Click and drag to fire a planet",
			/*2*/	"Scroll the mouse wheel to change the planet size",
			/*3*/	"Right click and drag to move your view",
			/*4*/	"Click the pause button or press the spacebar to pause the game",
			/*5*/	"You can place planets while paused, making it easier to create solar systems",
			/*6*/	"Click the 'T' or press 't' on the keyboard to turn on planet trails",
			/*7*/	"Press and hold 'Shift' and click on a planet to follow it",
			/*8*/	"Click on a blank part of the game when focused on a planet and drag to a green dot to fire planet in a perfect orbit (Easier when paused)",
			/*9*/	"Press and hold 'd' and click on a planet to delete it",
			/*10*/	"Click the gear icon, and select an image to set it as your background",
			/*11*/	"Click the 'Next Frame' icon to skip forward one frame",
			/*12*/	"Click the Fullscreen icon to expand the game to fullscreen",
			/*13*/	"Press and hold 'Ctrl' and scroll to zoom in or out",
			/*14*/	"Click the reset icon to clear all planets and settings",
				],
				attached:{},
				onTip: 0,
				arrowAnimation: undefined,
				hiding: 0,
				hide: function() {
					if (space.tips.hiding === 0 && !space.tips.next.events.click[0].down && !space.tips.previous.events.click[0].down)
					{
						var slideDistance = space.tips.text.y + 5 + space.tips.text.height
						var duration = 750;
						var ease = "outBounce";
						space.tips.hiding = 1;
						space.tips.text.animate({y: space.tips.text.y - slideDistance}, duration, ease)
						space.tips.previous.animate({y: space.tips.previous.y - slideDistance}, duration, ease)
						space.tips.next.animate({y: space.tips.next.y - slideDistance}, duration, ease, function(){
							space.tips.hiding = 2;
							space.tips.showButton.x = space.tips.text.x - 12 - space.tips.text.width / 2;
							space.tips.showButton.width = space.tips.text.width + 24;
							space.tips.showButton.height = 10;
							space.tips.showButton.visible = true;
						})
					}
				},
				show: function() {
					if (space.tips.hiding === 2 && !space.tips.next.events.click[0].down && !space.tips.previous.events.click[0].down)
					{
						var slideDistance = space.tips.text.y - 20
						var duration = 750;
						var ease = "outElastic";
						space.tips.hiding = 1;
						space.tips.showButton.visible = false;
						space.tips.showButton.opacity = 0;
						space.tips.text.animate({y: space.tips.text.y - slideDistance}, duration, ease)
						space.tips.previous.animate({y: space.tips.previous.y - slideDistance}, duration, ease)
						space.tips.next.animate({y: space.tips.next.y - slideDistance}, duration, ease, function(){
							space.tips.hiding = 0;
						})
					}
				},
				loadTip: function(id) {
					space.tips.onTip = id;
					space.tips.text.text = "Tip: " + space.tips.list[id]
					space.tips.text.fitText(500)

					space.tips.previous.x = space.tips.text.x - (space.tips.text.width / 2) - space.tips.previous.width - 7
					space.tips.previous.y = space.tips.text.y + (space.tips.text.height - space.tips.previous.height) / 2

					space.tips.next.x = space.tips.text.x + (space.tips.text.width / 2) + 7
					space.tips.next.y = space.tips.text.y + (space.tips.text.height - space.tips.previous.height) / 2

					if (id == 0)
					{
						space.tips.previous.visible = false;
					}
					else if (id == space.tips.list.length - 1)
					{
						space.tips.next.visible = false;
					}
					else
					{
						space.tips.previous.visible = true;
						space.tips.next.visible = true;
					}

					space.tips.arrow.visible = true;
					clearInterval(space.tips.arrowAnimation)
					if (id in space.tips.attached)
					{
						space.tips.arrow.x = space.tips.attached[id].x;
						space.tips.arrow.y = -800
						var vy = 0;
						space.tips.arrow.stopAnimation()
						space.tips.arrow.animate({y: 0}, 4000, "inQuad", function(){
							this.animate({y: space.tips.attached[id].y - 16}, 2000, "outBounce", function(){
								function animateThis(){
									this.animate({y: space.tips.attached[id].y - 26}, 1500, "inOutSine", function(){
										this.animate({y: space.tips.attached[id].y - 12}, 1500, "inOutSine", animateThis)
									})
								}
								animateThis.call(this);
							})
						})
					}
					else
					{
						space.tips.arrow.visible = false;
					}
				},
			};
	/**/	this.requestPreset = {
				container: new Rectangle(scene.canvas.width / 2, scene.canvas.height / 2, 450, 175, "#333333"),
				text: new Text(scene.canvas.width / 2, 100, "What would you like to do\nwith your previous preset?", 20, "Consolas", "rgb(0, 160, 222)", "italic bold"),
				accept: new Text(0, 0, "Restore", 20, "Consolas", "rgb(0, 160, 222)"),
				deny: new Text(0, 0, "Delete", 20, "Consolas", "rgb(0, 160, 222)"),
			};
	/**/	this.bgDragging = 0;
	/**/	this.bgWasClicked = false;
	/**/	this.bgHideSlideTimer = undefined;
	/**/	this.bgHideTimer = undefined;
	/**/	this.bgHiding = 0;
			this.events = {
				keyDown: function(event)
				{
					if (lastClicked == scene.canvas || $("#game:hover")[0] === scene.canvas)
					{
						if (Library.keyboard.keyDown.indexOf(16) != -1)
						{
							space.previews[0].preview.visible = false;
							space.galaxyBox.preview.visible = false;
							space.previewShip.visible = false;
							scene.changeMouse("images/cursors/camera.cur");
						}
						else if (Library.keyboard.keyDown.indexOf(68) != -1)
						{
							space.galaxyBox.preview.visible = false;
							space.previews[0].preview.visible = false;
							space.previewShip.visible = false;
							if (space.bodies.indexOf(space.hovering) !== -1)
							{
								scene.changeMouse("images/cursors/trashOpen.cur");
							}
							else
							{
								scene.changeMouse("images/cursors/trashClosed.cur");
							}
						}
						else if (Library.keyboard.keyDown.indexOf(82) != -1)
						{
							space.resetGame();
						}

						if (!space.paused && space.ship)
						{
							if (Library.keyboard.keyDown.indexOf(38) != -1 && Library.keyboard.keyDown.indexOf(40) != -1)
							{
								space.ship.changeFrame(3)
							}
							else if (Library.keyboard.keyDown.indexOf(38) != -1) //Up
							{
								space.ship.changeFrame(1)
							}
							else if (Library.keyboard.keyDown.indexOf(40) != -1) //Down
							{
								space.ship.changeFrame(2)
							}
						}
					}
				},
				keyUp: function(e)
				{
					if (lastClicked == scene.canvas || $("#game:hover")[0] === scene.canvas)
					{
						if (!space.paused && space.ship)
						{
							if (Library.keyboard.keyDown.indexOf(38) == -1 && Library.keyboard.keyDown.indexOf(40) == -1) //Both Released
							{
								space.ship.changeFrame(0)
							}
							else if (Library.keyboard.lastPressed == 38 && Library.keyboard.keyDown.indexOf(40) != -1) //If down is still held
							{
								space.ship.changeFrame(2)
							}
							else if (Library.keyboard.keyDown.indexOf(38) != -1 && Library.keyboard.lastPressed == 40) //If up is still held
							{
								space.ship.changeFrame(1)
							}
						}
						if (Library.keyboard.lastPressed == 32)
						{
							togglePause();
						}
						else if (Library.keyboard.lastPressed == 16)
						{
							scene.changeMouse("default");
							if (space.placeMode == 0 || space.placeMode == 1)
							{
								space.previews[0].preview.visible = true;
							}
							else if (space.placeMode == 2)
							{
								space.galaxyBox.preview.visible = true;
							}
							else if (space.placeMode == 3)
							{
								space.previewShip.visible = true;
							}
						}
						else if (Library.keyboard.lastPressed == 68)
						{
							scene.changeMouse("default");
							if (space.placeMode == 0 || space.placeMode == 1)
							{
								space.previews[0].preview.visible = true;
							}
							else if (space.placeMode == 2)
							{
								space.galaxyBox.preview.visible = true;
							}
							else if (space.placeMode == 3)
							{
								space.previewShip.visible = true;
							}
						}
						else if (Library.keyboard.lastPressed == 84)
						{
							changeTrace();
						}
						else if (Library.keyboard.lastPressed == 67)
						{
							for (var i = 0; space.bodies.length > 0; i++)
							{
								space.bodies[0].remove()
							}
							for(var i = 0; space.traces.length > 0; i++)
							{

								space.traces[0].delete();
								space.traces.splice(0, 1)

							}
						}
						else
						{
							//console.log(Library.keyboard.lastPressed)
						}
					}
				},
				scroll: function(event)
				{
					event.preventDefault()
					if (Library.keyboard.keyDown.indexOf(17) != -1)
					{
						space.achievement.loadAchievement("Zoomed " + ((Library.mouse.wheel > 0) ? "In" : "Out") + " \uD83D\uDEC8", "Earned by pressing and holding 'Ctrl' and scrolling the mouse wheel.", 12, 13);
						scene.zoom(Math.pow(10/9, Library.mouse.wheel), Math.pow(10/9, Library.mouse.wheel), Library.mouse.canvasXPos, Library.mouse.canvasYPos)


					}
					else if (Library.keyboard.keyDown.indexOf(16) != -1)
					{

						if ((Library.mouse.wheel == 1 || space.massDigit > 1) && (Library.mouse.wheel == -1 || space.massDigit < 9))
						{
							space.massDigit += Library.mouse.wheel
						}
						space.massHighlighter.x = ((space.mainStats.lines[3].length - 1) * space.massTextCharacterWidth + 3) - space.massTextCharacterWidth * (Math.abs(space.massDigit) - 1);

					}
					else
					{
						space.achievement.loadAchievement("Changed The Planet Size \uD83D\uDEC8", "Earned by scrolling the mouse wheel.", 1, 2);
						if (space.placeSize + Library.mouse.wheel * Math.pow(10, Math.abs(space.massDigit) - 1) > 0 && space.placeSize + Library.mouse.wheel * Math.pow(10, Math.abs(space.massDigit) - 1) < 1000000000)
						{
							space.placeSize += Library.mouse.wheel * Math.pow(10, Math.abs(space.massDigit) - 1)
						}

						space.mainStats.text = "Drag X Velocity: 0.000\nDrag Y Velocity: 0.000\nCelestial Bodies: " + space.bodies.length + "\nMass: " + Library.newMath.toOnes(space.placeSize, 9) + "\nZoom Level: " + Math.round(Math.log(scene.scaleX)/Math.log(10/9))
						space.previews[0].preview.r = space.sizeFormula(space.placeSize)
						space.previews[0].preview.color = space.colorFormula(space.placeSize)
					}
					space.mainStats.text = "Drag X Velocity: " + ((-(space.previews[0].line.coordSet[0].x - space.previews[0].line.coordSet[1].x) / space.fireStrength).toFixed(3)) + "\nDrag Y Velocity: " + ((-(space.previews[0].line.coordSet[0].y - space.previews[0].line.coordSet[1].y) / space.fireStrength).toFixed(3)) + "\nCelestial Bodies: " + space.bodies.length + "\nMass: " + Library.newMath.toOnes(space.placeSize, 9) + "\nZoom Level: " + Math.round(Math.log(scene.scaleX)/Math.log(10/9))
					for (var i = 0; i < space.previews.length; i++)
					{
						space.previews[i].preview.r = space.sizeFormula(space.placeSize)
						space.previews[i].preview.color = space.colorFormula(space.placeSize);
					}
					//console.log(Math.log(scene.scaleX) / Math.log(10/9))
				},
				clickEvent: function(event)
				{
					if (event.which == 1)
					{
						if (space.hovering == space.buttons.qustn)
						{
							space.helping = !space.helping;
							space.buttons.qustn.changeFrame(space.helping)
							space.helpTxt.toFront();
						}
						if (!space.setting)
						{
							if (space.hovering == space.buttons.pause)
							{
								togglePause();
							}
							else if (space.hovering == space.buttons.trace)
							{
								changeTrace();
							}
							else if (space.hovering == space.buttons.reset)
							{
								space.resetGame();
								//space.buttonClicked = true;
							}
							else if (space.hovering == space.buttons.nextFrame)
							{
								space.achievement.loadAchievement("Moved Forward One Frame \uD83D\uDEC8", "Earned by clicking the 'Next Frame' icon.", 10, 11);
								if (space.paused)
								{
									togglePause();
								}
								space.events.onFrame();
								if (!space.paused)
								{
									togglePause();
								}
							}
							else if (space.hovering == space.buttons.connect)
							{
								toggleConnect();
							}
							else if (space.hovering == space.buttons.settings)
							{
								//openSettings();
							}
							else if (space.hovering == space.buttons.fullscreen)
							{
								toggleFullScreen();
							}
							else if (space.hovering == space.buttons.placeMode)
							{

								space.placeMode = (space.placeMode + 1) * ((space.placeMode) <= 2)
								space.buttons.placeMode.changeFrame(space.placeMode);
								if (space.placeMode === 1)
								{
									space.previews[0].preview.border = true;
								}
								else
								{
									space.previews[0].preview.border = false;
								}

								if (space.placeMode === 2)
								{
									space.previews[0].preview.visible = false;
									space.galaxyBox.preview.visible = true;

									for (var i = 0; i < space.galaxyBox.shapesHere.length; i++)
									{
										space.galaxyBox.shapesHere[i].fadeIn(250);
									}
								}
								else
								{
									space.previews[0].preview.visible = true;
									space.galaxyBox.preview.visible = false;
									for (var i = 0; i < space.galaxyBox.shapesHere.length; i++)
									{
										space.galaxyBox.shapesHere[i].fadeOut(250);
									}
								}

								if (space.placeMode == 3)
								{
									space.previewShip.visible = true;
									space.previews[0].preview.visible = false;
									space.galaxyBox.preview.visible = false;
								}
								else
								{
									space.previewShip.visible = false;
								}
							}
							else if (space.hovering == space.buttons.pathFind)
							{
								space.pathFind = !space.pathFind;
								space.buttons.pathFind.changeFrame(space.pathFind);
							}
							else if (space.hovering == space.buttons.save)
							{
								var wasPaused = space.paused;
								if (!space.paused)
								{
									togglePause();
								}
								if (isFullScreen)
								{
									closeFullScreen();
								}
								$("#outputCode").html(saveSet());
								$($(".pageFader")[0]).fadeTo(250, 0.5);
								$("#outputContainer").fadeIn()
							}
						}
						else if (space.hovering == space.buttons.exit)
						{
							if (space.setting)
							{
								closeSettings()
							}
						}
					}
				},
				mouseDown: function(event)
				{
					if ((space.hovering && space.hovering != space.mainStats && space.bodies.indexOf(space.hovering) == -1) || space.requestPreset.container.visible)
					{
						space.buttonClicked = true;
					}

					if (Library.mouse.leftDown)
					{
						for (var i in space.buttons)
						{
							if (space.buttons[i] === space.hovering)
							{
								space.buttonClicked = true;
								space.buttons[i].clicked = true;
							}
						}
						for (var i in space.galaxyBox.sliders)
						{
							if (space.hovering === space.galaxyBox.sliders[i])
							{
								space.galaxyBox.sliding = space.hovering;
								space.galaxyBox.origHeight = Library.mouse.canvasYPos - space.galaxyBox.sliding.y;
							}
						}

						if (!space.buttonClicked)
						{

							var bodyFound = false;
							for(var i = 0; i < space.bodies.length; i++)
							{
								if (space.bodies[i] === space.hovering)
								{
									bodyFound = true;
									if (Library.keyboard.keyDown.indexOf(16) != -1)
									{
										space.achievement.loadAchievement("Camera Locked on Planet \uD83D\uDEC8", "Earned by pressing and holding 'shift' and clicking on a planet.", 2, 7);
										space.bodies[i].focus();
									}
									else if (Library.keyboard.keyDown.indexOf(68) != -1)
									{
										space.achievement.loadAchievement("Planet Deleted \uD83D\uDEC8", "Earned by pressing and holding 'd' and clicking on a planet.", 6, 9);
										space.bodies[i].remove();
									}
								}
							}
							if (space.ship && space.placeMode == 3 && !bodyFound && !space.dragging && Library.keyboard.keyDown.length == 0 && !space.buttonClicked && !space.setting)
							{
								space.ship.remove();
							}
						}
					}
					else if (Library.mouse.rightDown)
					{
						scene.changeMouse("move");
					}
				},
				mouseUp: function(event)
				{
					space.galaxyBox.sliding = undefined;
					if (event.which === 1)
					{
						if (Library.keyboard.keyDown.length == 0)
						{
							space.pathLine.clearPoints();
							space.mainStats.text = "Drag X Velocity: 0.000\nDrag Y Velocity: 0.000\nCelestial Bodies: " + space.bodies.length + "\nMass: " + Library.newMath.toOnes(space.placeSize, 9) + "\nZoom Level: " + Math.round(Math.log(scene.scaleX)/Math.log(10/9))
							if (!space.dragging && Library.keyboard.keyDown.length == 0 && !space.buttonClicked && !space.setting)
							{
								if (space.placeMode == 2)
								{
									placeGalaxy(space.previews[0].line.coordSet[0].x, space.previews[0].line.coordSet[0].y, ((space.pathFind * 2) - 1) * (space.previews[0].line.coordSet[0].x - space.previews[0].line.coordSet[1].x) / space.fireStrength, ((space.pathFind * 2) - 1) * (space.previews[0].line.coordSet[0].y - space.previews[0].line.coordSet[1].y) / space.fireStrength, 300)
								}
								else if (space.placeMode == 0 || space.placeMode == 1)
								{
									createSandboxPlanet(space.previews[0].line.coordSet[0].x, space.previews[0].line.coordSet[0].y, space.placeSize, ((space.pathFind * 2) - 1) * (space.previews[0].line.coordSet[0].x - space.previews[0].line.coordSet[1].x) / space.fireStrength, ((space.pathFind * 2) - 1) * (space.previews[0].line.coordSet[0].y - space.previews[0].line.coordSet[1].y) / space.fireStrength);
									space.achievement.loadAchievement("Placed Your First Planet \uD83D\uDEC8", "Earned by clicking on a blank part of the game.", 0, 0);
									if (space.paused)
									{
										space.achievement.loadAchievement("Placed a Planet While Paused \uD83D\uDEC8", "Earned by pressing pause and placing a planet.", 8, 5);
									}
									if (space.placeMode === 1)
									{
										space.bodies[space.bodies.length - 1].starify();
									}
									if (space.hovering === space.optimalBallOne || space.hovering === space.optimalBallTwo)
									{
										space.achievement.loadAchievement("Planet Sent into Perfect Orbit \uD83D\uDEC8", "Earned by focusing on a planet, then clicking on a blank part of the\ngame and dragging to one of the green dots.", 3, 8);
									}
								}
								else if (space.placeMode == 3)
								{
									createSandboxShip(space.previews[0].line.coordSet[0].x, space.previews[0].line.coordSet[0].y + 4, ((space.pathFind * 2) - 1) * (space.previews[0].line.coordSet[0].x - space.previews[0].line.coordSet[1].x) / space.fireStrength, ((space.pathFind * 2) - 1) * (space.previews[0].line.coordSet[0].y - space.previews[0].line.coordSet[1].y) / space.fireStrength);
								}

								/*if (space.focus.focusing)
								{
									for (var i = 1; i < space.previews.length; i++)
									{
										space.bodies.push(new Planet(space.previews[i].line.coordSet[0].x, space.previews[i].line.coordSet[0].y, space.placeSize, -(space.previews[i].line.coordSet[0].x - space.previews[i].line.coordSet[1].x) / space.fireStrength, -(space.previews[i].line.coordSet[0].y - space.previews[i].line.coordSet[1].y) / space.fireStrength));
										space.bodies[space.bodies.length - 1].vx = -(space.previews[i].line.coordSet[0].x - space.previews[i].line.coordSet[1].x) / space.fireStrength;
										space.bodies[space.bodies.length - 1].vy = -(space.previews[i].line.coordSet[0].y - space.previews[i].line.coordSet[1].y) / space.fireStrength;
									}
								}*/
							}
							for (var i in space.buttons)
							{
								space.buttons[i].clicked = false;
							}
							space.optimalBallOne.visible = space.optimalBallTwo.visible = false;
							space.optimalBallTwo.x = space.optimalBallOne.x = scene.translateX - 10
							space.optimalBallTwo.y = space.optimalBallOne.y = scene.translateY - 10
							space.buttonClicked = false;
						}
					}
					else if (event.which === 3)
					{
						scene.changeMouse("auto");
					}

					space.bgWasClicked = false;
				},
				mouseMove: function(event)
				{
					var found = false;
					for (var i = 1; i < scene.shapes.length; i++)
					{
						if ((scene.shapes[i].age > 60 || space.bodies.indexOf(scene.shapes[i]) == -1) && scene.shapes[i] != space.previews[0].preview && scene.shapes[i] != space.galaxyBox.preview && scene.shapes[i] != space.previewShip && colliding(Library.mouse, scene.shapes[i]) && scene.shapes[i].visible && scene.shapes[i] != space.helpTxt && scene.shapes[i] != space.mainStats)
						{

							space.hovering = scene.shapes[i];
							found = true;
						}

					}
					if (!found)
					{
						space.hovering = undefined;
					}

					if (space.galaxyBox.sliding)
					{
						var parent = space.galaxyBox.bars[space.galaxyBox.sliding.which]
						var wouldBe = Library.mouse.canvasYPos - space.galaxyBox.origHeight
						if (wouldBe < parent.y)
						{
							space.galaxyBox.sliding.y = parent.y
						}
						else if (wouldBe > parent.y + parent.height - space.galaxyBox.sliding.height)
						{
							space.galaxyBox.sliding.y = parent.y + parent.height - space.galaxyBox.sliding.height
						}
						else
						{
							space.galaxyBox.sliding.y = wouldBe;
						}

						var percentage = 1 - (space.galaxyBox.sliding.y - parent.y) / 140

						if (space.galaxyBox.sliding === space.galaxyBox.sliders.density)
						{
							space.galaxyBox.density = percentage + .01
							space.galaxyBox.preview.opacity = space.galaxyBox.density
						}
						else if (space.galaxyBox.sliding === space.galaxyBox.sliders.size)
						{
							space.galaxyBox.size = percentage * 300
							space.galaxyBox.preview.r = space.galaxyBox.size
						}
						else if (space.galaxyBox.sliding === space.galaxyBox.sliders.speed)
						{
							space.galaxyBox.speed = percentage
						}
						space.galaxyBox.planetCounter.text = "Count: " + Math.ceil(Math.PI * Math.pow(space.galaxyBox.size, 2) / 10 * Math.pow(space.galaxyBox.density, 2))
					}

					if (space.dragging)
					{
						space.achievement.loadAchievement("Moved Your View \uD83D\uDEC8", "Earned by right clicking and dragging the mouse.", 5, 3);
						scene.setOffset(scene.translateX + scene.scaleX * (Library.mouse.x - Library.mouse.lastXPos), scene.translateY + scene.scaleY * (Library.mouse.y - Library.mouse.lastYPos));
						space.focus.focusing = false;
						space.focus.outline.visible = false;
					}

					if (Library.keyboard.keyDown.indexOf(68) != -1)
					{
						for (var i = 0; i < space.bodies.length; i++)
						{

							if (space.bodies[i] === space.hovering)
							{
								scene.changeMouse("images/cursors/trashOpen.cur");
								space.templetiables.hoveringBool = true;
							}
							if (!space.templetiables.hoveringBool)
							{
								scene.changeMouse("images/cursors/trashClosed.cur");
							}
						}
					}
				},
				onFrame: function()
				{
					space.time++;
					if ((!space.hovering || !space.helping) && space.helpTxt.text !== "")
					{
						space.helpTxt.text = ""
						space.helpTxt.changePosition(0, 0, -1, false, -1, 0, 0)
					}
					else
					{
						var changeTo = "";
						space.helpTxt.changePosition(Library.mouse.canvasXPos + 13, Library.mouse.canvasYPos + 3)
						if (space.hovering == space.buttons.trace)
						{
							changeTo = ("Click or type 't' to\ntoggle planet trail length")
						}
						else if (space.hovering == space.buttons.reset)
						{
							changeTo = ("Click or type 'r'\nto reset game")
						}
						else if (space.hovering == space.buttons.qustn)
						{

							changeTo = ("Click to toggle\nhelp popups and tips")
						}
						else if (space.hovering == space.buttons.nextFrame)
						{

							changeTo = ("Click to see next frame")
						}
						else if (space.hovering == space.buttons.connect)
						{

							changeTo = ("Click to toggle\ngravity force lines")
						}
						else if (space.hovering == space.buttons.settings)
						{

							changeTo = ("Click to open settings")
						}
						else if (space.hovering == space.buttons.fullscreen)
						{

							changeTo = ("Click to toggle fullscreen")
						}
						else if(space.hovering === space.buttons.pause)
						{

							changeTo = ("Click or press the\nspacebar to toggle pause")
						}
						else if(space.hovering === space.buttons.exit)
						{

							changeTo = ("Click to exit to game")
						}
						else if(space.hovering === space.buttons.pause)
						{

							changeTo = ("Click or press the\nspacebar to toggle pause")
						}
						else if(space.hovering === space.buttons.placeMode)
						{

							changeTo = ("Click to change between placing planets,\nstars, galaxies, and spaceships")
						}
						else if(space.hovering === space.buttons.pathFind)
						{

							changeTo = ("Click to toggle pre-\nview firing path")
						}
						else if(space.hovering === space.buttons.save)
						{

							changeTo = ("Click to save this set of planets")
						}
						else if (space.bodies.indexOf(space.hovering) != -1)
						{
							if (Library.keyboard.keyDown.indexOf(16) != -1)
							{

								changeTo = ("Click to focus camera on planet")
							}
							else if (Library.keyboard.keyDown.indexOf(68) != -1)
							{

								changeTo = ("Click to delete planet")
							}
							else
							{
								if (space.hovering.bodyType === 0 || space.hovering.bodyType === 1)
								{

									changeTo = ("Planet Stats:\nIndex: " + (space.bodies.indexOf(space.hovering)) + "\nMass: " + space.hovering.m + "\nX: " + space.hovering.x.toFixed(3) + "\nY: " + space.hovering.y.toFixed(3) + "\nVX: " + space.hovering.vx.toFixed(3) + "\nVY: " + space.hovering.vy.toFixed(3) + "\nPlanetType: " + space.hovering.bodyType)
								}
								else if (space.hovering.bodyType === 2)
								{

									changeTo = ("Planet Stats:\nIndex: " + (space.bodies.indexOf(space.hovering)) + "\nRotation: " + Math.round(space.hovering.rotation) + "\nX: " + space.hovering.x.toFixed(3) + "\nY: " + space.hovering.y.toFixed(3) + "\nVX: " + space.hovering.vx.toFixed(3) + "\nVY: " + space.hovering.vy.toFixed(3) + "\nPlanetType: " + space.hovering.bodyType)
								}

							}
						}
						else if(space.hovering === space.optimalBallOne || space.hovering === space.optimalBallTwo)
						{

							changeTo = ("Let go for a perfect orbit")
						}
						else if(space.hovering === space.massHighlighter)
						{

							changeTo = ("Shift+scroll to change position,\nscroll to increment digit")
						}
						else if(space.hovering === space.galaxyBox.sliders.density)
						{

							changeTo = ("Slide to change density of galaxy")
						}
						else if(space.hovering === space.galaxyBox.sliders.size)
						{

							changeTo = ("Slide to change size of galaxy")
						}
						else if(space.hovering === space.galaxyBox.sliders.speed)
						{

							changeTo = ("Slide to change speed of planets")
						}
						else if(space.hovering === space.tips.text)
						{

							changeTo = ("Click to hide tips")
						}
						else if(space.hovering === space.tips.showButton)
						{

							changeTo = ("Click to show tips")
						}
						else if(space.hovering === space.tips.previous)
						{

							changeTo = ("Click to show previous tip")
						}
						else if(space.hovering === space.tips.next)
						{

							changeTo = ("Click to show next tip")
						}
						else if (space.hovering === space.achievement.title || space.hovering === space.achievement.icon)
						{

							changeTo = (space.achievement.helpHoverTxt)
						}
						else if (space.bgBoxes.indexOf(space.hovering) != -1)
						{

							changeTo = ("Click to change background")
						}
						else if (space.hovering === space.bgToggleBtn || space.hovering === space.bgToggleArrows[0])
						{
							if (space.bgHiding == 0)
							{

								changeTo = ("Click to hide menu")
							}
							else if (space.bgHiding == 1)
							{
								space.hovering = undefined;
							}
							else if (space.bgHiding == 2)
							{

								changeTo = ("Click to show menu")
							}
						}
						else
						{
							changeTo = ("")
						}

						if (space.helpTxt.text !== changeTo)
						{
							space.helpTxt.text = changeTo
						}

						if (space.helpTxt.x + space.helpTxt.width > scene.canvas.width)
						{
							space.helpTxt.x -= (20 + space.helpTxt.width);
						}

						if (space.helpTxt.y + space.helpTxt.height > scene.canvas.height)
						{
							space.helpTxt.y -= space.helpTxt.height;
						}
						space.helpTxt.padding = 3;
						space.helpTxt.visible = (space.helpTxt.text.length > 0);
					}

					if (!space.paused)
					{
						//Code for causing fading lines
						if (space.tracing == 2)
						{
							for (var i = 0; i < space.traces.length; i++)
							{
								if (space.traces[i].coordSet.length > space.trailLength || space.traces[i].dead == true)
								{
									space.traces[i].removePoint(1)
								}
								if (!space.traces[i].dead)
								{
									while (space.traces[i].coordSet.length > space.trailLength)
									{
										space.traces[i].removePoint(1)
									}
								}
							}
						}
						for(var i = 0; i < space.bodies.length; i++)
						{
							if (space.bodies[i] != undefined)
							{

								for (var j = 0; j < space.bodies.length; j++)
								{
									if (j > i && space.bodies[j] != undefined && space.bodies[i] != undefined && ((space.bodies[i].above === undefined && space.bodies[j].above === undefined) || (space.bodies[i].bodyType == 2 && space.bodies[j].bodyType == 2)))
									{
										//'i' represents the index of the planet being checked, 'j' represents the index of the planet that 'i' is being checked against
										var xDist = space.bodies[i].x - space.bodies[j].x;
										var yDist = space.bodies[i].y - space.bodies[j].y;
										var distance = Math.sqrt((xDist * xDist) + (yDist * yDist));
										var gForce = space.speed * ((space.constant * space.bodies[i].m * space.bodies[j].m) / (distance * distance));
										var collision = distance <= space.bodies[i].r + space.bodies[j].r//colliding(space.bodies[i], space.bodies[j])

										//Scrapped code for collision detection 2.0
										/*if (Math.sqrt(space.bodies[i].vx*space.bodies[i].vx + space.bodies[i].vy*space.bodies[i].vy) + Math.sqrt(space.bodies[j].vx*space.bodies[j].vx + space.bodies[j].vy*space.bodies[j].vy) + space.bodies[i].r + space.bodies[j].r > distance)
										{
											var a = space.bodies[i].x,
											b = space.bodies[i].y,
											c = space.bodies[j].x,
											d = space.bodies[j].y,
											w = space.bodies[i].vx,
											x = space.bodies[j].vx,
											y = space.bodies[i].vy,
											z = space.bodies[j].vy,
											r = space.bodies[i].r,
											s = space.bodies[j].r;
											var t = ((-1/2)*Math.sqrt(Math.pow((2*a*w-2*a*x+2*b*y-2*b*z-2*c*w+2*c*x-2*d*y+2*d*z),2)-4*(w*w-2*w*x+x*x+y*y-2*y*z+z*z)*(a*a-2*a*c+b*b-2*b*d+c*c+d*d-r*r-2*r*s-s*s))-a*w+a*x-b*y+b*z+c*w-c*x+d*y-d*z)/(w*w-2*w*x+x*x+y*y-2*y*z+z*z)

											if ((!isNaN(t) && t >= 0 && t < 1) || (distance < space.bodies[i].r + space.bodies[j].r))
											{
												scene.drawCircle(space.bodies[i].x + space.bodies[i].vx * t, space.bodies[i].y + space.bodies[i].vy * t, space.bodies[i].r)
												scene.drawCircle(space.bodies[j].x + space.bodies[j].vx * t, space.bodies[j].y + space.bodies[j].vy * t, space.bodies[j].r)
												space.bodies[i].x = space.bodies[i].x + space.bodies[i].vx;
												space.bodies[i].y = space.bodies[i].y + space.bodies[i].vy;
												space.bodies[j].x = space.bodies[j].x + space.bodies[j].vx;
												space.bodies[j].y = space.bodies[j].y + space.bodies[j].vy;
												space.bodies[i].collide(space.bodies[i], space.bodies[j]);
												continue;
											}
										}*/

										if (collision) //Actual code for collision detection
										{
											space.bodies[i].collide(space.bodies[i], space.bodies[j]); //Run code that removes 'i' and 'j', and adds in a new planet with the combined velocities and mass
											continue;
										}
										else
										{

											space.bodies[i].orbiting = ((gForce) / Math.sqrt(Math.pow(space.bodies[i].vx - space.bodies[j].vx, 2) + Math.pow(space.bodies[i].vy - space.bodies[j].vy, 2)) > .01);
											space.bodies[j].orbiting = ((gForce) / Math.sqrt(Math.pow(space.bodies[j].vx - space.bodies[i].vx, 2) + Math.pow(space.bodies[j].vy - space.bodies[i].vy, 2)) > .01);
											//console.time("gravityLoop")
											//var angle = Math.atan2(space.bodies[j].y - space.bodies[i].y, space.bodies[j].x - space.bodies[i].x);
											if (space.bodies[j].pulls)
											{
												//GForce times the normalized vector (direction to move in) divided by the mass (inertia)
												space.bodies[i].vx -= (gForce * xDist) / (distance * space.bodies[i].m);
												space.bodies[i].vy -= (gForce * yDist) / (distance * space.bodies[i].m);
											}

											if (space.bodies[i].pulls)
											{
												//GForce times the normalized vector (direction to move in) divided by the mass (inertia)
												space.bodies[j].vx += (gForce * xDist) / (distance * space.bodies[j].m);
												space.bodies[j].vy += (gForce * yDist) / (distance * space.bodies[j].m);
											}
											//console.timeEnd("gravityLoop")
										}

										if (!space.bodies[i].orbiting)
										{
											space.bodies[i].topP = undefined;
										}
										if ((gForce > space.bodies[i].temp.top || space.bodies[j] == undefined) && space.bodies[i].orbiting)
										{
											space.bodies[i].temp.topD = distance
											space.bodies[i].temp.topP = space.bodies[j];
											space.bodies[i].temp.top = gForce;
										}
										if ((gForce > space.bodies[j].temp.top || space.bodies[i] == undefined) && space.bodies[j].orbiting)
										{
											space.bodies[j].temp.topD = distance
											space.bodies[j].temp.topP = space.bodies[i];
											space.bodies[j].temp.top = gForce;
										}
									}
								}
							}

							if (space.bodies[i] != undefined)
							{
								if (!space.showingOrbitStrength || space.bodies.length < 2 || space.bodies[i].topP == undefined)
								{
									space.bodies[i].connection.changePoint(1, space.bodies[i].x, space.bodies[i].y);
									space.bodies[i].connection.changePoint(-1, space.bodies[i].x, space.bodies[i].y);
								}
								space.bodies[i].topP = space.bodies[i].temp.topP;
								space.bodies[i].topD = space.bodies[i].temp.topD;
								space.bodies[i].top = space.bodies[i].temp.top;
							}
						}
						space.templetiables.hoveringBool = false;

						if (!space.templetiables.hoveringBool && space.bodies.indexOf(space.hovering) != -1 && space.hovering)
						{
							space.hovering = undefined;
						}

						if (space.ship)
						{
							if (space.ship.above == undefined)
							{
								if (Library.keyboard.keyDown.indexOf(38) != -1) //Up
								{
									space.ship.vy += -Math.cos(space.ship.rotation * (Math.PI/180)) * .15;
									space.ship.vx += -Math.sin(space.ship.rotation * (Math.PI/180)) * .15;
								}
								if (Library.keyboard.keyDown.indexOf(40) != -1) //Down
								{
									space.ship.vy += Math.cos(space.ship.rotation * (Math.PI/180)) * .15;
									space.ship.vx += Math.sin(space.ship.rotation * (Math.PI/180)) * .15;
								}
								if (Library.keyboard.keyDown.indexOf(37) != -1) //Left
								{
									space.ship.rotation += 3
								}
								if (Library.keyboard.keyDown.indexOf(39) != -1) //Right
								{
									space.ship.rotation += -3
								}
							}
							else
							{

								if (Library.keyboard.keyDown.indexOf(38) != -1 && space.ship.ready === true) //Up
								{
									//https://www.desmos.com/calculator/gyrtjyv812
									var small = -(1/2250000)*space.ship.above.m*space.ship.above.m+(7/1500)*space.ship.above.m+(52/9);
									var large = -(999458599/449997524101127500000)*space.ship.above.m*space.ship.above.m+(610351559463379/274656691956254560)*space.ship.above.m+(45074348702373590/6543055891916695);
									var escapeVelocity = Math.max(small, large)

									space.ship.vy = space.ship.above.vy + -Math.cos(space.ship.rotation * (Math.PI/180)) * escapeVelocity;
									space.ship.vx = space.ship.above.vx + -Math.sin(space.ship.rotation * (Math.PI/180)) * escapeVelocity;

									space.ship.above.under.splice(space.ship.above.under.indexOf(space.ship), 1)
									space.ship.above = undefined;
								}
								else {
									if (Library.keyboard.keyDown.indexOf(37) != -1) //Left
									{
										var angle = Math.atan2(space.ship.above.y - space.ship.y, space.ship.above.x - space.ship.x)
										space.ship.x = space.ship.above.x - Math.cos(angle - Math.PI / 30) * (space.ship.above.r + 3);
										space.ship.y = space.ship.above.y - Math.sin(angle - Math.PI / 30) * (space.ship.above.r + 3);
										space.ship.rotation = 90 - angle * 180 / Math.PI + 6;
									}
									if (Library.keyboard.keyDown.indexOf(39) != -1) //Right
									{
										var angle = Math.atan2(space.ship.above.y - space.ship.y, space.ship.above.x - space.ship.x)
										space.ship.x = space.ship.above.x - Math.cos(angle + Math.PI / 30) * (space.ship.above.r + 3);
										space.ship.y = space.ship.above.y - Math.sin(angle + Math.PI / 30) * (space.ship.above.r + 3);
										space.ship.rotation = 90 - angle * 180 / Math.PI - 6;
									}
									if (Library.keyboard.keyDown.indexOf(40) != -1) //Down
									{
										space.ship.above.vy += Math.cos(space.ship.rotation * (Math.PI/180)) * .05;
										space.ship.above.vx += Math.sin(space.ship.rotation * (Math.PI/180)) * .05;
									}
								}
							}
						}
						space.bodies.forEach(updatePositions); //Needs to happen after velocities are calculated
						for (var i = 0; i < space.bodies.length; i++) //Needs to happen after everything has moved
						{
							if (space.bodies[i].topP != undefined && space.bodies[i] != undefined && space.bodies[i].top != 0 && space.showingOrbitStrength)
							{
								color = Library.color.hslToRgb((240/360) - (((space.bodies[i].top - ((space.bodies[i].top > 240) * (space.bodies[i].top - 240))) / 360)), 1, .5)
								space.bodies[i].connection.color = Library.color.rgbToHex(color[0], color[1], color[2])
								space.bodies[i].connection.changePoint(1, space.bodies[i].x, space.bodies[i].y)
								space.bodies[i].connection.changePoint(-1, space.bodies[i].topP.x, space.bodies[i].topP.y)
							}
						}
					}

					space.dragging = (Library.mouse.rightDown && !space.buttonClicked && !space.setting);

					if(Library.mouse.leftDown && !space.buttonClicked && !space.setting)
					{
						if (Library.keyboard.keyDown.length == 0 && space.placeMode !== 1)
						{
							space.previews[0].line.changePoint(-1, Library.mouse.x, Library.mouse.y)


							space.previews[0].line.width = 2;
							space.previews[0].line.color = "#FF0000"
							if (space.focus.focusing && space.placeMode === 0)
							{
								if (space.optimalBallOne === space.hovering)
								{
									space.previews[0].line.changePoint(-1, space.optimalBallOne.x, space.optimalBallOne.y)
								}
								else if (space.optimalBallTwo === space.hovering)
								{
									space.previews[0].line.changePoint(-1, space.optimalBallTwo.x, space.optimalBallTwo.y)
								}
								else
								{
									space.previews[0].line.changePoint(-1, Library.mouse.x, Library.mouse.y)
								}

								space.optimalBallOne.visible = true;
								space.optimalBallTwo.visible = true;
								var xDist = space.focus.planet.x - Library.mouse.origXPos;
								var yDist = space.focus.planet.y - Library.mouse.origYPos;
								var previewDistance = Math.sqrt(xDist * xDist + yDist * yDist);
								var strength = (Math.sqrt((space.constant * ((space.placeSize) + space.focus.planet.m)) / previewDistance) * space.fireStrength)
								var xLine = (yDist/previewDistance) * strength
								var yLine = (-xDist/previewDistance) * strength

								var optimalOne = {
									x: Library.mouse.origXPos + xLine + (space.focus.planet.vx * space.fireStrength * ((!space.pathFind * 2) - 1)),
									y:Library.mouse.origYPos + yLine + (space.focus.planet.vy * space.fireStrength * ((!space.pathFind * 2) - 1))
								}
								var optimalTwo = {
									x: Library.mouse.origXPos - xLine + (space.focus.planet.vx * space.fireStrength * ((!space.pathFind * 2) - 1)),
									y: Library.mouse.origYPos - yLine + (space.focus.planet.vy * space.fireStrength * ((!space.pathFind * 2) - 1))
								}

								var distanceOne = Math.sqrt(Math.pow((optimalOne.x - Library.mouse.x), 2) + Math.pow((optimalOne.y - Library.mouse.y), 2))
								var distanceTwo = Math.sqrt(Math.pow((optimalTwo.x - Library.mouse.x), 2) + Math.pow((optimalTwo.y - Library.mouse.y), 2))
								var finalDistance = distanceOne * (distanceOne < distanceTwo) + distanceTwo * (distanceTwo < distanceOne)

								space.optimalBallOne.x = optimalOne.x;
								space.optimalBallOne.y = optimalOne.y;
								space.optimalBallTwo.x = optimalTwo.x;
								space.optimalBallTwo.y = optimalTwo.y;

								space.previews[0].line.color = Library.color.rgbToHex(finalDistance, 255 - finalDistance, 0)
							}

							//Code for showing the path of the planet when let go
							if (space.pathFind)
							{
								space.pathLine.clearPoints();
								space.pathLine.changePoint(1, space.previews[0].line.coordSet[0].x, space.previews[0].line.coordSet[0].y)
								space.pathLine.changePoint(2, space.previews[0].line.coordSet[0].x, space.previews[0].line.coordSet[0].y)
								var pathObj = {
									x: space.previews[0].line.coordSet[0].x,
									y: space.previews[0].line.coordSet[0].y,
									vx: ((space.pathFind * 2) - 1) * (space.previews[0].line.coordSet[0].x - space.previews[0].line.coordSet[1].x) / space.fireStrength,
									vy: ((space.pathFind * 2) - 1) * (space.previews[0].line.coordSet[0].y - space.previews[0].line.coordSet[1].y) / space.fireStrength,
									r: space.previews[0].preview.r,
									m: space.placeSize
								}
								loop: {for (var i = 0; i < space.pathLength; i++)
								{


									space.pathLine.addPoint(pathObj.x, pathObj.y)
									for (var j = 0; j < space.bodies.length; j++)
									{
										var xDist = pathObj.x - space.bodies[j].x;
										var yDist = pathObj.y - space.bodies[j].y;
										var distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
										var gForce = ((space.constant * pathObj.m * space.bodies[j].m) / Math.pow(distance, 2));
										pathObj.vx += (((space.bodies[j].x - pathObj.x) / distance) * gForce) / pathObj.m;
										pathObj.vy += (((space.bodies[j].y - pathObj.y) / distance) * gForce) / pathObj.m;
										if (distance < pathObj.r + space.bodies[j].r)
										{
											space.pathLine.changePoint(-1, space.bodies[j].x, space.bodies[j].y)
											break loop;
										}

									}
									pathObj.x += pathObj.vx
									pathObj.y += pathObj.vy
								}}
							}
							var newMainStatsString = "Drag X Velocity: " + ((-(space.previews[0].line.coordSet[0].x - space.previews[0].line.coordSet[1].x) / space.fireStrength).toFixed(3)) + "\nDrag Y Velocity: " + ((-(space.previews[0].line.coordSet[0].y - space.previews[0].line.coordSet[1].y) / space.fireStrength).toFixed(3)) + "\nCelestial Bodies: " + space.bodies.length + "\nMass: " + Library.newMath.toOnes(space.placeSize, 9) + "\nZoom Level: " + Math.round(Math.log(scene.scaleX)/Math.log(10/9))
							if (true || space.mainStats.text !== newMainStatsString)
							{
								space.mainStats.text = newMainStatsString
							}
						}
					}
					else
					{
						for (var i = 0; i < space.previews.length; i++)
						{
							space.previews[i].line.changePoint(1, Library.mouse.x, Library.mouse.y);
							space.previews[i].line.changePoint(-1, Library.mouse.x, Library.mouse.y);
							space.previews[i].line.width = 0;
							space.pathLine.changePoint(1, Library.mouse.x, Library.mouse.y);
							space.pathLine.changePoint(-1, Library.mouse.x, Library.mouse.y);
							space.pathLine.width = 0;
						}

						space.previews[0].preview.x = Library.mouse.x
						space.previews[0].preview.y = Library.mouse.y

						space.galaxyBox.preview.x = Library.mouse.x
						space.galaxyBox.preview.y = Library.mouse.y

						space.previewShip.x = Library.mouse.x
						space.previewShip.y = Library.mouse.y
					}
				},
				editCorners: function()
				{
					setTimeout(function(){
						var inc = 0;
						var size = Library.object.size(space.buttons) - 1
						var margin = 10;
						for (var btn in space.buttons)
						{
							if (btn != "exit")
							{
								space.buttons[btn].x = Math.floor((scene.canvas.width / 2) - (size * (16 + margin) / 2) + (inc * 16)) + (margin * inc)
								space.buttons[btn].y = Math.floor(scene.canvas.height - space.buttons[btn].height) - margin
								inc++;
							}
						}

						space.galaxyBox.back.y = scene.canvas.height - 210;
						for (var i in space.galaxyBox.bars)
						{
							space.galaxyBox.bars[i].y = scene.canvas.height - 185;
							space.galaxyBox.labels[i].y = scene.canvas.height - 30
						}
						space.galaxyBox.sliders.density.y = space.galaxyBox.bars.density.y + (140 - (space.galaxyBox.density - .01) * 140)
						space.galaxyBox.sliders.size.y = space.galaxyBox.bars.size.y + Math.round(140 - (space.galaxyBox.size / 300) * 140)
						space.galaxyBox.sliders.speed.y = space.galaxyBox.bars.speed.y + (140 - (space.galaxyBox.speed - .01) * 140)
						//space.galaxyBox.sliders.size.y = space.galaxyBox.bars.size.y + space.galaxyBox.bars.density.height - (space.galaxyBox.density * 140) - 10

						space.metaBox.back.changePosition(50, 50, -1, -1, -1, scene.canvas.width - 100, scene.canvas.height - 100)
						space.metaBox.exit.changePosition(space.metaBox.back.width + space.metaBox.back.x - 34, space.metaBox.back.y + 20)

						if (space.bgHiding == 0)
						{
							for (var i = 0; i < space.bgBoxes.length; i++)
							{
								space.bgBoxes[i].x = scene.canvas.width - (space.bgBoxes[i].width + 5)
								space.bgBoxes[i].y = (space.bgBoxes[i].height + 7)*i + 5;
							}
							space.bgBack.x = scene.canvas.width - 74;
							space.bgToggleArrows[0].x = scene.canvas.width - 88;
							space.bgToggleBtn.x = scene.canvas.width - 85;
							space.bgToggleArrows[0].visible = false;
						}
						else if (space.bgHiding == 2)
						{
							for (var i = 0; i < space.bgBoxes.length; i++)
							{
								space.bgBoxes[i].x = scene.canvas.width + 1
								space.bgBoxes[i].y = (space.bgBoxes[i].height + 7)*i + 5;
							}
							space.bgBack.x = scene.canvas.width - 17;
							space.bgToggleArrows[0].x = scene.canvas.width - 14;
							space.bgToggleBtn.x = scene.canvas.width - 15;
						}

						if (isFullScreen)
						{
							space.bgToggleArrows[0].y = (space.bgBack.y + space.bgBack.height) / 2
						}
						else
						{
							space.bgToggleArrows[0].y = (scene.canvas.height - space.bgToggleArrows[0].height) / 2
						}

						space.achievement.title.x = scene.canvas.width / 2
						space.achievement.title.y = scene.canvas.height - space.achievement.title.height - 50
						space.achievement.icon.x = space.achievement.title.x - space.achievement.title.width / 2 - 79
						space.achievement.icon.y = (space.achievement.title.y + space.achievement.title.height / 2) - (space.achievement.icon.height / 2)

						space.tips.text.x = scene.canvas.width / 2

						space.tips.previous.x = space.tips.text.x - (space.tips.text.width / 2) - space.tips.previous.width - 7
						space.tips.previous.y = space.tips.text.y + (space.tips.text.height - space.tips.previous.height) / 2

						space.tips.next.x = space.tips.text.x + (space.tips.text.width / 2) + 7
						space.tips.next.y = space.tips.text.y + (space.tips.text.height - space.tips.previous.height) / 2

						space.tips.showButton.x = space.tips.text.x - 12 - space.tips.text.width / 2;

						if (space.tips.onTip in space.tips.attached)
						{
							space.tips.arrow.x = space.tips.attached[space.tips.onTip].x;
							space.tips.arrow.y = space.tips.attached[space.tips.onTip].y - 16
						}
					}, 300)

				}
			}


			//**************************//
			//       VISUAL SETUP       //
			//**************************//
			this.requestPreset.text.setProperties({align: "center",  y: (scene.canvas.height - this.requestPreset.container.height) / 2 + 40})

			for (var key in this.requestPreset)
			{
				if (key == "accept" || key == "deny")
				{
					this.requestPreset[key].addEventListener("mouseEnter", function(){
						this.setProperties({color: "#333333", backColor: "rgb(0, 160, 222)"})
						scene.changeMouse("pointer")
					})
					this.requestPreset[key].addEventListener("mouseLeave", function(){
						this.setProperties({color: "rgb(0, 160, 222)", backColor: "#333333"})
						scene.changeMouse("default")
					})
				}
				this.requestPreset[key].fixed = true;
				this.requestPreset[key].visible = false;
			}

			var hideRequest = function(){
				for (var key in space.requestPreset)
				{
					space.requestPreset[key].animate({y: space.requestPreset[key].y - 500, opacity: 0}, 750, "inQuad", function(){this.visible = false;})
				}
				localStorage.removeItem("preset")
				scene.changeMouse("default")
				space.previews[0].preview.visible = true;
			}
			this.requestPreset.accept.addEventListener("click", function(){
				placeSet(localStorage.getItem("preset"));
				hideRequest();
			})
			this.requestPreset.deny.addEventListener("click", function(){
				hideRequest();
			})

			this.requestPreset.accept.x = (scene.canvas.width - (this.requestPreset.container.width - this.requestPreset.accept.width)) / 2 + 100
			this.requestPreset.accept.y = (scene.canvas.height + (this.requestPreset.container.height - this.requestPreset.accept.height)) / 2 - 25

			this.requestPreset.deny.x = (scene.canvas.width + (this.requestPreset.container.width - this.requestPreset.deny.width)) / 2 - 100
			this.requestPreset.deny.y = (scene.canvas.height + (this.requestPreset.container.height - this.requestPreset.deny.height)) / 2 - 25

			this.requestPreset.container.setProperties({centered: true, border: true, borderColor: "#555555", borderSize: 3, borderRadius: 10});
			this.requestPreset.accept.setProperties({centered: true, back: true, backColor: "#333333", backBorder: true, backBorderSize: 2, backBorderColor: "rgb(0, 160, 222)", backBorderRadius: 5, padding: 10});
			this.requestPreset.deny.setProperties({centered: true, back: true, backColor: "#333333", backBorder: true, backBorderSize: 2, backBorderColor: "rgb(0, 160, 222)", backBorderRadius: 5, padding: 10});


			this.tips.attached = {4: this.buttons.pause, 6: this.buttons.trace, 10: this.buttons.settings, 11: this.buttons.nextFrame, 12: this.buttons.fullscreen, 14: this.buttons.reset,}

			this.galaxyBox.shapesHere.push(this.galaxyBox.back, this.galaxyBox.planetCounter)/////////////////////////////////VVV

			this.metaBox.exit = this.buttons.exit;

			this.galaxyBox.back.setProperties({fixed: true, border: true, borderColor: "rgb(0, 160, 222)", borderRadius: 15});
			this.atFront.push(this.galaxyBox.back)
			for (var i in this.galaxyBox.bars)
			{
				this.galaxyBox.shapesHere.push(this.galaxyBox.bars[i], this.galaxyBox.sliders[i], this.galaxyBox.labels[i])//^^^
				this.atFront.push(this.galaxyBox.bars[i], this.galaxyBox.sliders[i], this.galaxyBox.labels[i])

				this.galaxyBox.sliders[i].border = true;
				this.galaxyBox.sliders[i].borderColor = "rgb(0, 160, 222)";


				this.galaxyBox.bars[i].fixed = true;
				this.galaxyBox.sliders[i].fixed = true;
				this.galaxyBox.labels[i].fixed = true;

				this.galaxyBox.bars[i].which = i;
				this.galaxyBox.sliders[i].which = i;
				this.galaxyBox.labels[i].which = i;

				this.galaxyBox.labels[i].align = "center";
			}

			for (var i = 0; i < this.galaxyBox.shapesHere.length; i++)
			{
				this.galaxyBox.shapesHere[i].visible = false;
			}

			this.atFront.push(this.galaxyBox.planetCounter, this.massHighlighter, this.buttons.save, this.buttons.pathFind, this.buttons.placeMode, this.buttons.settings, this.mainStats, this.metaBox.back, this.buttons.pause, this.buttons.reset, this.buttons.trace, this.buttons.qustn, this.metaBox.exit, this.buttons.nextFrame, this.buttons.connect, this.buttons.fullscreen, /*this.galaxyBox.preview, */this.bgBack, this.bgToggleBtn, this.bgToggleArrows[0], this.achievement.title, this.achievement.icon, this.tips.arrow, this.tips.text, this.tips.showButton, this.tips.previous, this.tips.next, this.helpTxt)
			this.fixed.push(this.bgToggleBtn, this.bgToggleArrows[0], this.tips.arrow, this.tips.previous, this.tips.next, this.tips.text, this.tips.showButton, this.achievement.icon, this.achievement.title, this.galaxyBox.planetCounter, this.massHighlighter,  this.helpTxt, this.buttons.save, this.buttons.pathFind, this.buttons.placeMode, this.buttons.settings, this.buttons.connect, this.mainStats, this.metaBox.back, this.requestPreset.container, this.requestPreset.text, this.requestPreset.accept, this.requestPreset.deny, this.buttons.pause, this.buttons.reset, this.buttons.trace, this.buttons.qustn, this.metaBox.exit, this.buttons.nextFrame, this.buttons.fullscreen, this.bgBack)

			this.buttons.pause.addFrame(0, 16, 16, 16);
			this.buttons.trace.addFrame(16, 16, 16, 16);
			this.buttons.trace.addFrame(16, 32, 16, 16);
			this.buttons.connect.addFrame(0, 48, 16, 16);
			this.buttons.fullscreen.addFrame(32, 48, 16, 16);
			this.buttons.qustn.addFrame(80, 16, 16, 16);
			this.buttons.placeMode.addFrame(48, 16, 16, 16);
			this.buttons.placeMode.addFrame(48, 32, 16, 16);
			this.buttons.placeMode.addFrame(48, 48, 16, 16);
			this.buttons.pathFind.addFrame(64, 16, 16, 16);

			for (var i = 0; i < scene.background.sources.length; i++)
			{
				new backgroundSelector(i)
			}

			//I don't feel like making this code look nice. Its basically css
			this.buttons.fullscreen.changeFrame(isFullScreen)
			this.bgToggleBtn.opacity = 0;
			this.tips.arrow.visible = false
			this.tips.showButton.opacity = 0;
			this.metaBox.back.setProperties({visible: false, border: true, borderColor: "#7070D0", borderSize: 5});
			this.galaxyBox.preview.setProperties({opacity: .2, visible: false});
			this.tips.text.setProperties({align: "center", visible: false, borderColor: "#000000", borderSize: 1, back: true, backColor: "#000000", backBorder: true, backBorderColor: "#01DEA1", padding: 16, paddingLeft: 12, paddingRight: 12});
			this.helpTxt.setProperties({backBorder: true, backBorderColor: "#FFFFFF", backBorderSize: 1, back: true, backColor: "#000000"});
			this.bgToggleArrows[0].setProperties({visible: false, opacity: 0});
			this.tips.previous.setProperties({rotation: 270, visible: false});
			this.tips.next.setProperties({rotation: 90, visible: false});
			this.bgBack.setProperties({border: true, borderColor: "#555555"});
			this.previews[0].preview.setProperties({borderSize: 1.5, borderColor: "#00FFFF"})
			this.previewShip.setProperties({visible: false, centered: true, smooth: false});
			this.achievement.title.setProperties({align: "center", visible: false, border: true, borderSize: 3, borderColor: "#000000", backColor: "#000000", backBorderColor: "#00FFFF", padding: 7});
			this.achievement.icon.setProperties({visible: false, border: true, borderColor: "#FFFFFF"});
			this.focus.outline.toBack();
			this.buttons.exit.visible = false;
			this.optimalBallOne.visible = false;
			this.optimalBallTwo.visible = false;
			this.metaBox.exit.changePosition(this.metaBox.back.width + this.metaBox.back.x - 34, this.metaBox.back.y + 20)

			this.achievement.icon.addFrame(64, 0, 64, 64);
			this.achievement.icon.addFrame(128, 0, 64, 64);
			this.achievement.icon.addFrame(192, 0, 64, 64);

			this.achievement.icon.addFrame(0, 64, 64, 64);
			this.achievement.icon.addFrame(64, 64, 64, 64);
			this.achievement.icon.addFrame(128, 64, 64, 64);
			this.achievement.icon.addFrame(192, 64, 64, 64);

			this.achievement.icon.addFrame(0, 128, 64, 64);
			this.achievement.icon.addFrame(64, 128, 64, 64);
			this.achievement.icon.addFrame(128, 128, 64, 64);
			this.achievement.icon.addFrame(192, 128, 64, 64);

			this.achievement.icon.addFrame(0, 192, 64, 64);
			this.achievement.icon.addFrame(64, 192, 64, 64);
			this.achievement.icon.addFrame(128, 192, 64, 64);
			this.achievement.icon.addFrame(192, 192, 64, 64);

	///////////////////////////////////////////////////////////////////////





			this.buttons.qustn.changeFrame(this.helping)
			scene.background.changeStyle("to", 0);
			this.tips.text.fadeIn(500);
			this.tips.next.fadeIn(500);
			for (var i = 0; i < this.atFront.length; i++)
			{
				this.atFront[i].toFront();
			}

			for (var i = 0; i < this.fixed.length; i++)
			{
				this.fixed[i].fixed = true;
			}

			//**************************//
			//      EVENT LISTENERS     //
			//**************************//
			this.tips.text.addEventListener("click", this.tips.hide)
			this.tips.showButton.addEventListener("click", this.tips.show)
			var keepAcheievementUp = function(){
				clearTimeout(space.achievement.doneTimer)
				space.achievement.title.fadeIn(250)
				space.achievement.icon.fadeIn(250)
			}
			var clearAchievement = function(){
				space.achievement.doneTimer = setTimeout(space.achievement.clearAchievement, 5000);
			};
			this.achievement.title.addEventListener("mouseEnter", keepAcheievementUp);
			this.achievement.title.addEventListener("mouseLeave", clearAchievement);
			this.achievement.icon.addEventListener("mouseEnter", keepAcheievementUp);
			this.achievement.icon.addEventListener("mouseLeave", clearAchievement);

			this.tips.showButton.addEventListener("mouseEnter", function(){
				this.opacity = .5;
			})
			this.tips.showButton.addEventListener("mouseLeave", function(){
				this.opacity = 0;
			})
			this.bgToggleBtn.addEventListener("mouseEnter", function(){
				if (space.bgToggleArrows[0].opacity == 1)
				{
					this.opacity = .5;
				}
			})
			this.bgToggleBtn.addEventListener("mouseLeave", function(){
				this.opacity = 0;
			})
			this.bgToggleBtn.addEventListener("click", function(){
				this.opacity = 0
				if (space.bgHiding == 0) //If going to hide the menu
				{
					space.bgHiding = 1;
					var shiftDistance = space.bgBack.x - (scene.canvas.width - 17)

					for (var i = 0; i < space.bgBoxes.length; i++)
					{
						space.bgBoxes[i].visible = true;
						space.bgBoxes[i].animate({x: space.bgBoxes[i].x - shiftDistance, opacity: 1}, 490, "linear")
					}
					space.bgBack.animate({x: space.bgBack.x - shiftDistance}, 490, "linear")
					space.bgToggleArrows[0].animate({x: space.bgToggleArrows[0].x - shiftDistance, rotation: 180}, 490, "linear")
					space.bgToggleBtn.animate({x: space.bgToggleBtn.x - shiftDistance}, 490, "linear", function(){
						space.bgHiding = 2;
					})
				}
				else if (space.bgHiding == 2) //If going to show the menu
				{
					space.bgHiding = 1;
					var shiftDistance = space.bgBack.x - (scene.canvas.width - 87)
					for (var i = 0; i < space.bgBoxes.length; i++)
					{
						space.bgBoxes[i].visible = true;
						space.bgBoxes[i].animate({x: space.bgBoxes[i].x - shiftDistance, opacity: 1}, 490, "linear")
					}
					space.bgToggleArrows[0].animate({x: space.bgToggleArrows[0].x - shiftDistance, rotation: 0}, 490, "linear")
					space.bgToggleBtn.animate({x: space.bgToggleBtn.x - shiftDistance}, 490, "linear")
					space.bgBack.animate({x: space.bgBack.x - shiftDistance}, 490, "linear", function(){
						space.bgHiding = 0;
						if (!space.bgBack.hovering) //Hide button after opening menu, if mouse isn't hovering anymore
						{
							space.bgBack.animate({x: space.bgBack.x + 13, width: space.bgBack.width - 13}, 200, "linear")
							space.bgToggleArrows[0].animate({x: space.bgToggleArrows[0].x + 13, opacity: 0}, 200, "linear")
						}

					})
				}
				space.bgHiding = 1;
			})
			this.bgBack.addEventListener("mouseEnter", function(){
				this.hovering = true;
				space.bgToggleArrows[0].visible = true;
				if (!Library.mouse.leftDown)
				{
					if (space.placeMode == 0 || space.placeMode == 1)
					{
						space.previews[0].preview.visible = false;
					}
					else if (space.placeMode == 2)
					{
						space.galaxyBox.preview.visible = false;
					}
					else if (space.placeMode == 3)
					{
						space.previewShip.visible = false;
					}
				}
				if (space.bgHiding === 0)
				{
					if (space.bgHiding === 0 && space.bgBack.width === 74)
					{
						space.bgToggleArrows[0].x = space.bgToggleBtn.x + 14;
						space.bgBack.animate({x: space.bgBack.x - 13, width: space.bgBack.width + 13}, 200, "outQuad")
						space.bgToggleArrows[0].animate({x: space.bgToggleArrows[0].x - 13, opacity: 1}, 200, "outQuad")
					}
				}
			})
			this.bgBack.addEventListener("mouseLeave", function(){
				this.hovering = false;
				if (space.placeMode == 0 || space.placeMode == 1)
				{
					space.previews[0].preview.visible = true;
				}
				else if (space.placeMode == 2)
				{
					space.galaxyBox.preview.visible = true;
				}
				else if (space.placeMode == 3)
				{
					space.previewShip.visible = true;
				}

				if (space.bgHiding === 0 && space.bgBack.width === 87)
				{
					space.bgBack.animate({x: space.bgBack.x + 13, width: space.bgBack.width - 13}, 200, "outQuad")
					space.bgToggleArrows[0].animate({x: space.bgToggleArrows[0].x + 13, opacity: 0}, 200, "outQuad")
				}
			})

			this.tips.previous.addEventListener("click", function(){
				if (space.tips.onTip > 0)
					space.tips.loadTip(space.tips.onTip - 1)
			});

			this.tips.next.addEventListener("click", function(){
				if (space.tips.onTip < space.tips.list.length - 1)
					space.tips.loadTip(space.tips.onTip + 1)
			});

			this.resetGame = function()
			{
				new Galaxy("sandbox")
			}

			window.saveSet = function(){//\n\t\"__\":" +  + ",
				var focusIndex = -1;
				var planetString = "{\n\t\"constant\":" + space.constant + ",\n\t\"paused\":" + space.paused + ",\n\t\"zoomX\":" + scene.scaleX + ",\n\t\"zoomY\":" + scene.scaleY + ",\n\t\"transX\":" + scene.translateX + ",\n\t\"transY\":" + scene.translateY + ",\n\t\"bg\":" + space.background + ",\n\t\"bodies\":[";
				for (var i = 0; i < space.bodies.length; i++)
				{
					if (i > 0)
					{
						planetString += ",";
					}
					if (space.focus.planet == space.bodies[i])
					{
						focusIndex = i;
					}

					if (space.bodies[i].bodyType === 1 || space.bodies[i].bodyType === 0)
					{
						planetString += "\n\t\t" + JSON.stringify({id: i, x: space.bodies[i].x, y: space.bodies[i].y, vx: space.bodies[i].vx, vy: space.bodies[i].vy, m: space.bodies[i].m, bodyType: space.bodies[i].bodyType})
					}
					else if (space.bodies[i].bodyType === 2)
					{
						planetString += "\n\t\t" + JSON.stringify({id: i, x: space.bodies[i].x, y: space.bodies[i].y, vx: space.bodies[i].vx, vy: space.bodies[i].vy, rotation: space.bodies[i].rotation, bodyType: space.bodies[i].bodyType})
					}
				}
				var finalString = planetString + "\n\t],\n\t\"focusIndex\":" + focusIndex + "\n}";
				return finalString;
			}

			//Example: [{x:x, y:y, vx:vx, vy:vy, m:m, bodyType:bodyType},{x:x, y:y, vx:vx, vy:vy, m:m, bodyType:bodyType}]
			window.placeSet = function(obj){
				var cleanObj = obj.replace(/\n|\t/gmi,"").replace(/:\"/gmi,':').replace(/\",/gmi,',').replace(/\"\}/gmi,'}');
				var presetObject = JSON.parse(cleanObj);
				if (!space.focus.focusing)
				{
					scene.zoom((presetObject.zoomX || scene.scaleX)/scene.scaleX, (presetObject.zoomY || scene.scaleY)/scene.scaleY)
					scene.setOffset(presetObject.transX || scene.translateX, presetObject.transY || scene.translateY);
				}
				if (presetObject.bodies && Array.isArray(presetObject.bodies))
				{
					for (var i = 0; i < presetObject.bodies.length; i++)
					{

						var body;
						if (presetObject.bodies[i].star !== undefined)
						{
							presetObject.bodies[i].bodyType = +presetObject.bodies[i].star;
						}

						if (presetObject.bodies[i].bodyType === 1 || presetObject.bodies[i].bodyType === 0 || presetObject.bodies[i].bodyType === false)
						{
							var body = createSandboxPlanet(presetObject.bodies[i].x, presetObject.bodies[i].y, presetObject.bodies[i].m, presetObject.bodies[i].vx, presetObject.bodies[i].vy)
							if (presetObject.bodies[i].bodyType === "1" || presetObject.bodies[i].bodyType === 1 || presetObject.bodies[i].bodyType === true)
							{
								body.starify();
							}
						}
						else if (presetObject.bodies[i].bodyType === 2)
						{
							var body = createSandboxShip(presetObject.bodies[i].x, presetObject.bodies[i].y, presetObject.bodies[i].vx, presetObject.bodies[i].vy);
							body.rotation = presetObject.bodies[i].rotation;
						}
						if (presetObject.focusIndex !== undefined && !space.focus.focusing && presetObject.focusIndex == i)
						{
							body.focus();
						}

					}
				}
				else if (presetObject.focusIndex && presetObject.focusIndex <= space.bodies.length)
				{
					space.bodies[presetObject.focusIndex].focus()
				}

				space.bgBoxes[(presetObject.bg !== undefined) ? presetObject.bg: scene.background.style].trigger("mouseUp");
				space.constant = presetObject.constant || space.constant;

				if (space.paused != presetObject.paused && space.constant)
				{
					togglePause();
				}

			}

			if (localStorage.getItem("savedPreset"))
			{
				placeSet(localStorage.getItem("savedPreset"))
			}
			else if (localStorage.getItem("preset"))
			{

				this.previews[0].preview.visible = false;
				var shiftDistance = scene.canvas.height - this.requestPreset.container.y + this.requestPreset.container.height / 2;
				var that = this;

				for (var key in that.requestPreset)
				{
					this.requestPreset[key].y += shiftDistance;
					this.requestPreset[key].visible = true;
					this.requestPreset[key].opacity = 0;
					this.requestPreset[key].animate({y: this.requestPreset[key].y - shiftDistance, opacity: 1}, 1000, "outQuad")
				}
			}


			space.tips.loadTip(0);
			this.begin();
		}
		else if (mode === "adventure")
		{
			space.constant = .1;
			scene.background.changeStyle("to", 3);


			this.buttons = {       //Any GUI that could be clicked on
				pause: new Sprite(scene.imageObjects.iconSheet, 0, 0, 0, 0, 16, 16),
				fullscreen: new Sprite(scene.imageObjects.iconSheet, 0, 0, 32, 32, 16, 16)
			};

			this.loadScreen = new Rectangle(0, -scene.canvas.height / 2, scene.canvas.width, scene.canvas.height, "#333333")
			this.loadScreen.setProperties({fixed: true})
			this.loadScreen.animate({y: 0}, 750, "outBounce")

			this.loadText = new Text(scene.canvas.width / 2, 0, "Loading Game", 40, "Consolas", "rgb(0, 160, 222)")
			this.loadText.setProperties({fixed: true, centered: true})
			this.loadText.animate({y: scene.canvas.height / 2}, 750, "outBounce", beginGeneration)

			this.enterPlanetBtn = new Text(scene.canvas.width / 2, scene.canvas.height - 75, "Click to Exit Spaceship", 24, "Consolas", "rgb(0, 160, 222)")
			this.enterPlanetBtn.setProperties({centered: true, back: true, backColor: "#333333", backBorder: true, backBorderSize: 2, backBorderColor: "rgb(0, 160, 222)", backBorderRadius: 5, padding: 10, fixed: true, visible: false})
			this.enterPlanetBtn.addEventListener("mouseEnter", function(){
				if (space.ship.above)
				{
					this.setProperties({color: "#333333", backColor: "rgb(0, 160, 222)"})
					scene.changeMouse("pointer")
				}
			})
			this.enterPlanetBtn.addEventListener("mouseLeave", function(){
				this.setProperties({color: "rgb(0, 160, 222)", backColor: "#333333"})
				scene.changeMouse("default")
			})
			this.enterPlanetBtn.addEventListener("click", function(){
				if (space.ship.above)
				{
					this.opacity = 1;
					this.animate({opacity: 0, y: scene.canvas.height}, 500, "outQuad", function(){this.visible = false; this.opacity = 1;})
					space.enterPlanet();
				}
			})

			space.atFront.push(this.buttons.pause, this.buttons.fullscreen, this.enterPlanetBtn, this.loadScreen, this.loadText)

			this.buttons.pause.fixed = this.buttons.fullscreen.fixed = true;
			this.buttons.pause.addFrame(0, 16, 16, 16);
			this.buttons.fullscreen.addFrame(32, 48, 16, 16);
			this.buttons.pause.addEventListener("click", togglePause)
			this.buttons.fullscreen.addEventListener("click", toggleFullScreen)

			this.enterPlanet = function(){
				console.log(space.ship.above);

				space.loadScreen.visible = space.loadText.visible =  true;
				space.loadScreen.animate({y: 0}, 750, "outBounce")
				space.loadText.animate({y: scene.canvas.height / 2}, 750, "outBounce", function(){new World()})
			}
			function updatePositions(element, i, array)
			{
				element.age++;
				if (element.bodyType === 0)
				{
					element.shadow.rotation = (180 / Math.PI) * -Math.atan2(space.star.y - element.y, space.star.x - element.x)
					element.rotation += element.vr;
				}
				if (!space.paused)
				{
					if (element.above == undefined)
					{

						element.x += element.vx;
						element.y += element.vy;

						for (var j = 0; j < element.under.length; j++)
						{
							var oldX = element.under[j].x;
							var oldY = element.under[j].y;
							//element.under[j].x += element.vx;
							//element.under[j].y += element.vy;



							var vrInRadians = (Math.PI / 180) * element.vr
							var angle = Math.atan2(element.y - (element.under[j].y + element.vy), element.x - (element.under[j].x + element.vx))
							element.under[j].x = element.x - Math.cos(angle - vrInRadians) * (element.r + element.under[j].vertShift);
							element.under[j].y = element.y - Math.sin(angle - vrInRadians) * (element.r + element.under[j].vertShift);
							element.under[j].rotation = 90 - angle * 180 / Math.PI + vrInRadians;

							element.under[j].vx = element.under[j].x - oldX;
							element.under[j].vy = element.under[j].y - oldY;
						}
					}
				}

				if (element.attached)
				{
					for (var j = 0; j < element.attached.length; j++)
					{
						element.attached[j].shape.x = element.x + element.attached[j].x;
						element.attached[j].shape.y = element.y + element.attached[j].y;
					}
				}
			}
			this.events = {
				keyDown: function(event)
				{
					if (lastClicked == scene.canvas || $("#game:hover")[0] === scene.canvas)
					{
						if (!space.paused && space.ship)
						{
							if (Library.keyboard.keyDown.indexOf(38) != -1 && Library.keyboard.keyDown.indexOf(40) != -1)
							{
								space.ship.changeFrame(3)
							}
							else if (Library.keyboard.keyDown.indexOf(38) != -1) //Up
							{
								space.ship.changeFrame(1)
							}
							else if (Library.keyboard.keyDown.indexOf(40) != -1) //Down
							{
								space.ship.changeFrame(2)
							}
						}
					}
				},
				keyUp: function(e)
				{
					if (lastClicked == scene.canvas || $("#game:hover")[0] === scene.canvas)
					{
						if (!space.paused && space.ship)
						{
							if (Library.keyboard.keyDown.indexOf(38) == -1 && Library.keyboard.keyDown.indexOf(40) == -1) //Both Released
							{
								space.ship.changeFrame(0)
							}
							else if (Library.keyboard.lastPressed == 38 && Library.keyboard.keyDown.indexOf(40) != -1) //If down is still held
							{
								space.ship.changeFrame(2)
							}
							else if (Library.keyboard.keyDown.indexOf(38) != -1 && Library.keyboard.lastPressed == 40) //If up is still held
							{
								space.ship.changeFrame(1)
							}
						}
					}
					if (Library.keyboard.lastPressed == 32)
					{
						togglePause();
					}
				},
				scroll: function(event)
				{
					event.preventDefault()
					if (Library.keyboard.keyDown.indexOf(17) != -1)
					{
						scene.zoom(Math.pow(10/9, Library.mouse.wheel), Math.pow(10/9, Library.mouse.wheel), Library.mouse.canvasXPos, Library.mouse.canvasYPos)
					}
				},
				clickEvent: function(event)
				{

				},
				mouseDown: function(event){


				},
				mouseUp: function(event)
				{

				},
				mouseMove: function(event)
				{

				},
				onFrame: function()
				{
					if (!space.paused)
					{
						for (var i = 0; i < space.bodies.length; i++)
						{
							for (var j = 0; j < space.bodies.length; j++)
							{
								if (j > i && space.bodies[j] != undefined && space.bodies[i] != undefined && !(space.bodies[i] === space.ship && space.bodies[j] === space.ship.above) && !(space.bodies[j] === space.ship && space.bodies[i] === space.ship.above))
								{
									//'i' represents the index of the planet being checked, 'j' represents the index of the planet that 'i' is being checked against
									var xDist = space.bodies[i].x - space.bodies[j].x;
									var yDist = space.bodies[i].y - space.bodies[j].y;
									var distance = Math.sqrt((xDist * xDist) + (yDist * yDist));
									var gForce = space.speed * ((space.constant * space.bodies[i].m * space.bodies[j].m) / (distance * distance));
									var collision = distance <= space.bodies[i].r + space.bodies[j].r//colliding(space.bodies[i], space.bodies[j])

									//console.log(xDist, yDist, distance, gForce, collision)
									if (collision) //Actual code for collision detection
									{
										space.bodies[i].collide(space.bodies[i], space.bodies[j]); //Run code that removes 'i' and 'j', and adds in a new planet with the combined velocities and mass
										continue;
									}
									else
									{
										//var angle = Math.atan2(space.bodies[j].y - space.bodies[i].y, space.bodies[j].x - space.bodies[i].x);
										if (space.bodies[j].pulls)
										{
											space.bodies[i].vx -= (gForce * ((space.bodies[j].x - space.bodies[i].x) / distance)) / space.bodies[i].m;//(gForce * Math.cos(angle)) / space.bodies[i].m;
											space.bodies[i].vy -= (gForce * ((space.bodies[j].y - space.bodies[i].y) / distance)) / space.bodies[i].m;//(gForce * Math.sin(angle)) / space.bodies[i].m;
										}

										if (space.bodies[i].pulls)
										{
											space.bodies[j].vx += (gForce * ((space.bodies[i].x - space.bodies[j].x) / distance)) / space.bodies[j].m;//(gForce * Math.cos(angle)) / -space.bodies[j].m;
											space.bodies[j].vy += (gForce * ((space.bodies[i].y - space.bodies[j].y) / distance)) / space.bodies[j].m;//(gForce * Math.sin(angle)) / -space.bodies[j].m;
										}
										//console.timeEnd("gravityLoop")
									}
								}
							}
						}
						if (!window.planet)
						{
							if (space.ship.above == undefined)
							{
								if (Library.keyboard.keyDown.indexOf(38) != -1) //Up
								{
									space.ship.vy += -Math.cos(space.ship.rotation * (Math.PI/180)) * .15;
									space.ship.vx += -Math.sin(space.ship.rotation * (Math.PI/180)) * .15;
								}
								if (Library.keyboard.keyDown.indexOf(40) != -1) //Down
								{
									space.ship.vy += Math.cos(space.ship.rotation * (Math.PI/180)) * .15;
									space.ship.vx += Math.sin(space.ship.rotation * (Math.PI/180)) * .15;
								}
								if (Library.keyboard.keyDown.indexOf(37) != -1) //Left
								{
									space.ship.rotation += 3
								}
								if (Library.keyboard.keyDown.indexOf(39) != -1) //Right
								{
									space.ship.rotation += -3
								}
							}
							else
							{
								if (Library.keyboard.keyDown.indexOf(38) != -1 && space.ship.ready === true) //Up
								{
									//https://www.desmos.com/calculator/gyrtjyv812
									var small = -(1/2250000)*space.ship.above.m*space.ship.above.m+(7/1500)*space.ship.above.m+(52/9);
									var large = -(999458599/449997524101127500000)*space.ship.above.m*space.ship.above.m+(610351559463379/274656691956254560)*space.ship.above.m+(45074348702373590/6543055891916695);
									var escapeVelocity = 10//Math.max(small, large)

									space.ship.vy = space.ship.vy + -Math.cos(space.ship.rotation * (Math.PI/180)) * escapeVelocity;
									space.ship.vx = space.ship.vx + -Math.sin(space.ship.rotation * (Math.PI/180)) * escapeVelocity;

									space.ship.above.under.splice(space.ship.above.under.indexOf(space.ship), 1)
									space.ship.above = undefined;

									space.enterPlanetBtn.opacity = 1;
									space.enterPlanetBtn.animate({opacity: 0, y: scene.canvas.height}, 500, "outQuad", function(){this.visible = false; this.opacity = 1;})
								}
								else {
									if (Library.keyboard.keyDown.indexOf(37) != -1) //Left
									{
										var angle = Math.atan2(space.ship.above.y - space.ship.y, space.ship.above.x - space.ship.x)
										space.ship.x = space.ship.above.x - Math.cos(angle - Math.PI / space.ship.above.r) * (space.ship.above.r + space.ship.vertShift);
										space.ship.y = space.ship.above.y - Math.sin(angle - Math.PI / space.ship.above.r) * (space.ship.above.r + space.ship.vertShift);
										space.ship.rotation = 90 - angle * 180 / Math.PI + 6;
									}
									if (Library.keyboard.keyDown.indexOf(39) != -1) //Right
									{
										var angle = Math.atan2(space.ship.above.y - space.ship.y, space.ship.above.x - space.ship.x)
										space.ship.x = space.ship.above.x - Math.cos(angle + Math.PI / space.ship.above.r) * (space.ship.above.r + space.ship.vertShift);
										space.ship.y = space.ship.above.y - Math.sin(angle + Math.PI / space.ship.above.r) * (space.ship.above.r + space.ship.vertShift);
										space.ship.rotation = 90 - angle * 180 / Math.PI - 6;
									}
									/*if (Library.keyboard.keyDown.indexOf(40) != -1) //Down
									{
										space.ship.above.vy += Math.cos(space.ship.rotation * (Math.PI/180)) * .05;
										space.ship.above.vx += Math.sin(space.ship.rotation * (Math.PI/180)) * .05;
									}*/
								}
							}
							scene.setOffset((scene.canvas.width / 2 - space.ship.x * scene.scaleX), (scene.canvas.height / 2 - space.ship.y * scene.scaleY));
						}
						space.bodies.forEach(updatePositions);

						//scene.setOffset(scene.translateX - space.speed * scene.scaleX * space.ship.vx, scene.translateY - space.speed * scene.scaleY * space.ship.vy)
						//togglePause();
					}

				},
				editCorners: function()
				{
					setTimeout(function(){
						var inc = 0;
						var size = Library.object.size(space.buttons) - 1
						var margin = 10;
						for (var btn in space.buttons)
						{
							space.buttons[btn].x = Math.floor((scene.canvas.width / 2) - (size * (16 + margin) / 2) + (inc * 16)) + (margin * (inc - .5))
							space.buttons[btn].y = Math.floor(scene.canvas.height - space.buttons[btn].height) - margin
							inc++;
						}
					}, 300)
				}
			}


			//debugger;
			function beginGeneration(){
				var star = createAdventureStar(0, 0, 1e9, 10, 0)

				for (var i = 0; i < 150; i++)
				{
					setTimeout(function(i){
						var mass = Math.random() * 50000 + 25000
						var planetDistance = (i) * 5000 + Math.random()*2000 + 500;
						var planetX = Math.random() * (Math.round(Math.random())*2-1);
						var planetY = Math.sqrt(1 - planetX*planetX) * (Math.round(Math.random())*2-1);
						var newPlanetSprite;
						newPlanetSprite = generatePlanet(mass);
						var newPlanet = createAdventurePlanet(newPlanetSprite, planetX * planetDistance, planetY * planetDistance, mass, 0, 0);
						sendToOrbit(star, newPlanet);

						/* `chances` chances for a moon */
						var chances = 1;
						for (var j = 0; j < chances; j++)
						{
							if (Math.round(Math.random()*100) == 1 || i === 100)
							{
								var moonDistance = Math.random() * 2000 + 1000;
								var moonX = newPlanet.x;
								var moonY = newPlanet.y + moonDistance;
								var moonMass = Math.random() * 10000 + 250;

								var newMoonSprite = generatePlanet(moonMass);
								var newMoon = createAdventurePlanet(newMoonSprite, moonX, moonY, moonMass, 0, 0);
								sendToOrbit(newPlanet, newMoon);
							}
						}
						if (i === 100)
						{
							createAdventureShip(planetX * planetDistance, planetY * planetDistance - 3, 0, 0);
							scene.setOffset((scene.canvas.width / 2 - space.ship.x * scene.scaleX), (scene.canvas.height / 2 - space.ship.y * scene.scaleY));
						}
						if (i === 149)
						{
							space.begin();

							var animationShift = space.loadScreen.y + space.loadScreen.height
							space.loadScreen.animate({y: -animationShift}, 1000, "outQuad", function(){this.visible = false;});
							space.loadText.animate({y: -animationShift}, 1000, "outQuad", function(){this.visible = false;});
						}
					}, 0, i);
				}

				/* Set the total velocity to 0 */
				var tXF = 0;
				var tYF = 0;
				var tM = 0;
				space.bodies.map(function(element){
					tXF += element.vx * element.m;
					tYF += element.vy * element.m;
					tM += element.m;
				})
				space.bodies.forEach(function(element, i, arr){
					element.vx -= tXF / tM;
					element.vy -= tYF / tM;
				})
			}

			function sendToOrbit(center, moon)
			{
				var xDist = center.x - moon.x;
				var yDist = center.y - moon.y;
				var distance = Math.sqrt(xDist * xDist + yDist * yDist)
				var strength = (Math.sqrt((space.constant * (moon.m + center.m)) / distance))
				var xLine = (yDist/distance) * strength
				var yLine = (-xDist/distance) * strength
				var direction = 1//Math.round(Math.random())*2-1; //-1 or 1
				moon.vx = direction * (xLine + center.vx);
				moon.vy = direction * (yLine + center.vy);
			}
		}
	}

	function World(planet)
	{
		window.planet = planet = this;

		/* EVENT LISTENER JUNK */
		window.removeEventListener("resize", space.events.editCorners)
		window.removeEventListener("keydown", space.events.keyDown)
		window.removeEventListener("keyup", space.events.keyUp)
		scene.canvas.removeEventListener("click", space.events.clickEvent);
		scene.canvas.removeEventListener("mousedown", space.events.mouseDown);
		scene.canvas.removeEventListener("mouseup", space.events.mouseUp)
		scene.canvas.removeEventListener("mousemove", space.events.mouseMove);
		if (Library.isFirefox)
		{
			window.removeEventListener("DOMMouseScroll", space.events.scroll);
		}
		else
		{
			scene.canvas.removeEventListener("mousewheel", space.events.scroll);
		}

		for (var i = 0; i < space.bodies.length; i++)
		{
			space.bodies[i].visible = false;
		}

		this.events = {
			keyDown: function(event)
			{

			},
			keyUp: function(event)
			{

			},
			scroll: function(event)
			{
				event.preventDefault()
				if (Library.keyboard.keyDown.indexOf(17) != -1)
				{
					scene.zoom(Math.pow(10/9, Library.mouse.wheel), Math.pow(10/9, Library.mouse.wheel), Library.mouse.canvasXPos, Library.mouse.canvasYPos)
				}
			},
			clickEvent: function(event)
			{

			},
			mouseDown: function(event){

			},
			mouseUp: function(event)
			{

			},
			mouseMove: function(event)
			{

			},
			onFrame: function(event)
			{
				if (Library.keyboard.keyDown.indexOf(37) != -1 || Library.keyboard.keyDown.indexOf(65) != -1)		//Left
				{
					planet.player.vx = -8;
				}
				if (Library.keyboard.keyDown.indexOf(38) != -1 || Library.keyboard.keyDown.indexOf(87) != -1)//Up
				{
					if (planet.player.ground)
					{
						planet.player.vy = -10;
						planet.player.ground = false;

					}
				}
				else
				{
					planet.upClicked = false;
				}
				if (Library.keyboard.keyDown.indexOf(39) != -1 || Library.keyboard.keyDown.indexOf(68) != -1)//Right
				{
					planet.player.vx = 8;

				}

				for (var i = 0; i < planet.entities.length; i++)
				{
					planet.entities[i].vx = planet.entities[i].vx * .99;
					if (planet.entities[i].vy < 25 && !planet.entities[i].ground) //Falling
					{
						planet.entities[i].vy += .49
					}

					if (planet.entities[i].ground)
					{
						planet.entities[i].vx *= .65;
						if (Math.abs(planet.entities[i].vx) < .1)
						{
							planet.entities[i].vx = 0
						}
					}
					planet.entities[i].ground = false;

					for (var x = -3; x < 3; x++)
					{
						for (var y = -3; y < 3; y++)
						{
							var tile = planet.getTile(x * 32 + planet.entities[i].x, y * 32 + planet.entities[i].y);

							if (tile.id !== "a")
							{
								var entity = {
									x: planet.entities[i].x + planet.entities[i].vx,
									y: planet.entities[i].y + planet.entities[i].vy,// + .49,
									width: planet.entities[i].width,
									height: planet.entities[i].height
								}

								var right = tile.x < entity.x + entity.width
								var left = tile.x + tile.width > entity.x
								var bottom = tile.y < entity.y + entity.height
								var top = tile.y + tile.height > entity.y

								var isRight = (tile.x) < (entity.x)
								var isBelow = (tile.y) < (entity.y)


								if (right && left && bottom && top)
								{
									if (tile.x === 512 && tile.y === 64)
									{
										//debugger;
									}
									var horizontal = (Math.abs(tile.y - planet.entities[i].y) <= Math.abs(tile.x - planet.entities[i].x))

									if (horizontal)
									{
										var newValue = ((tile.x + (tile.width * isRight)) - (planet.entities[i].x + (planet.entities[i].width * !isRight)))
										if (planet.entities[i].vx > 0)
										{
											newValue = newValue * (newValue > 0)
										}
										else
										{
											newValue = newValue * (newValue < 0)
										}
										planet.entities[i].vx = newValue;
									}
									else
									{
										var newValue = ((tile.y + (tile.height * isBelow)) - (planet.entities[i].y + (planet.entities[i].height * !isBelow)))
										if (planet.entities[i].vy > 0)
										{
											newValue = newValue * (newValue > 0)
										}
										else
										{
											newValue = newValue * (newValue < 0)
										}
										planet.entities[i].vy = newValue
										planet.entities[i].ground = !isBelow;
									}

								}
							}
						}
					}

					planet.entities[i].x += planet.entities[i].vx;
					planet.entities[i].y += planet.entities[i].vy;

					if (planet.entities[i].vy === 0) /* Sometimes the entity would be at y=63.99... and that would mess up collisions */
					{
						planet.entities[i].y = Math.round(planet.entities[i].y)
					}

					/* Wrap the entity the the opposite side */
					if (planet.entities[i].x < 0)
					{
						planet.entities[i].x = planet.chunks[0].length * 128 + planet.entities[i].vx
					}
					else if (planet.entities[0].x > planet.chunks[0].length * 128)
					{
						planet.entities[i].x = 0 + planet.entities[i].vx
					}
				}

				/* Can probably be optimized. This code ALWAYS resets ALL chunks. Should be reworked */
				for (var i = 0; i < planet.chunks.length; i++)
				{
					for (var j = 0; j < planet.chunks[0].length; j++)
					{
						planet.chunks[i][j].x = j * 128
					}
				}

				scene.setOffset((scene.canvas.width / 2 - window.planet.player.x * scene.scaleX), (scene.canvas.height / 2 - window.planet.player.y * scene.scaleY));

				/* Move chunk images to give the illusion of map wrapping */
				var startWrapValue = Math.floor((scene.translateX) / 128) + 1
				if (startWrapValue > 0)
				{
					length = planet.chunks[0].length - 1;

					for (var i = 0; i < planet.chunks.length; i++)
					{
						for (var j = 0; j < startWrapValue; j++)
						{
							planet.chunks[i][length - j].x = -(j + 1) * 128
						}
					}
				}
				var endWrapValue = Math.max(Math.floor((scene.canvas.width - scene.translateX) / 128 - planet.chunks[0].length + 1, 0))
				if (endWrapValue > 0)
				{
					for (var i = 0; i < planet.chunks.length; i++)
					{
						for (var j = 0; j < endWrapValue; j++)
						{
							planet.chunks[i][j].x = (planet.chunks[0].length + j) * 128
						}
					}
				}

				/* Only display the chunks if the are on screen. Saves a lot of fps */
				for (var i = 0; i < planet.chunks.length; i++)
				{
					for (var j = 0; j < planet.chunks[0].length; j++)
					{
						var right = planet.chunks[i][j].x < (-scene.translateX + scene.canvas.width) / scene.scaleX
						var left = planet.chunks[i][j].x + planet.chunks[i][j].width > -scene.translateX / scene.scaleX
						var bottom = planet.chunks[i][j].y < (-scene.translateY + scene.canvas.height) / scene.scaleY
						var top = planet.chunks[i][j].y + planet.chunks[i][j].height > -scene.translateY / scene.scaleY

						if (right && left && bottom && top)
						{
							planet.chunks[i][j].visible = true
						}
						else
						{
							planet.chunks[i][j].visible = false
						}
					}
				}
			},
			editCorners: function(event)
			{
				setTimeout(function(){

				}, 300)
			}
		}
		this.events.editCorners();
		window.addEventListener("resize", this.events.editCorners)
		window.addEventListener("keydown", this.events.keyDown)
		window.addEventListener("keyup", this.events.keyUp)
		scene.canvas.addEventListener("click", this.events.clickEvent);
		scene.canvas.addEventListener("mousedown", this.events.mouseDown);
		scene.canvas.addEventListener("mouseup", this.events.mouseUp)
		scene.canvas.addEventListener("mousemove", this.events.mouseMove);
		scene.onFrame(this.events.onFrame);
		if (Library.isFirefox)
		{
			window.addEventListener("DOMMouseScroll", this.events.scroll);
		}
		else
		{
			scene.canvas.addEventListener("mousewheel", this.events.scroll);
		}





		this.getTile = function(x, y){
			/* Return the chunk at the given x,y coordinate */
			if (x >= 0 && x < planet.chunks[0].length * 128 && y >= 0 && y < planet.chunks.length * 128)
			{
				return planet.chunks[Math.floor(y / 128)][Math.floor(x / 128)].tiles[Math.floor((y % 128) / 32)][Math.floor((x % 128) / 32)]
			}
			else
			{   /* Return a fake air tile to avoid errors */
				return {x: x, y: y, id: "a", fake: true};
			}
		}


		/*var gradient = generationCtx.createLinearGradient(0,0,0,scene.canvas.height);
		gradient.addColorStop(0,"transparent");
		gradient.addColorStop(.75,"aqua");
		generationCtx.fillStyle = gradient;
		generationCtx.fillRect(0, 0, generationCanvas.width, generationCanvas.height)
		this.sky = new Rectangle(0, 0, scene.canvas.width, scene.canvas.height, gradient)
		this.sky.setProperties({fixed: true})*/

		this.chunks = [];
		this.body = space.ship.above;
		noise.seed(this.body.seed)

		/* Level dimensions must be a multiple of 4x4. One row or column can not be shorter than another. */
		this.levelString = "";
		this.heightMap = [];
		var width = (planet.body.r * Math.PI).roundTo(4);
		var height = planet.body.r.roundTo(4);

		var hillBase = height / 4;
		var amplitude = Math.rand(10,20);
		var scale = .02

		this.level = [];

		for (var i = 0; i < width; i++)
		{
			var val = noise.simplex2(i * scale, 0, 0)
			var specialHillBase = Math.max(hillBase, (amplitude / 2) + val * amplitude)
			this.heightMap.push(Math.round(val * amplitude + specialHillBase))
		}
		for (var i = 0; i < height; i++)
		{
			for (var j = 0; j < width; j++)
			{
				if (this.heightMap[j] == i)
				{
					this.levelString += "g"
				}
				else if (this.heightMap[j] - i >= -4 && this.heightMap[j] < i)
				{
					this.levelString += "d"
				}
				else if (this.heightMap[j] < i)
				{
					this.levelString += "s"
				}
				else
				{
					this.levelString += "a"
				}
			}
			if (i !== height - 1)
			{
				this.levelString += "n"
			}
		}
		this.level = this.levelString.split("n").map(function(element){return element.split("");});

		generationCanvas.style.width = (generationCanvas.width = 128) + "px";
		generationCanvas.style.height = (generationCanvas.height = 128) + "px";
		scene.background.distance = .86868686868686


		for (var i = 0; i < height; i+=4)
		{
			this.chunks.push([])
			for (var j = 0; j < width;  j+=4)
			{
				var start = j;
				var end = start + 4;
				var chunk = [];
				chunk.push(this.level[i].slice(start,end), this.level[i+1].slice(start,end), this.level[i+2].slice(start,end), this.level[i+3].slice(start,end))
				this.chunks[i / 4].push(new Chunk(j, i, chunk))
			}
		}

		this.ship = new Sprite(scene.imageObjects.bigShip, Math.rand(0, width * 32), 0)
		this.ship.setProperties({y: (Math.min(...planet.heightMap.slice(Math.floor(this.ship.x / 32), Math.floor(this.ship.x / 32) + Math.ceil(this.ship.width / 32))) - 4) * 32 - this.ship.height})
		this.player = new Rectangle(0, (this.heightMap[0] - 1) * 32, 32, 32, "#FF0000");
		this.player.setProperties({vx: 0, vy: 0, grounded: false})
		this.entities = [this.player];

		var animationShift = space.loadScreen.y + space.loadScreen.height
		space.loadScreen.animate({y: -animationShift}, 1000, "outQuad", function(){this.visible = false;});
		space.loadText.animate({y: -animationShift}, 1000, "outQuad", function(){this.visible = false;});
	}

	function Chunk(x, y, tiles)
	{
		generationCtx.clearRect(0, 0, generationCanvas.width, generationCanvas.height)
		this.x = x * 32;
		this.y = y * 32;
		this.tiles = [];
		for (var i = 0; i < tiles.length; i++)
		{
			this.tiles.push([])
			for (var j = 0; j < tiles[i].length; j++)
			{
				this.tiles[i].push(new Tile(j, i, tiles[i][j], this))
			}
		}
		chunkImage = new Image();
		chunkImage.src = generationCanvas.toDataURL();
		Sprite.prototype.constructor.call(this, chunkImage, x * 32, y * 32)
	}

	function Tile(x, y, type, chunk)
	{
		this.parent = chunk;
		this.id = type;

		/* Tile Coords */
		this.x = x * 32 + this.parent.x;
		this.y = y * 32 + this.parent.y;
		/* Coords relative to parent chunk */
		this.chunkX = x;
		this.chunkY = y;

		this.width = 32;
		this.height = 32;

		switch (type)
		{
			case "g": /* Grass */
				generationCtx.fillStyle = "rgb(0, 200, 0)";
				generationCtx.fillRect(this.chunkX * 32, this.chunkY * 32, 32, 32)
				break;
			case "d": /* Dirt */
				generationCtx.fillStyle = "rgb(139,69,19)";
				generationCtx.fillRect(this.chunkX * 32, this.chunkY * 32, 32, 32)
				break;
			case "s": /* Stone */
				generationCtx.fillStyle = "rgb(128, 128, 128)";
				generationCtx.fillRect(this.chunkX * 32, this.chunkY * 32, 32, 32)
				break;
		}
	}

	var selectMode = {
		container: new Rectangle(scene.canvas.width / 2, scene.canvas.height / 2, 450, 175, "#333333"),
		text: new Text(scene.canvas.width / 2, 100, "Choose your game mode", 20, "Consolas", "rgb(0, 160, 222)", "italic bold"),
		adventure: new Text(0, 0, "Adventure", 20, "Consolas", "rgb(0, 160, 222)"),
		sandbox: new Text(0, 0, "Sandbox", 20, "Consolas", "rgb(0, 160, 222)"),
	};
	gameLogo = new Sprite(scene.imageObjects.asteroidium, scene.canvas.width / 2, 100);
	gameLogo.setProperties({centered: true})
	selectMode.text.setProperties({align: "center",  y: (scene.canvas.height - selectMode.container.height) / 2 + 40})

	for (var key in selectMode)
	{
		if (key == "adventure" || key == "sandbox")
		{
			selectMode[key].addEventListener("mouseEnter", function(){
				this.setProperties({color: "#333333", backColor: "rgb(0, 160, 222)"})
				scene.changeMouse("pointer")
			})
			selectMode[key].addEventListener("mouseLeave", function(){
				this.setProperties({color: "rgb(0, 160, 222)", backColor: "#333333"})
				scene.changeMouse("default")
			})
		}
		selectMode[key].fixed = true;
		//selectMode[key].visible = false;
	}

	var hideSelect = function(){
		for (var key in selectMode)
		{
			selectMode[key].animate({y: -100, opacity: 0}, 750, "outQuad")
		}
		gameLogo.animate({width: 4.40650406504065, height: 1, opacity: 0}, 500, "linear")
		scene.changeMouse("default")
	}
	selectMode.adventure.addEventListener("click", function(){
		alert("Not available yet")
		/*
		if (!space)
		{
			new Galaxy("adventure");
		}
		hideSelect();*/
	})
	selectMode.sandbox.addEventListener("click", function(){
		if (!space)
		{
			new Galaxy("sandbox");
		}
		hideSelect();
	})

	selectMode.adventure.x = (scene.canvas.width - (selectMode.container.width - selectMode.adventure.width)) / 2 + 100
	selectMode.adventure.y = (scene.canvas.height + (selectMode.container.height - selectMode.adventure.height)) / 2 - 25

	selectMode.sandbox.x = (scene.canvas.width + (selectMode.container.width - selectMode.sandbox.width)) / 2 - 100
	selectMode.sandbox.y = (scene.canvas.height + (selectMode.container.height - selectMode.sandbox.height)) / 2 - 25

	selectMode.container.setProperties({centered: true, border: true, borderColor: "#555555", borderSize: 3, borderRadius: 10});
	selectMode.adventure.setProperties({centered: true, back: true, backColor: "#333333", backBorder: true, backBorderSize: 2, backBorderColor: "rgb(0, 160, 222)", backBorderRadius: 5, padding: 10});
	selectMode.sandbox.setProperties({centered: true, back: true, backColor: "#333333", backBorder: true, backBorderSize: 2, backBorderColor: "rgb(0, 160, 222)", backBorderRadius: 5, padding: 10});

	var choice = "adventure";
	//new Galaxy(choice)


	//placeSet('[{"id":0,"vx":"-1.1125595952","vy":"-4.1903225768","x":"642.1863859097","y":"153.2696731837","m":"1.0000000000"},{"id":1,"vx":"0.6702903543","vy":"1.1857357165","x":"410.3809984409","y":"317.6079512473","m":"1.0000000000"},{"id":2,"vx":"-0.5609034430","vy":"-0.1470857908","x":"487.8953973321","y":"188.3448309354","m":"1.0000000000"},{"id":3,"vx":"2.5768957173","vy":"2.0731551597","x":"418.1439117718","y":"393.3980933422","m":"1.0000000000"},{"id":4,"vx":"1.4461996204","vy":"2.7364386045","x":"379.3974881392","y":"357.3795819621","m":"1.0000000000"},{"id":5,"vx":"-2.8255181420","vy":"1.6949965253","x":"372.4209521771","y":"131.6504827781","m":"1.0000000000"},{"id":6,"vx":"1.1517493197","vy":"-3.0883894222","x":"637.5270566648","y":"251.9748943426","m":"1.0000000000"},{"id":7,"vx":"-1.1822039588","vy":"-3.4481975714","x":"623.5345396547","y":"151.8361524088","m":"1.0000000000"},{"id":8,"vx":"1.6059220206","vy":"1.4540168268","x":"413.0318208495","y":"356.9742363932","m":"1.0000000000"},{"id":298,"vx":"0.5636694036","vy":"3.9325482021","x":"318.9739020207","y":"311.9045445917","m":"3.0000000000"},{"id":299,"vx":"-0.0701717617","vy":"1.1995676855","x":"390.3893614193","y":"254.0053601553","m":"2.0000000000"},{"id":300,"vx":"0.3890649592","vy":"0.1405156839","x":"438.3809233155","y":"261.0356978420","m":"3.0000000000"},{"id":301,"vx":"-2.7449766403","vy":"0.5189622330","x":"420.1891839293","y":"114.4641549662","m":"2.0000000000"},{"id":302,"vx":"0.2628148816","vy":"-0.7165491127","x":"526.1268435320","y":"288.5337121502","m":"4.0000000000"},{"id":303,"vx":"0.9206476329","vy":"-1.1237262494","x":"575.7722220959","y":"294.8068212629","m":"3.0000000000"},{"id":304,"vx":"3.7769687745","vy":"-1.3997391424","x":"587.1544693981","y":"391.7735863170","m":"3.0000000000"},{"id":305,"vx":"-1.8699811265","vy":"0.7422334070","x":"429.4744978184","y":"139.3913025136","m":"2.0000000000"}]')

	function backgroundSelector(index)
	{
		Sprite.prototype.constructor.call(this, scene.imageObjects.bgDisplays, 0, 0, 0, 0, 256, 256, 64, 64);
		space.bgBack.height += this.height + 7;
		space.bgToggleBtn.height += this.height + 7;
		this.addFrame(256, 0, 256, 256);
		this.addFrame(0, 256, 256, 256);
		this.addFrame(256, 256, 256, 256);
		this.addFrame(0, 512, 256, 256);
		this.addFrame(256, 512, 256, 256);
		this.addFrame(0, 768, 256, 256);
		this.addFrame(256, 768, 256, 256);
		this.addFrame(0, 1024, 256, 256);
		this.addFrame(256, 1024, 256, 256);
		this.y = (this.height + 7)*index + 5;
		this.x = scene.canvas.width - (this.width + 5)
		this.index = index;
		this.back = true;
		this.backColor = "#000000";
		this.border = true;
		this.borderColor = "#555555"
		this.borderSize = 2
		this.borderRadius = 3;
		if (index == 0)
		{
			this.borderColor = "rgb(0, 160, 222)";
			this.borderSize = 3
		}
		this.origX = this.x;
		this.origY = this.y;
		this.addEventListener("mouseDown", function(){
			space.bgWasClicked = true;
			this.origX = this.x;
			this.origY = this.y;
		})
		this.addEventListener("mouseMove", function(){

			if (space.bgWasClicked && (this.height + 7) * space.bgBoxes.length + 5 > scene.canvas.height)
			{
				if (space.bgDragging >= 8)
				{
					if (space.bgBoxes[space.bgBoxes.length - 1].y + space.bgBoxes[space.bgBoxes.length - 1].height + (Library.mouse.canvasYPos - Library.mouse.lastCanvasYPos) < scene.canvas.height - 5)
					{
						for (var i = 0; i < space.bgBoxes.length; i++)
						{
							space.bgBoxes[space.bgBoxes.length - i - 1].y = scene.canvas.height - ((this.height + 7) * i) - 69
						}
					}
					else if (space.bgBoxes[0].y + (Library.mouse.canvasYPos - Library.mouse.lastCanvasYPos) >= 5)
					{
						for (var i = 0; i < space.bgBoxes.length; i++)
						{
							space.bgBoxes[i].y = (this.height + 7)*i + 5;
						}
					}
					else
					{
						for (var i = 0; i < space.bgBoxes.length; i++)
						{
							space.bgBoxes[i].y += (Library.mouse.canvasYPos - Library.mouse.lastCanvasYPos)
						}
					}
				}
				else
				{
					space.bgDragging++;
				}
			}
		})
		this.addEventListener("mouseUp", function(){
			if (space.bgDragging < 8)
			{
				space.achievement.loadAchievement("Changed the Background \uD83D\uDEC8", "Earned by clicking the gear icon and selecting a background.", 4, 10);
				scene.background.changeStyle("to", index);
				for (var i = 0; i < space.bgBoxes.length; i++)
				{
					space.bgBoxes[i].borderColor = "#555555"
					space.bgBoxes[i].borderSize = 2
				}
				this.borderColor = "rgb(0, 160, 222)";
				this.borderSize = 3
				space.background = this.index;
				if (this.index == 0)
				{
					scene.background.color = this.backColor;
				}
			}
			space.bgWasClicked = false;
			space.bgDragging = 0;
		})
		this.fixed = true;
		//this.visible = false;
		this.changeFrame(index)
		space.bgBoxes.push(this);
		space.atFront.splice(space.atFront.length - 2, 0, this)
	}

	function createAdventureShip(x, y, vx, vy)
	{
		var compositeObject = {
			init: behavior.initAdventureShip,
			behaviors: {
				remove: behavior.enableRemove,
				collide: behavior.adventureCollide,
			},
			setup: [
				//behavior.setColor,
			],
			settings: {
				pulls: false,
			}
		}
		return new Body(x, y, 1, vx, vy, compositeObject)
	}
	function createAdventureStar(x, y, m, vx, vy)
	{
		var compositeObject = {
			init: behavior.initAdventureStar,
			behaviors: {
				remove: behavior.enableRemove,
				collide: behavior.adventureCollide,
			},
			setup: [
			],
			settings: {
				pulls: true,
			}
		}
		return new Body(x, y, m, vx, vy, compositeObject)
	}
	function createAdventurePlanet(data, x, y, m, vx, vy)
	{
		var compositeObject = {
			init: behavior.initAdventurePlanet,
			behaviors: {
				remove: behavior.enableRemove,
				collide: behavior.adventureCollide,
			},
			setup: [
				behavior.setNoise
			],
			settings: {
				pulls: true,
				data: data
			},
			initArguments: {
				planet: data.planet,
				shadow: data.shadow
			}
		}
		return new Body(x, y, m, vx, vy, compositeObject)
	}

	function createSandboxPlanet(x, y, m, vx, vy)
	{
		var compositeObject = {
			init: behavior.initSandboxPlanet,
			behaviors: {
				remove: behavior.enableRemove,
				focus: behavior.enableFocus,
				collide: behavior.sandboxCollide,
			},
			setup: [
				behavior.enableConnection,
				behavior.enableTrace,
				behavior.enableStar,
				behavior.setColor
			],
			settings: {
				pulls: true,
			}
		}
		space.mainStats.text = "Drag X Velocity: 0.000\nDrag Y Velocity: 0.000\nCelestial Bodies: " + (space.bodies.length + 1) + "\nMass: " + Library.newMath.toOnes(space.placeSize, 9) + "\nZoom Level: " + Math.round(Math.log(scene.scaleX)/Math.log(10/9))
		return new Body(x, y, m, vx, vy, compositeObject)
	}

	function createSandboxShip(x, y, vx, vy)
	{
		var compositeObject = {
			init: behavior.initSandboxShip,
			behaviors: {
				remove: behavior.enableRemove,
				focus: behavior.enableFocus,
				collide: behavior.sandboxCollide,
			},
			setup: [
				behavior.enableConnection,
				behavior.enableTrace,
			],
			settings: {
				pulls: false,
			}
		}
		space.mainStats.text = "Drag X Velocity: 0.000\nDrag Y Velocity: 0.000\nCelestial Bodies: " + (space.bodies.length + 1) + "\nMass: " + Library.newMath.toOnes(space.placeSize, 9) + "\nZoom Level: " + Math.round(Math.log(scene.scaleX)/Math.log(10/9))
		return new Body(x, y, 1000, vx, vy, compositeObject)
	}

	function Body(x, y, m, vx, vy, composites)
	{
		space.bodies.push(this);
		this.under = [];
		this.above = undefined;
		this.age = 0;
		this.x = x;
		this.y = y;
		this.m = m;
		this.vx = vx || 0;
		this.vy = vy || 0;

		composites.init.call(this, composites.initArguments)
		for (let key in composites.behaviors)
		{
			this[key] = composites.behaviors[key];
		}

		for (let i = 0; i < composites.setup.length; i++)
		{
			composites.setup[i].call(this)
		}
		for (var key in composites.settings)
		{
			this[key] = composites.settings[key];
		}



		for (var i = 0; i < space.atFront.length; i++)
		{
			space.atFront[i].toFront();
		}
	}



	function changeTrace()
	{
		var wasTracing = space.tracing > 0;
		space.tracing = (space.tracing + 1) * ((space.tracing) <= 1)
		space.buttons.trace.changeFrame(+space.tracing)
		if (space.tracing && !wasTracing)
		{
			space.achievement.loadAchievement("Turned on Planet Trails \uD83D\uDEC8", "Earned by clicking the 'T', or pressing\n't' on your keyboard.", 9, 6);
			for (var i = 0; i < space.bodies.length; i++)
			{

				space.focus.outline.toBack();
				space.traces.push(space.bodies[i].trace)
			}
		}
		else if (!space.tracing)
		{
			for (var i = 0; i < space.traces.length; i++)
			{
				space.traces[i].clearPoints();
			}
		}

	}

	function placeGalaxy(startX, startY, baseVx, baseVy)
	{
		//var space.galaxyBox.size = 100//(Math.floor(Math.random() * 120))
		//console.log(space.galaxyBox.size)
		//space.galaxyBox.density = 1;
		//space.galaxyBox.speed = Math.floor(Math.random() * 10) / 10
		space.galaxyBox = space.galaxyBox || {};
		var maxCount = Math.PI * Math.pow((space.galaxyBox.size || 178), 2) / 10 * Math.pow((space.galaxyBox.density || .2), 2)// * 10

		for (var i = 0; i < maxCount; i++)
		{

			var value = (Math.random() * Math.PI) * 2,			//Angle of planet from click
				distance = Math.random(),// + Math.pow(space.galaxyBox.speed, 2)
				xRatio = Math.sin(value) * (Math.sqrt(distance)),//get x ratio
				yRatio = Math.cos(value) * (Math.sqrt(distance)),//get y ratio
				x = startX + xRatio * (space.galaxyBox.size || 178),
				y = startY + yRatio * (space.galaxyBox.size || 178),
				m = 1,
				vx = baseVx + (Math.sin(value + (Math.PI / 2)) * distance * 15) * (space.galaxyBox.speed || .3),
				vy = baseVy + (Math.cos(value + (Math.PI / 2)) * distance * 15) * (space.galaxyBox.speed || .3);
			createSandboxPlanet(x, y, m, vx, vy);
		}
	}


	function togglePause()
	{
		space.paused = !space.paused;
		space.buttons.pause.changeFrame(space.paused)
		if (space.paused)
		{
			//space.achievement.loadAchievement("Game Paused \uD83D\uDEC8", "Earned by clicking the pause button or pressing the spacebar.", 7, 4);
		}
	}

	function toggleConnect()
	{
		space.showingOrbitStrength = !space.showingOrbitStrength
		space.buttons.connect.changeFrame(space.showingOrbitStrength)
	}

	function toggleFullScreen(){
		debugger
		if (isFullScreen)
		{
			Library.closeFullScreen();
		}
		else
		{
			if (space.type == "sandbox")
			{
				space.achievement.loadAchievement("Opened Fullscreen \uD83D\uDEC8", "Earned by clicking the Fullscreen icon.", 11, 12);
			}
			Library.openFullScreen();
		}
		space.buttons.fullscreen.changeFrame(isFullScreen)
	}
	$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', fullScreenHandlerForGame);
	function fullScreenHandlerForGame(){
		space.buttons.fullscreen.changeFrame(isFullScreen)
		var handler = (isFullScreen * 2) - 1
		scene.setOffset(scene.translateX + scene.scaleX * handler * (screen.width - scene.canvas.origSize.width) / 2, scene.translateY + scene.scaleY * handler * (screen.height - scene.canvas.origSize.height) / 2)
	}

}
