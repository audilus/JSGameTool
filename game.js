class GameManager extends GameObject {
	constructor(engine) {
		super();
		this.engineRef = engine;

		this.player = engine.CreateObject(1, Player, [0, 0, 1], [0, 0, 0]);
		this.player.cam = engine.CreateObject(2, Camera, this.loc, this.rot);
		
		
		// engine.CreateObject(2, Hex, [0, 0, -2], [0, 0, 0]);
		// engine.CreateObject(2, Hex, [3, 0, -2], [0, 0, 0]);
		// engine.CreateObject(2, Hex, [-3, 0, -2], [0, 0, 0]);
		engine.CreateObject(2, Quad, [0, 0, 1], [0,0,0]);
		// engine.CreateObject(2, WallSide, [1,.5,1], [0,Math.PI,0]);
		engine.CreateObject(2, Ground, [0, -.5, 0], [0, 0, 0]);
		engine.CreateObject(2, Ground, [0, 2, 0], [0, 0, 0]);
		
		this.spotLight = engine.CreateObject(0, SpotLightHandler, [0, 10, 2], [Math.PI * 1.5,0,0]);
		
		
		engine.CreateObject(1, WallBlock, [1 + 1,.5,1], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 3,.5,1], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 5,.5,1], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 7,.5,1], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 9,.5,1], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 11,.5,1], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 13,.5,1], [0,0,0]);
		
		engine.CreateObject(1, WallBlock, [1 + 1,.5,6], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 3,.5,6], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 5,.5,6], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 7,.5,6], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 9,.5,6], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 11, .5,6], [0,0,0]);
		engine.CreateObject(1, WallBlock, [1 + 13., 5,6], [0,0,0]);

		// var t = engine.CreateObject(1, PointLight, [-3, 0, -5], [0, 0, 0]);
		this.plights = []
		for (let i = 0; i < 10; i++) {
			var myX = i * -5;
			var myY = 0;
			var myZ = i * -5;
			
			
			var r = engine.CreateObject(1, PointLight, [myX, myY, myZ], [0, 0, 0]);
			this.plights.push(r);
		}
		// this.spotLight.enableDebug(engine);
		//#region 
		// this.candles = [];
		
		// this.candles.push(engine.CreateObject(0, Candle, [0, 0.1, 0], [0,0,0]));
		// this.candles.push(engine.CreateObject(0, Candle, [5, 0.1, 0], [0,0,0]));
		// this.candles.push(engine.CreateObject(0, Candle, [20, 0.1, 1], [0,0,0]));
		// this.candles.push(engine.CreateObject(0, Candle, [25, 0.1, 2], [0,0,0]));
		// this.candles.push(engine.CreateObject(0, Candle, [15, 0.1, 3], [0,0,0]));

		// this.candles[1].color = [.2, 0, 0];
		

//#endregion
	}
	update() {
		
	}
	render() {


	}
}

class Bullet extends GameObject
{
	constructor()
	{
		super();
		this.angVelocity = [0,0,0];
		this.isTrigger = false;
		this.buffer=gl.createBuffer();

		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		
		
		//!!!!!!!!!!!!!!!!!Changes due to texture
		// this.MyPicture = Sprites.exp0;
		this.MyPicture = Sprites.sheet_projectile;
		this.deathFlipbook = Sprites.sheet_explosion;
		// this.MyPicture = CreateCrate();

		//Get vertices from announcements
		this.vertices =
		[
			//X 	Y 	Z   S   T
			-1,		-1,	0, 0,   1,
			1,		-1, 0, 1,   1,
			-1,      1, 0, 0,   0,
			1,		1,  0, 1,   0
		];
		this.useLighting = false;
		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		//We only want to do this once.
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.MyPicture[2]));
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];

		this.spriteIndex = 0;
		this.spriteCount = this.MyPicture.length;

		this.spriteFrameRate = 0.5;
		this.spriteClock = this.spriteFrameRate;

		this.lifetime = 2;
		this.isDead = false;

	}

	die(){
		this.MyPicture = Sprites.sheet_explosion;
		this.spriteCount = this.MyPicture.length;	
		
	}
	
	nextSprite () {
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.MyPicture[this.spriteIndex]));

		if (this.spriteIndex++ >= this.MyPicture.length) {
			this.spriteIndex = 0;
			if (this.isDead) {
				console.error(this.id + "should have died");
				m.DestroyObject(this.id);
			}
		}
		
		
		// gl.texSubImage2D(
		// 	gl.TEXTURE_2D, 0, 0, 0, gl.RGBA,
		// 	gl.UNSIGNED_BYTE, new Uint8Array(this.MyPicture[0]));
	}
	update()
	{
		this.lifetime -= Main.deltaTime;
		
		
		this.spriteClock -= Main.deltaTime;
		if (this.spriteClock <= 0) {
			this.nextSprite();
			this.spriteClock = this.spriteFrameRate;
		}
		if (this.lifetime <= 0) {
			this.die();
		}else{
			this.move();
		}
	}
	render(program)
	{
		// gl.bindBuffer()
		// gl.texSubImage2D(gl.TEXTURE_2D, 0,0,0,64, 64, gl.RGBA, gl.UNSIGNED_BYTE, this.MyPicture[2]);
		
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		
		//Make sure you change this to 5 for your TEXTURES
		var stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TEXTURE CHANGE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//Now we have to do this for color
		var colorAttributeLocation = gl.getAttribLocation(program,"texcoord");
		//We don't have to bind because we already have the correct buffer bound.
		size = 2;
		type = gl.FLOAT;
		normalize = false;
		stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
		

		
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
	 
		var scaleLoc = gl.getUniformLocation(program, 'u_scale');
		gl.uniform3fv(scaleLoc,new Float32Array(this.scale));

		var FaceCamLoc = gl.getUniformLocation(program,'FaceCam');
		gl.uniform1i(FaceCamLoc,true);
	 
		var fullBrightPtr = gl.getUniformLocation(program,'useLighting');
		gl.uniform1i(fullBrightPtr, this.useLighting);
	 

		//var ibuffer = gl.createBuffer();
		 //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
		 //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
		 //gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);
		 gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		 
		 gl.uniform1i(FaceCamLoc,false);
	}
}

class WallBlock extends GameObject {
	constructor(engine) {
		super();
		this.isTrigger = false;
		this.colliderType = 1;
		this.s1 = engine.CreateObject(0, WallSide, [0,0,0], [0, Math.PI * 0, 0]);
		this.s2 = engine.CreateObject(0, WallSide, [0,0,0], [0, Math.PI *.5, 0]);
		this.s3 = engine.CreateObject(0, WallSide, [0,0,0], [0, Math.PI * 1, 0]);
		this.s4 = engine.CreateObject(0, WallSide, [0,0,0], [0, Math.PI * 1.5, 0]);
	}

	onCollision () {
		console.log("foo");
	}

	update () {
		this.s1.loc = this.loc;
		this.s2.loc = this.loc;
		this.s3.loc = this.loc;
		this.s4.loc = this.loc;
	}

	render () {
		
	}
}

class WallSide extends GameObject
{
	constructor()
	{
		super();
		this.angVelocity = [0,0,0];
		this.isTrigger = false;
		this.buffer=gl.createBuffer();

		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		
		
		//!!!!!!!!!!!!!!!!!Changes due to texture
		// this.MyPicture = Sprites.exp0;
		this.MyPicture = CreateCrate();
		// this.MyPicture = CreateCrate();

		//Get vertices from announcements
		this.vertices =
		[
			//X 	Y 		Z   S	 T
			-1,		-1,		1, 	0,   1,
			 1,		-1, 	1, 	1,   1,
			-1,      1, 	1, 	0,   0,
			 1,		 1,		1, 	1,   0,
		];
		this.useLighting = true;
		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		//We only want to do this once.
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.MyPicture));
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];

	}
	
	update()
	{
		
		this.move();
	}
	render(program)
	{
		// gl.bindBuffer()
		// gl.texSubImage2D(gl.TEXTURE_2D, 0,0,0,64, 64, gl.RGBA, gl.UNSIGNED_BYTE, this.MyPicture[2]);
		
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		
		//Make sure you change this to 5 for your TEXTURES
		var stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TEXTURE CHANGE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//Now we have to do this for color
		var colorAttributeLocation = gl.getAttribLocation(program,"texcoord");
		//We don't have to bind because we already have the correct buffer bound.
		size = 2;
		type = gl.FLOAT;
		normalize = false;
		stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
		

		
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
	 
		var scaleLoc = gl.getUniformLocation(program, 'u_scale');
		gl.uniform3fv(scaleLoc,new Float32Array(this.scale));

		var FaceCamLoc = gl.getUniformLocation(program,'FaceCam');
		gl.uniform1i(FaceCamLoc, false);
	 
		var fullBrightPtr = gl.getUniformLocation(program,'useLighting');
		gl.uniform1i(fullBrightPtr, this.useLighting);
	 

		//var ibuffer = gl.createBuffer();
		 //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
		 //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
		 //gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);
		 gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		 
		 gl.uniform1i(FaceCamLoc,false);
	}
}

class Quad extends GameObject
{
	constructor()
	{
		super();
		this.angVelocity = [0,0,0];
		this.isTrigger = false;
		this.buffer=gl.createBuffer();

		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		
		
		//!!!!!!!!!!!!!!!!!Changes due to texture
		// this.MyPicture = Sprites.exp0;
		this.MyPicture = Sprites.sheet_projectile;
		// this.MyPicture = CreateCrate();

		//Get vertices from announcements
		this.vertices =
		[
			//X 	Y 	Z   S   T
			-1,		-1,	0, 0,   1,
			1,		-1, 0, 1,   1,
			-1,      1, 0, 0,   0,
			1,		1,  0, 1,   0
		];
		this.useLighting = false;
		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		//We only want to do this once.
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.MyPicture[2]));
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];

		this.spriteIndex = 0;
		this.spriteCount = this.MyPicture.length;

		this.spriteFrameRate = 0.5;
	}
	nextSprite () {
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.MyPicture[this.spriteIndex]));

		if (this.spriteIndex++ >= this.MyPicture.length) {
			this.spriteIndex = 0;
		}
		
		// gl.texSubImage2D(
		// 	gl.TEXTURE_2D, 0, 0, 0, gl.RGBA,
		// 	gl.UNSIGNED_BYTE, new Uint8Array(this.MyPicture[0]));
	}
	update()
	{
		this.spriteFrameRate -= Main.deltaTime;
		if (this.spriteFrameRate <= 0) {
			this.nextSprite();
			this.spriteFrameRate = 0.3;
		}
		this.move();
	}
	render(program)
	{
		// gl.bindBuffer()
		// gl.texSubImage2D(gl.TEXTURE_2D, 0,0,0,64, 64, gl.RGBA, gl.UNSIGNED_BYTE, this.MyPicture[2]);
		
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		
		//Make sure you change this to 5 for your TEXTURES
		var stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TEXTURE CHANGE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//Now we have to do this for color
		var colorAttributeLocation = gl.getAttribLocation(program,"texcoord");
		//We don't have to bind because we already have the correct buffer bound.
		size = 2;
		type = gl.FLOAT;
		normalize = false;
		stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
		

		
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
	 
		var scaleLoc = gl.getUniformLocation(program, 'u_scale');
		gl.uniform3fv(scaleLoc,new Float32Array(this.scale));

		var FaceCamLoc = gl.getUniformLocation(program,'FaceCam');
		gl.uniform1i(FaceCamLoc,true);
	 
		var fullBrightPtr = gl.getUniformLocation(program,'useLighting');
		gl.uniform1i(fullBrightPtr, this.useLighting);
	 

		//var ibuffer = gl.createBuffer();
		 //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
		 //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
		 //gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);
		 gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		 
		 gl.uniform1i(FaceCamLoc,false);
	}
}

class Coin extends Shape3D {
	static coinCount = 0;
	static totalCoins = 500;
	constructor() {
		super([-.5, -.5, 0, 1, 0, 0,
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
		-.5, -.5, 0, 1, 1, 0]);
		this.scale = [0.08, 0.08, 0.08];
		// this.angVelocity = [0, 1, 0];
		this.primitive = gl.TRIANGLES;
		// this.position = ;

		this.lifetime = 100;
		Coin.coinCount++;

	}
	update() {
		this.lifetime -= Main.deltaTime;
		if (this.lifetime <= 0) {
			m.DestroyObject(this.id);
			Coin.coinCount--;
			// console.log("Destroyed object at: " + this.loc);

			// console.log(Coin.coinCount--);
		}
	}
}

class SpotLightHandler extends GameObject {
	constructor(engine) {
		super();
		this.timer = 0;
		// this.dp;
		// this.dp2;

		this.patrolPoints =[
			[0, 10, 2],
			[2, 10, 3],
			[5, 10, -3]
		]
		this.patrolPoint = 0;

		// this.failCollider = engine.CreateObject(2, ResetTrigger, [this.loc[0], 0, this.loc[2]], [0,0,0]);
		// this.failCollider.scale = [2.3,2.3,2.3];
	}
	enableDebug(engine){
		// this.dp = engine.CreateObject(0, _DebugPoint, this.loc, this.rot);
		// var x = [
		// 	this.rot[0] + this.loc[0],
		// 	this.rot[1] + this.loc[1],
		// 	this.rot[2] + this.loc[2],
		// 	]
		// this.dp2 = engine.CreateObject(0, _DebugPoint, x, this.rot);
	}
	update() {
		this.transform.doRotations(this.rot);
		if (this.timer >= Math.PI * 2){
			this.timer = 0;
		}
		this.timer += Main.deltaTime * .5;
		// this.rot[0] = this.timer;
		var x = [
			this.transform.forward[0] + this.loc[0],
			this.transform.forward[1] + this.loc[1],
			this.transform.forward[2] + this.loc[2],
			]
		// this.dp2.loc = x;
		this.transform.doRotations(this.rot);
		this.loc = [
			Math.cos(this.timer) * 10,
			10,
			Math.sin(this.timer) * 10
		];
		// this.dp.loc = this.loc;
		
		// this.failCollider.loc = [this.loc[0], 0, this.loc[2]];

		// if (Math.round(this.loc) != Math.round(this.patrolPoints[this.patrolPoint])) {
		// 	var point = this.patrolPoints[this.patrolPoint];
		// 	var dir = [
		// 		this.loc[0] - point[0],
		// 		this.loc[1] - point[1],
		// 		this.loc[2] - point[2],
		// 	];
		// 	Main.vNormalize(dir);
		// 	this.velocity = dir;
		// }

	}
	render() {
		
		this.transform.doRotations(this.rot);
		var spotLightPtr = gl.getUniformLocation( m.program, 'uSpotLightLoc');
		gl.uniform3fv(spotLightPtr, this.loc);

		var headingDirection = [this.transform.forward[0], this.transform.forward[1], this.transform.forward[2]];

		var spotLightDirPtr = gl.getUniformLocation( m.program, 'uSpotLightDir');
		gl.uniform3fv(spotLightDirPtr, headingDirection);

		// console.log("Spotlight: " + this.loc + " " + headingDirection);
	}
}

class _DebugPoint extends Shape3D {
	constructor (){
		super([0, 0, 0, 1, 1, 1]);
	}
	
}

class Player extends GameObject {
	constructor(engine) {
		super();
		// this.position = location;
		this.colliderType = 0;
		this.name = "Player";
		this.collisionRadius = .1; //    Make this align with the near plane.
		this.bullets = [];
		this.collisionClock = 0;
		this.transform = new Transform();

		this.moveSpeed = 0.3;

		this.cam;

		//	In shots per second
		this.fireRate = 1 / 9;
		this.gunClock = 0;

		this.jumpable = true;

		this.mouseSensitivity = 0.9;
		
		this.firstLoc = [this.loc[0], this.loc[1], this.loc[2]];
		this.firstRot = [this.rot[0], this.rot[1], this.rot[2]];

		this.light = engine.CreateObject(0, PointLight, this.loc, this.rot);
		this.light.color = [0.1,0.1,0.1];

	}
	Reset(){
		this.loc = [this.firstLoc[0], this.firstLoc[1], this.firstLoc[2]];
		this.rot = [this.firstRot[0], this.firstRot[1], this.firstRot[2]];
	}
	onCollision(other) {
		if (other.name == "Win"){
			console.log("Win Condition");
		}
		if (other.name == "Reset"){
			this.Reset();
		}
		if (other.name == "Rock") {
			// var diff = [
			// 	this.loc[0] - other.loc[0],
			// 	this.loc[1] - other.loc[1],
			// 	this.loc[2] - other.loc[2]
			// ];

			// diff = Main.vNormalize(diff);

			// var myVNorm = Main.vNormalize(this.velocity);
			// for (let i = 0; i < 3; i++) {

			// 	other.velocity[i] += diff[i] * -10 * myVNorm[i];

			// 	// other.velocity[i] += this.velocity[i] ;
			// 
			// }
			if (document.getElementById("useBounce").checked) {
				for (let i = 0; i < 3; i++) {
					this.velocity[i] *= -1;
				}
			}
		}
		return;
	}

	update() {
		this.light.loc = this.loc;

		this.gunClock -= Main.deltaTime;

		//	Dampening
		for (let i = 0; i < 3; i++) {
			this.velocity[i] -= this.velocity[i] / .15 * Main.deltaTime;
		}
		this.rot[1] += m.lastMouseDelta[0] * Main.deltaTime * this.mouseSensitivity;
		this.rot[0] += m.lastMouseDelta[1] * Main.deltaTime * this.mouseSensitivity;
		this.rot[0] = Math.min(this.rot[0], 0.5 * Math.PI);
		this.rot[0] = Math.max(this.rot[0], -0.5 * Math.PI);
		console.log(m.lastMouseDelta);
		//Inverse rotation here!
		if (m.checkKey("J")) {
			this.rot[1] -= 1.5 * Main.deltaTime;
		}
		if (m.checkKey("L")) {
			this.rot[1] += 1.5 * Main.deltaTime;
		}

		if (this.collisionClock <= 0) {
			this.transform.doRotations(this.rot);
			
			var fHorizontal = [this.transform.forward[0], 0, this.transform.forward[2]];
			var rHorizontal = [this.transform.right[0], 0, this.transform.right[2]];
			//	Strafing
			if (m.checkKey("D")) {
				// this.transform.doRotations(this.rot)
				for (let i = 0; i < 3; i++) {
					this.velocity[i] += rHorizontal[i] * 1 * this.moveSpeed;
				}
			}
			if (m.checkKey("A")) {
				// this.transform.doRotations(this.rot)
				for (let i = 0; i < 3; i++) {
					this.velocity[i] += rHorizontal[i] * -1 * this.moveSpeed;
				}
			}

			if (m.checkKey("W")) {
				for (let i = 0; i < 3; i++) {
					this.velocity[i] += fHorizontal[i] * 1 * this.moveSpeed;
				}
			}
			if (m.checkKey("S")) {
				// this.transform.doRotations(this.rot)
				for (let i = 0; i < 3; i++) {
					this.velocity[i] += fHorizontal[i] * -1 * this.moveSpeed;
				}
			}

			// if (m.checkKey("X") || m.checkKey(" ")) {
			// 	this.transform.doRotations(this.rot)
			// 	for (let i = 0; i < 3; i++) {
			// 		this.velocity[i] += this.transform.up[i] * 1 * this.moveSpeed;
			// 	}
			// }
			// if (m.checkKey("Z") || m.checkKey("C")) {
			// 	this.transform.doRotations(this.rot)
			// 	for (let i = 0; i < 3; i++) {
			// 		this.velocity[i] += this.transform.up[i] * -1 * this.moveSpeed;
			// 	}
			// }

		}
		//fire
		if (this.gunClock <= 0) {
			if (m.checkKey(" ")){
				var frontOfMe = [
					this.loc[0] + this.transform.forward[0],
					this.loc[1] + this.transform.forward[1] - 0.2,
					this.loc[2] + this.transform.forward[2]
				];
				var b = m.CreateObject(1, Bullet, frontOfMe, this.rot);
				// b.velocity = this.velocity;
				b.velocity[0] += this.velocity[0] + this.transform.forward[0] * 10;
				b.velocity[1] += this.velocity[1] + this.transform.forward[1] * 10;
				b.velocity[2] += this.velocity[2] + this.transform.forward[2] * 10;

			}
			this.gunClock = this.fireRate;
		}


		this.move()
		this.transform.doRotations(this.rot)

		this.cam.loc = this.loc;
		this.cam.rot = this.rot;
	}

	render() {

	}
}


class Candle extends Shape3D {
	constructor(engine) {
		super([
			-.5, -.5, -.25, .76, .70, .60,
				-.5, .5, -.25, .76, .70, .60,
				-.25, -.5, -.5, .76, .70, .60,
				-.25, .5, -.5, .76, .70, .60,
				.25, -.5, -.5, .76, .70, .60,
				.25, .5, -.5, .76, .70, .60,
				.5, -.5, -.25, .76, .70, .60,
				.5, .5, -.25, .76, .70, .60,
				.5, -.5, .25, .76, .70, .60,
				.5, .5, .25, .76, .70, .60,
				.25, -.5, .5, .76, .70, .60,
				.25, .5, .5, .76, .70, .60,
				-.25, -.5, .5, .76, .70, .60,
				-.25, .5, .5, .76, .70, .60,
				-.5, -.5, .25, .76, .70, .60,
				-.5, .5, .25, .76, .70, .60,
				-.5, -.5, -.25, .76, .70, .60,
				-.5, .5, -.25, .76, .70, .60
		])
		this.primitive = gl.TRIANGLE_STRIP;
		this.scale = [0.1, 0.3, 0.1];
		this.lightSource;
		
	}
	switchOn (engine) {
		this.lightSource = engine.CreateObject(2, PointLight, this.loc, [0,0,0]);
		this.lightSource.color = [0.8, 0.6, 0.2];
	}
}

class Icosphere extends Shape3D {
	constructor(location) {
		super([
			0.000000, -1.000000, 0.000000, 0.8, 0.2, 0.9,
			0.723600, -0.447215, 0.525720, 0.8, 0.2, 0.9,
			-0.276385, -0.447215, 0.850640, 0.8, 0.2, 0.9,

			0.000000, -1.000000, 0.000000, 0.2, 0.7, 0.9,
			-0.276385, -0.447215, 0.850640, 0.2, 0.7, 0.9,
			-0.894425, -0.447215, 0.000000, 0.2, 0.7, 0.9,

			0.000000, -1.000000, 0.000000, 0.5, 0.5, 0.9,
			-0.894425, -0.447215, 0.000000, 0.5, 0.5, 0.9,
			-0.276385, -0.447215, -0.850640, 0.5, 0.5, 0.9,

			0.000000, -1.000000, 0.000000, 0.6, 0.9, 0.9,
			-0.276385, -0.447215, -0.850640, 0.6, 0.9, 0.9,
			0.723600, -0.447215, -0.525720, 0.6, 0.9, 0.9,


			0.000000, -1.000000, 0.000000, 0.2, 0.9, 0.8,
			0.723600, -0.447215, -0.525720, 0.2, 0.9, 0.8,
			0.723600, -0.447215, 0.525720, 0.2, 0.9, 0.8,


			0.723600, -0.447215, 0.525720, 0.4, 0.7, 0.3,
			0.276385, 0.447215, 0.850640, 0.4, 0.7, 0.3,
			-0.276385, -0.447215, 0.850640, 0.4, 0.7, 0.3,

			0.276385, 0.447215, 0.850640, 0.8, 0.2, 0.9,
			-0.723600, 0.447215, 0.525720, 0.8, 0.2, 0.9,
			-0.276385, -0.447215, 0.850640, 0.8, 0.2, 0.9,

			-0.276385, -0.447215, 0.850640, 0.2, 0.7, 0.9,
			-0.723600, 0.447215, 0.525720, 0.2, 0.7, 0.9,
			-0.894425, -0.447215, 0.000000, 0.2, 0.7, 0.9,


			-0.723600, 0.447215, 0.525720, 0.4, 0.7, 0.3,
			-0.723600, 0.447215, -0.525720, 0.4, 0.7, 0.3,
			-0.894425, -0.447215, 0.000000, 0.4, 0.7, 0.3,

			-0.894425, -0.447215, 0.000000, 0.5, 0.5, 0.9,
			-0.723600, 0.447215, -0.525720, 0.5, 0.5, 0.9,
			-0.276385, -0.447215, -0.850640, 0.5, 0.5, 0.9,

			-0.276385, -0.447215, -0.850640, 0.6, 0.9, 0.9,
			0.276385, 0.447215, -0.850640, 0.6, 0.9, 0.9,
			-0.723600, 0.447215, -0.525720, 0.6, 0.9, 0.9,

			-0.276385, -0.447215, -0.850640, 0.2, 0.9, 0.8,
			0.276385, 0.447215, -0.850640, 0.2, 0.9, 0.8,
			0.723600, -0.447215, -0.525720, 0.2, 0.9, 0.8,

			0.894425, 0.447215, 0.000000, 0.7, 0.5, 0.9,
			0.276385, 0.447215, -0.850640, 0.7, 0.5, 0.9,
			0.723600, -0.447215, -0.525720, 0.7, 0.5, 0.9,

			0.723600, -0.447215, -0.525720, 0.2, 0.9, 0.8,
			0.894425, 0.447215, 0.000000, 0.2, 0.9, 0.8,
			0.723600, -0.447215, 0.525720, 0.2, 0.9, 0.8,

			0.894425, 0.447215, 0.000000, 0.7, 0.5, 0.9,
			0.276385, 0.447215, 0.850640, 0.7, 0.5, 0.9,
			0.723600, -0.447215, 0.525720, 0.7, 0.5, 0.9,



			0.276385, 0.447215, 0.850640, 0.4, 0.7, 0.3,
			0.000000, 1.000000, 0.000000, 0.4, 0.7, 0.3,
			-0.723600, 0.447215, 0.525720, 0.4, 0.7, 0.3,

			-0.723600, 0.447215, 0.525720, 0.8, 0.2, 0.9,
			0.000000, 1.000000, 0.000000, 0.8, 0.2, 0.9,
			-0.723600, 0.447215, -0.525720, 0.8, 0.2, 0.9,

			-0.723600, 0.447215, -0.525720, 0.5, 0.5, 0.9,
			0.000000, 1.000000, 0.000000, 0.5, 0.5, 0.9,
			0.276385, 0.447215, -0.850640, 0.5, 0.5, 0.9,

			0.276385, 0.447215, -0.850640, 0.7, 0.5, 0.9,
			0.000000, 1.000000, 0.000000, 0.7, 0.5, 0.9,
			0.894425, 0.447215, 0.000000, 0.7, 0.5, 0.9,

			0.894425, 0.447215, 0.000000, 0.4, 0.7, 0.3,
			0.000000, 1.000000, 0.000000, 0.4, 0.7, 0.3,
			0.276385, 0.447215, 0.850640, 0.4, 0.7, 0.3,
		]);
		// console.log(m.program);
		//this.angular_velocity[0] += 0.001;
		// this.angular_velocity[1] += 0.001;
		// this.angular_velocity[2] += 0.001;
		// this.angular_velocity[1] += 0.01;
		// this.angular_velocity[2] += 0.01;
		this.primitive = gl.POINTS;
		//console.log(this.vertices.length / 6);
	}
	update() {
		this.move();
	}
}


class Ground extends GameObject
{
	constructor()
	{
		super();
		this.buffer=gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		
		//!!!!!!!!!!!!!TEXTURE CHANGE !!!!!!!!!!!
		this.picture = CreateCheckered();
		
		this.vertices =
		[//  X     Y  Z     s t
			-1000,0,-1000,  0,0,
			1000,0, -1000,  100,0,
			-1000,0,1000,   0,100,
			1000, 0,1000,   100,100	
		];
		this.useLighting = true;
		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		//We only want to do this once.
		//void gl.texImage2D(target, level, internalformat, width, height, border, format, 
		//type, ArrayBufferView? pixels);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,16,16,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.picture));
	
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}
	update()
	{
		//Do Nothing
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
		var scaleLoc= gl.getUniformLocation(program, "u_scale");
		gl.uniform3fv(scaleLoc, new Float32Array(this.scale));

		var isBillboard = gl.getUniformLocation(program, 'FaceCam');
		gl.uniform1i(isBillboard, false);
	 
		var fullBrightPtr = gl.getUniformLocation(program,'useLighting');
		gl.uniform1i(fullBrightPtr, this.useLighting);
	 
		//var ibuffer = gl.createBuffer();
	 //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
	 //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
	 //gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);
	 gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}


class Hex extends GameObject {
	constructor() {
		super();
		this.angVelocity = [0, .025, 0];
		this.isTrigger = false;
		this.buffer = gl.createBuffer();
		this.colorBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
			[
				-.5, -.5, -.25, .54, .27, .07,
				-.5, .5, -.25, .54, .27, .07,
				-.25, -.5, -.5, .54, .27, .07,
				-.25, .5, -.5, .54, .27, .07,
				.25, -.5, -.5, .54, .27, .07,
				.25, .5, -.5, .54, .27, .07,
				.5, -.5, -.25, .54, .27, .07,
				.5, .5, -.25, .54, .27, .07,
				.5, -.5, .25, .54, .27, .07,
				.5, .5, .25, .54, .27, .07,
				.25, -.5, .5, .54, .27, .07,
				.25, .5, .5, .54, .27, .07,
				-.25, -.5, .5, .54, .27, .07,
				-.25, .5, .5, .54, .27, .07,
				-.5, -.5, .25, .54, .27, .07,
				-.5, .5, .25, .54, .27, .07,
				-.5, -.5, -.25, .54, .27, .07,
				-.5, .5, -.25, .54, .27, .07
			];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc = [0, 0, 0];
		this.rot = [0, 0, 0];
	}
	update() {
		this.move();
	}
	render(program) {
		//First we bind the buffer for triangle 1
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 6 * Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);


		//Now we have to do this for color
		var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
		//We don't have to bind because we already have the correct buffer bound.
		size = 3;
		type = gl.FLOAT;
		normalize = false;
		stride = 6 * Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3 * Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);

		var tranLoc = gl.getUniformLocation(program, 'u_translation');
		gl.uniform3fv(tranLoc, new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program, 'u_rotation');
		gl.uniform3fv(thetaLoc, new Float32Array(this.rot));
		var scaleLoc = gl.getUniformLocation(program, 'u_scale');
		gl.uniform3fv(scaleLoc, new Float32Array(this.scale));


		var primitiveType = gl.TRIANGLE_STRIP;
		offset = 0;
		var count = 18;
		gl.drawArrays(primitiveType, offset, count);
	}
}


