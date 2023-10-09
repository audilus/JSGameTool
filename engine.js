//Startup
const canvas = document.getElementById("myCanvas");
const gl = canvas.getContext("webgl2");


class Transform {
	constructor() {
		this.forward = [0, 0, 1];
		this.right = [1, 0, 0];
		this.up = [0, 1, 0];
	}

	doRotations(RotAngles) {
		this.xRot =
			[
				[1, 0, 0, 0],
				[0, Math.cos(RotAngles[0]), -1 * Math.sin(RotAngles[0]), 0],
				[0, Math.sin(RotAngles[0]), Math.cos(RotAngles[0]), 0],
				[0, 0, 0, 1]
			];
		this.yRot =
			[
				[Math.cos(RotAngles[1]), 0, Math.sin(RotAngles[1]), 0],
				[0, 1, 0, 0],
				[-1 * Math.sin(RotAngles[1]), 0, Math.cos(RotAngles[1]), 0],
				[0, 0, 0, 1]
			];
		this.zRot =
			[
				[Math.cos(RotAngles[2]), -1 * Math.sin(RotAngles[2]), 0, 0],
				[Math.sin(RotAngles[2]), Math.cos(RotAngles[2]), 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1]
			]

		//this.forward = this.crossMultiply(xRot,[0,0,1,0]);		
		this.forward = this.crossMultiply(this.zRot,
			this.crossMultiply(this.yRot,
				this.crossMultiply(this.xRot, [0, 0, 1, 0])))

		this.right = this.crossMultiply(this.zRot,
			this.crossMultiply(this.yRot,
				this.crossMultiply(this.xRot, [1, 0, 0, 0])))

		this.up = this.crossMultiply(this.zRot,
			this.crossMultiply(this.yRot,
				this.crossMultiply(this.xRot, [0, 1, 0, 0])))
	}
	crossMultiply(M, V) {
		// console.log(M[0][3]);
		// console.log(V[3]);
		var temp = [
			M[0][0] * V[0] + M[0][1] * V[1] + M[0][2] * V[2] + M[0][3] * V[3],
			M[1][0] * V[0] + M[1][1] * V[1] + M[1][2] * V[2] + M[1][3] * V[3],
			M[2][0] * V[0] + M[2][1] * V[1] + M[2][2] * V[2] + M[2][3] * V[3],
			M[3][0] * V[0] + M[3][1] * V[1] + M[3][2] * V[2] + M[3][3] * V[3]
		]
		// console.log(temp);
		return temp;
	}

}

class GameObject {
	constructor() {
		this.loc = [0.0, 0.0, 0.0];
		this.rot = [0.0, 0.0, 0.0];
		this.scale = [0.0, 0.0, 0.0];
		this.isTrigger = false;
		this.collisionRadius = 1.0;	// OVERWRITE ME UNTIL WE START TRANSFORMING INTO COORD SPACE.
		this.velocity = [0.0, 0.0, 0.0];
		this.angVelocity = [0.0, 0.0, 0.0];
		this.name = "Default";
		this.id = Math.floor(Math.random() * 10);
		this.transform = new Transform();
	}

	update() {
		console.warn(this.name + " update() is NOT IMPLEMENTED!");
	}
	render() {
		console.warn(this.name + " render() is NOT IMPLEMENTED!");
	}

	onCollision() {
		console.warn(this.name + " onCollision() is NOT IMPLEMENTED!");
		return true;
	}
	onTrigger() {

	}
	OnDestroy() {
		console.warn(this.name + " OnDestroy() not implemented.");
	}
	move() {
		if (!m) {
			return;
		}
		var tempPos = [0.0, 0.0, 0.0];
		var tempRot = this.rot;

		for (var i = 0; i < 3; i++) {
			tempPos[i] = this.loc[i];
			tempPos[i] += this.velocity[i] * Main.deltaTime;
			tempRot[i] += this.angVelocity[i] * Main.deltaTime;
		}

		if (!this.isTrigger) {
			//	Handle collision;
			//	TODO: Clip our vector if we are going to collide with an object:
			var clear = true;
			for (var i in m.solid) {
				var obj = m.solid[i];
				if (obj != this) {
					// console.log(obj);
					if (m.CheckCollision(tempPos, obj.loc, this.collisionRadius, obj.collisionRadius, this, obj)) {
						this.onCollision(obj);
						clear = false;
					}
				}
			}
			if (clear) {
				this.loc[0] = tempPos[0];
				this.loc[1] = tempPos[1];
				this.loc[2] = tempPos[2];
			}
		}
		else {
			this.loc[0] = tempPos[0];
			this.loc[1] = tempPos[1];
			this.loc[2] = tempPos[2];
		}

		this.rot[0] = tempRot[0];
		this.rot[1] = tempRot[1];
		this.rot[2] = tempRot[2];
		for (var i in m.trigger) {
			var tr = m.trigger[i];
			if (m.CheckCollision(tr.loc, this.loc, tr.collisionRadius, this.collisionRadius, tr, this)) {
				if (tr != this) {
					// console.log(tr);
					tr.onTrigger(this);
				}
			}
		}

	}
}

class Camera extends GameObject {
	constructor(location) {
		super();
		// this.position = location;
		// this.colliderType = 0;
		// this.name = "Camera";
		// this.collisionRadius = .1; //    Make this align with the near plane.
		// this.bullets = [];
		// this.collisionReset = 0.5;
		// this.collisionClock = 0;
		// //	In shots per second
		// this.fireRate = 1 / 3;
		// this.gunClock = 0;
	}

	update() {

	}

	render(program) {
		var camLoc = gl.getUniformLocation(program, 'cameraLoc');
		gl.uniform3fv(camLoc, new Float32Array(this.loc));
		var worldLoc = gl.getUniformLocation(program, 'cameraRot');
		gl.uniform3fv(worldLoc, new Float32Array(this.rot));
	}
}

class Shape3D extends GameObject {
	constructor(points, texture) {
		super();
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertCount = points.length / 5;
		this.vertices = points;
		if (texture != null) {
			this.picture = texture;
		}
		else {
			this.picture = CreateBrick;
		}
		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		//We only want to do this once.
		//void gl.texImage2D(target, level, internalformat, width, height, border, format, 
		//type, ArrayBufferView? pixels);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,16,16,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.picture));
	
		this.loc = Array(3).fill(0.0);
		this.primitive = gl.POINTS;
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	}
	update() {

		this.move();
	}

	render(program)
	{
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		
		//MAKE SURE YOU CHANGE THIS TO 5 FOR TEXTURES
		var stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TEXTURE CHANGE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//Now we have to do this for color
		var TexAttributeLocation = gl.getAttribLocation(program,"texcoord");
		//We don't have to bind because we already have the correct buffer bound.
		size = 2;
		type = gl.FLOAT;
		normalize = false;
		stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(TexAttributeLocation);
		gl.vertexAttribPointer(TexAttributeLocation, size, type, normalize, stride, offset);
				
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		//setup S
		gl.texParameteri(gl.TEXTURE_2D,	gl.TEXTURE_WRAP_S,gl.REPEAT); //gl.MIRRORED_REPEAT//gl.CLAMP_TO_EDGE
		//Sets up our T
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT); //gl.MIRRORED_REPEAT//gl.CLAMP_TO_EDGE                   
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);			
				
				
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		
		var tranLoc  = gl.getUniformLocation(program,'u_translation');
		gl.uniform3fv(tranLoc,new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program,'u_rotation');
		gl.uniform3fv(thetaLoc,new Float32Array(this.rot));
		var scaleLoc = gl.getUniformLocation(program,'u_scale');
		gl.uniform3fv(scaleLoc,new Float32Array(this.scale));

		var primitiveType = this.primitive;
		offset = 0;
		var count = this.vertCount;
		gl.drawArrays(primitiveType, offset, count);

	}
}

class Pyramid extends GameObject {
	constructor() {
		super()
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		//Now we want to add color to our vertices information.
		this.vertices =
			[
				-.5, -.5, 0, 0, 0, 0,
				.5, -.5, 0, 1, 0, 0,
				0, .5, 0, 1, 0, 0,

				-.5, -.5, 0, 0, 1, 0,
				0, 0, -.5, 0, 1, 0,
				.5, -.5, 0, 0, 1, 0,

				0, 0, -.5, 0, 0, 1,
				.5, -.5, 0, 0, 0, 1,
				0, .5, 0, 0, 0, 1,

				0, .5, 0, 1, 1, 0,
				0, 0, -.5, 1, 1, 0,
				-.5, -.5, 0, 1, 1, 0
			];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc = [0.5, 0. - 2, 0.0];
		this.rot = [0.0, 0.0, 0.0];
		this.scale = [.2, .2, .2];
	}
	update() {
		this.angVelocity[0] = .01
		this.velocity[0] = .0001;
		this.velocity[1] = .0002;
		this.move()
	}

	render(program) {
		//Position
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		var size = 3;
		var type = gl.FLOAT;
		var normalize = false;
		var stride = 6 * Float32Array.BYTES_PER_ELEMENT;
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

		//Color
		var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
		size = 3;
		type = gl.FLOAT;
		normalize = false;
		stride = 6 * Float32Array.BYTES_PER_ELEMENT;
		offset = 3 * Float32Array.BYTES_PER_ELEMENT;
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);

		var tranLoc = gl.getUniformLocation(program, 'u_translation');
		gl.uniform3fv(tranLoc, new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program, 'u_rotation');
		gl.uniform3fv(thetaLoc, new Float32Array(this.rot));
		var scaleLoc = gl.getUniformLocation(program, 'u_scale');
		gl.uniform3fv(scaleLoc, new Float32Array(this.scale));


		var primitiveType = gl.TRIANGLES;
		offset = 0;
		var count = 12;
		gl.drawArrays(primitiveType, offset, count);
	}
}

class PointLight extends GameObject {

	static lightCount = 0;
	static lightsColor = new Array(3 * 16).fill(0);
	static lightPositions = new Array(3 * 16).fill(0);

	// static pLightBlock = new UniformBuffer(gl, [
	// 	...vec3.create(),
	// 	...vec3.create(),
	// ], 0);


	constructor(engine) {
		super();

		if (PointLight.lightCount == 32 * 3) {
			//	Stop early if we've hit the light limit.
			//	TODO: Make that 32 a changable const.
			engine.DestroyObject(this.id);
			return;
		}

		// this.loc = [0,1,0];
		this.power = 5;
		this.color = [1, 1, 1];

		this.lightID = PointLight.lightCount++;
	}

	update() {

		this.move();
	}

	render() {
		for (let i = this.lightID * 3; i < (this.lightID * 3) + 3; i++) {
			PointLight.lightPositions[i] = this.loc[i % 3];
			// // PointLight.lightPositions[i] = new Float32Array(this.loc[0], this.loc[1], this.loc[2]);	
			PointLight.lightsColor[i] = this.color[i % 3];

		}

		// for (let i = this.lightID * 3; i < PointLight.lightCount; index++) {
		// 	PointLight.pLightBlock.update(gl, [
		// 		...vec3.fromValues(
		// 			PointLight.lightPositions[0],
		// 			PointLight.lightPositions[1],
		// 			PointLight.lightPositions[2])
		// 	]);

		// }

		var lightArray = gl.getUniformLocation(m.program, 'uPointLightPositions');
		gl.uniform3fv(lightArray, PointLight.lightPositions);

		var lightColorPtr = gl.getUniformLocation(m.program, 'uPointLightColor');
		gl.uniform3fv(lightColorPtr, PointLight.lightsColor);
	}

	OnDestroy() {
		lightsEnable[lightCount--] = 0;

		var lightArray = gl.getUniformLocation(m.program, 'u_pointLightPosition');
		gl.uniform3fv(lightArray, Float32Array(lightPositions));

		var lightCountPtr = gl.getUniformLocation(m.program, 'u_pointLightCount');
		gl.uniform1i(lightCountPtr, PointLight.lightCount);
	}
}

class Main {

	//	For framerate-independent game logic
	static deltaTime = 0;
	static previousTimestamp = 0;
	static mainRef;
	constructor() {
		this.webGL = new InitWebGLProgram();
		// var vertexShaderSource = document.getElementById("2dVertexShader").text;
		var vertexShaderSource = InitWebGLProgram.vertexShaderSource;
		var fragmentShaderSource = InitWebGLProgram.fragmentShaderSource;
		// var fragmentShaderSource = document.getElementById("2dFragmentShader").text;
		var vertexShader = this.webGL.createShader(gl.VERTEX_SHADER, vertexShaderSource);
		var fragmentShader = this.webGL.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

		this.lastMouseDelta = [0, 0];
		this.mouseMovedThisFrame = false;
		//	Mouselook
		document.body.onclick = document.body.requestPointerLock ||
			document.body.mozRequestPointerLock ||
			document.body.webkitRequestPointerLock;

		//	Linking
		this.program = this.webGL.createProgram(vertexShader, fragmentShader);
		gl.useProgram(this.program);

		//	Added for the game engine
		this.objectCount = 0;
		this.visual = [];
		this.solid = [];
		this.trigger = [];
		this.keys = [];

		Main.mainRef = this;

		//	Set camera defaults
		var camLoc = gl.getUniformLocation(this.program, 'cameraLoc');

		gl.uniform3fv(camLoc, new Float32Array([0, 0, 0]));
		var worldLoc = gl.getUniformLocation(this.program, 'cameraRot');
		gl.uniform3fv(worldLoc, new Float32Array([0, 0, 0]));

		//	Point light setup
		var lightArray = gl.getUniformLocation(this.program, 'uPointLightPositions');
		gl.uniform3fv(lightArray, PointLight.lightPositions);

		var lightColorPtr = gl.getUniformLocation(this.program, 'uPointLightColor');
		gl.uniform3fv(lightColorPtr, PointLight.lightsColor);

		//	Spotlight setup
		var spotLightPtr = gl.getUniformLocation(this.program, 'uSpotLightLoc');
		gl.uniform3fv(spotLightPtr, [0, 0, 0]);

		var spotLightDirPtr = gl.getUniformLocation(this.program, 'uSpotLightDir');
		gl.uniform3fv(spotLightDirPtr, [1, 0, 0]);

		//	View frustum.
		var tempLoc = gl.getUniformLocation(this.program, 'n');
		gl.uniform1f(tempLoc, .1);
		tempLoc = gl.getUniformLocation(this.program, 'f');
		gl.uniform1f(tempLoc, 500);
		tempLoc = gl.getUniformLocation(this.program, 'r');
		gl.uniform1f(tempLoc, .1);
		tempLoc = gl.getUniformLocation(this.program, 't');
		gl.uniform1f(tempLoc, .1);

		this.gameState = this.CreateObject(2, GameManager, [2, 2, 2], [0, 0, 0]);

		requestAnimationFrame(Main.mainLoop)	// Static call. We can't pass "this" into the static func
	}

	UpdateAll() {
		//	In case something goes wrong, replace with this.
		for (var i in this.visual) {
			this.visual[i].update();
		}
		for (var i in this.solid) {
			this.solid[i].update();
		}
		for (var i in this.trigger) {
			this.trigger[i].update();
		}

	}
	RenderAll() {

		// gl.clear(gl.COLOR_BUFFER_BIT);
		for (var i in this.visual) {
			this.visual[i].render(this.program);
		}
		for (var i in this.solid) {
			this.solid[i].render(this.program);
		}
		for (var i in this.trigger) {
			this.trigger[i].render(this.program);
		}

	}

	CheckCollision(loc1, loc2, rad1, rad2, obj1, obj2) {

		var dist = Math.sqrt(Math.pow(loc2[0] - loc1[0], 2) + Math.pow(loc2[1] - loc1[1], 2) + Math.pow(loc2[2] - loc1[2], 2));
		//	Spherical collisions
		if (obj1.colliderType == 0 && obj2.colliderType == 0) {
			return dist < (rad1 + rad2);
		}

		//	This does NOT work for 3D scenes.
		if (obj1.colliderType == 0 && obj2.colliderType == 1) {

			//	Get closes point from obj1 to obj2
			var angle = Math.atan2((loc2[2] - loc1[2]), (loc2[0] - loc1[0]));
			var horizDist = Math.abs(Math.cos(angle) * dist) - Math.abs(Math.cos(angle) * rad1);
			var vertDist = Math.abs(Math.sin(angle) * dist) - Math.abs(Math.sin(angle) * rad1);

			// var horizDist = (Math.cos(angle) * dist) - (Math.cos(angle) * rad2);
			// var vertDist = (Math.sin(angle) * dist) - (Math.sin(angle) * rad2);

			var L = obj2.loc[0] - obj2.scale[0];
			var R = obj2.loc[0] + obj2.scale[0];

			var B = obj2.loc[2] - obj2.scale[2];
			var T = obj2.loc[2] + obj2.scale[2];

			var LR = loc1[0] + horizDist < R && loc1[0] - horizDist > L;
			var TB = loc1[2] + vertDist < T && loc1[2] - vertDist > B;

			if (LR && TB) {
				// console.log(obj1.name + " | " + obj2.name + ": (" + horizDist + ", " + vertDist + ")");
				return true;
			}
		}

		return false;
	}

	getMousePos(event) {
		// Convert coords.

		var rect = canvas.getBoundingClientRect();
		// Convert from canvas coords to screen coords
		var realX = event.clientX - rect.left;
		var realY = event.clientY - rect.top;

		// console.log(realX + "," + realY);
		// Convert from screen coords to GL coords.
		var x = -1 + 2 * realX / canvas.width;
		var y = -1 + 2 * (canvas.height - realY) / canvas.height;
		console.log("mouse: " + [x, y]);
		return [x, y];
	}

	CreateObject(type, prefab, loc, rot) {
		var temp = new prefab(this);
		var id = "ID" + this.objectCount++;
		temp.id = id;
		temp.prefab = prefab;
		for (let i = 0; i < 3; i++) {
			temp.loc[i] = loc[i];
			temp.rot[i] = rot[i];
		}

		switch (type) {
			case 0:
				this.visual[id] = temp;
				break;
			case 1:
				this.solid[id] = temp;
				break;
			case 2:
				this.trigger[id] = temp;
				break;

			default:
				break;
		}
		return temp;
	}
	DestroyObject(id) {
		//	TODO: CALL A DESTRUCTOR.
		if (id in this.visual) {
			this.visual[id].OnDestroy();
			delete this.visual[id];
			return true;
		}

		if (id in this.solid) {
			this.solid[id].OnDestroy();
			delete this.solid[id];
			return true;
		}

		if (id in this.trigger) {
			this.trigger[id].OnDestroy();
			delete this.trigger[id];
			return true;
		}

		console.warn("WARN: FAILED TO DELETE " + id);
		return false;
	}
	checkKey(key) {
		if ((key in this.keys) && this.keys[key]) {
			return true;
		} else {
			return false;
		}
	}

	KeyDown(event) {
		// console.log("The number of the key pressed:  "+event.keyCode+
		// ",the string of the event code: "+String.fromCharCode(event.keyCode));    
		this.keys[String.fromCharCode(event.keyCode)] = true;
		// console.log(String.fromCharCode(event.keyCode) + " should be true - " + this.keys[String.fromCharCode(this.keys[event.keyCode])]);
	}
	KeyUp(event) {
		// console.log("The number of the key pressed:  "+event.keyCode+
		// ",the string of the event code: "+String.fromCharCode(event.keyCode));    
		this.keys[String.fromCharCode(event.keyCode)] = false;
		// console.log(String.fromCharCode(event.keyCode) + " should be false - " + this.keys[String.fromCharCode(this.keys[event.keyCode])]);
	}

	MouseClick(event) {
		var rect = canvas.getBoundingClientRect();
		var realX = event.clientX - rect.left;
		var realY = event.clientY - rect.top;
		console.log(realX + "," + realY);
		var x = -1 + 2 * realX / myCanvas.width;
		var y = -1 + 2 * (myCanvas.height - realY) / myCanvas.height;
		console.log("The click occurred on " + x + "," + y);
	}

	GetMouseDelta(event) {
		var moveX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var moveY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		this.lastMouseDelta = [moveX, moveY];
		this.mouseMovedThisFrame = true;
		// this.lastMouseDelta = [event.clientX - this.lastMousePosition[0],
		//                    event.clientY - this.lastMousePosition[1]];
		// this.lastMousePosition = [event.clientX, event.clientY];
	}

	//Static call backs go down here
	//   |
	//  \ /
	//   v
	static keyD(event) {
		// console.log(event.code);
		m.KeyDown(event);
	}

	static keyU(event) {
		m.KeyUp(event);
	}
	static mouseMove(event) {
		// console.log(event);
		m.GetMouseDelta(event);
	}
	static mouseH(event) {
		m.MouseClick(event);
	}
	//	camera collision for next assignment: radius = sqrt(n^2 + n^2 + n^2);
	static mainLoop(timestamp) {
		Main.deltaTime = (timestamp - Main.previousTimestamp) / 1000;
		// console.log(Main.deltaTime);
		gl.clear(gl.COLOR_BUFFER_BIT);
		if (!m.mouseMovedThisFrame) {
			m.lastMouseDelta = [0, 0];
		}
		// m.lastMouseDelta = [0,0];

		m.UpdateAll();
		m.RenderAll();
		document.getElementById("framerate").innerText = "fps: " + (1 / Main.deltaTime).toFixed(2);
		document.getElementById("frametime").innerText = "previous frame: " + (Main.deltaTime * 1000).toFixed(5) + "ms";
		Main.previousTimestamp = timestamp;
		m.mouseMovedThisFrame = false;

		// console.log(Main.deltaTime);
		requestAnimationFrame(Main.mainLoop);
	}
	static vGetMagnitude(vec3) {
		return Math.sqrt(
			Math.pow(vec3[0], 2) +
			Math.pow(vec3[1], 2) +
			Math.pow(vec3[2], 2)
		);
	}

	static vNormalize(vec3) {
		var mag = this.vGetMagnitude(vec3);
		return [vec3[0] / mag,
		vec3[1] / mag,
		vec3[2] / mag];
	}

	static getDistance(loc1, loc2) {
		return Math.sqrt(
			Math.pow(loc2[0] - loc1[0], 2) +
			Math.pow(loc2[1] - loc1[1], 2) +
			Math.pow(loc2[2] - loc1[2], 2)
		);
	}

}


function CreateCheckered() {
	//Actually get our texture;
	var myPic = [];
	for (i = 0; i < 16; i++) {
		for (j = 0; j < 16; j++) {
			if (i % 2 == j % 2) {
				//Push red
				myPic.push(255, 30, 30, 255);
			}
			else {
				myPic.push(30, 255, 30, 255);
			}
		}
	}
	return myPic;
}

function CreateBrick() {
	var myPic2 = [];
	for (i = 0; i < 16; i++) {
		for (j = 0; j < 16; j++) {
			if (i == 0 || j == 0) {

				myPic2.push(0, 0, 0, 255);
			}
			else {
				myPic2.push(255, 30, 30, 255);
			}
		}
	}
	return myPic2;
}

function CreateCrate() {
	//we want to create a crate with black around the sides
	//and a black x throug the middle
	//The rest will be brown.   
	var myCrate = [];
	for (i = 0; i < 64; i++) {
		for (j = 0; j < 64; j++) {
			if (i == 0 || j == 0 || i == 63 || j == 63 || i == j || 64 - j == i) {
				myCrate.push(0, 0, 0, 255);
			}
			else {
				myCrate.push(200, 128, 23, 255);
			}
		}
	}
	return myCrate;
}
//	This fix courtesy of jfriend00 on stackoverflow: https://stackoverflow.com/a/18934718
//	I cannot believe I wasted an hour on this. Again.
canvas.setAttribute("tabindex", 0);
canvas.addEventListener("keydown", Main.keyD, true);
canvas.addEventListener("keyup", Main.keyU, true);
document.addEventListener("mousemove", Main.mouseMove || 0, true);

// function keyHandleUp(params) {
// 	Main.keyU(params)
// }
