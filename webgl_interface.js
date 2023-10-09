class InitWebGLProgram {
    constructor() {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0.1, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        // gl.enable(gl.CULL_FACE);
    }

    //  Shader code:
    static vertexShaderSource = 
    /*glsl*/`#version 300 es
    
    // in vec3 a_color;
    // out vec3 v_color;
    in vec4 a_position;	
    in vec2 texcoord;
    out vec2 v_texcoord;


    //This is added to place the object
    uniform vec3 u_translation;
    uniform vec3 u_rotation;	
    uniform vec3 u_scale;
    
    //This was added for camera move
    uniform vec3 cameraLoc;
    uniform vec3 cameraRot;
    uniform float n;
    uniform float f;
    uniform float r;
    uniform float t;

    
    uniform bool FaceCam;

    out vec3 fakenormal;
    out vec3 v_surfaceToLight;
    out vec3 v_surfaceToView;
    out vec3 v_spot_surfaceToLight;
        
    vec4 PositionObject(vec4 pos)
    {
        mat4 translateM = mat4(1.0,0.0,0.0,0.0,
                       0.0,1.0,0.0,0.0,
                       0.0,0.0,1.0,0.0,
                       u_translation.x,u_translation.y,u_translation.z,1.0);
        return translateM*pos;	
    }
    
    vec4 ScaleObject(vec4 pos)
    {
        if(length(u_scale) != 0.0)
        {
        mat4 scaleM = mat4(
                        u_scale.x,0.0,0.0,0.0,
                        0.0,u_scale.y,0.0,0.0,
                        0.0,0.0,u_scale.z,0.0,
                        0.0,0.0,0.0,1.0
                        );
            return scaleM * pos;
        }
        else
        {
            return pos;
        }
    }
    
    vec4 RotateObject(vec4 pos)
    {
        vec3 c = cos(u_rotation);
        vec3 s = sin(u_rotation);
        mat4 rotateX = mat4(
                            1.0,	0.0,		0.0,		0.0,
                            0.0,	c.x,		s.x,		0.0,
                            0.0,	-1.0*s.x, 	c.x,		0.0,
                            0.0,	0.0,		0.0,		1.0
                            );
        mat4 rotateY = mat4(c.y,0.0,-1.0*s.y,0.0,
                            0.0,1.0,0.0,0.0,
                            s.y,0.0,c.y,0.0,
                            0.0,0.0,0.0,1.0);
        mat4 rotateZ = mat4(
                            c.z,		s.z,		0.0,	0.0,
                            -1.0*s.z, 	c.z,		0.0,	0.0,
                            0.0,		0.0,		1.0,	0.0,
                            0.0,		0.0,		0.0,	1.0
                            );					
        return rotateX* rotateY*rotateZ*pos;
    }
    
    vec4 MoveCamera(vec4 pos)
    {
    vec3 cw = cos(cameraRot);
    vec3 sw = sin(cameraRot);
    
    mat4 translateView = mat4(
                1.0,0.0,0.0,0.0,
                0.0,1.0,0.0,0.0,
                0.0,0.0,-1.0,0.0,
                -1.0*cameraLoc.x,-1.0*cameraLoc.y,cameraLoc.z,1.0
                );
                
    mat4 rotateYView = mat4(
                cw.y,0.0,-1.0*sw.y,0.0,
                0.0,1.0,0.0,0.0,
                sw.y,0.0,cw.y,0.0,
                0.0,0.0,0.0,1.0
                );
                            
    mat4 rotateXView = mat4(
                1.0,	0.0,		0.0,	0.0,
                0.0,	cw.x,		sw.x,	0.0,
                0.0,	-1.0*sw.x, 	cw.x,	0.0,
                0.0,	0.0,		0.0,	1.0
                        );
    
    mat4 rotateZView = mat4(
                cw.z,		sw.z,		0.0,	0.0,
                -1.0*sw.z, 	cw.z,		0.0,	0.0,
                0.0,		0.0,		1.0,	0.0,
                0.0,		0.0,		0.0,	1.0
                        );		
    return rotateXView*rotateYView*rotateZView*translateView*pos;
    }
    
    vec4 ApplyProjection(vec4 pos)
    {
    
        mat4 ComplexPerspective = mat4(
                        n/r, 0.0,0.0,0.0,
                        0.0, n/t,0.0,0.0,
                        0.0,0.0,-1.0*(f+n)/(f-n),-1.0,
                        0.0,0.0,-2.0*f*n/(f-n),0.0
                        );
                                    
        mat4 ComplexOrtho = mat4(	
                    1.0/r,0.0,0.0,0.0,
                    0.0,1.0/t,0.0,0.0,	
                    0.0,0.0,1.0,0.0,
                    0.0,0.0,0.0,1.0	
                    );
                        
        //Choose which projection you want here:  Perspective or Orthographic			
        return ComplexPerspective*pos;
    }
            
    
    //End of Camera Move
    
    
    vec4 LookAt(vec3 F, vec3 U, vec4 pos)
    {
        //precision mediump float;
        vec3 R = cross(F,U);
        mat4 LookAt = mat4(R.x,R.y,R.z,0.0,
                            U.x,U.y,U.z,0.0,
                            F.x,F.y,F.z,0.0,
                            0.0,0.0,0.0,1.0);
                
        return LookAt*pos;	
    }
    out vec4 v_WorldSpace;

    const int NUM_LIGHTS = 8;
    
    uniform vec3 uPointLightPositions[NUM_LIGHTS];
    out vec3 vPointLightPositions[NUM_LIGHTS];

    uniform vec3 uPointLightColor[NUM_LIGHTS];
    out vec3 vPointLightColor[NUM_LIGHTS];

    uniform vec3 uSpotLightLoc;
    out vec3 vSpotLightLoc;

    void main()
    {
        // vec4 worldSpace = PositionObject(RotateObject(a_position));
        
        vec4 worldSpace = vec4(0.0, 0.0, 0.0, 1.0);
        //  This check is just to handle our ground plane's normals
        if(length(a_position) < 5.0){
            fakenormal = RotateObject(a_position).xyz;
        }
        else {
            fakenormal = vec3(0.0, 1.0, 0.0);
        }
        
        
        // For billboards
        if(FaceCam)
        {
            vec3 F = normalize(vec3(cameraLoc.x,cameraLoc.y,1.0*cameraLoc.z) - u_translation);
            vec3 U = vec3(0.0,1.0,0.0);
            worldSpace = PositionObject(LookAt(F,U,ScaleObject(a_position)));
            fakenormal = LookAt(F,U,ScaleObject(a_position)).xyz;
        }
        else
        {
            worldSpace = PositionObject(RotateObject(ScaleObject(a_position)));
        }

        for (int i = 0; i < NUM_LIGHTS; i++){
            vPointLightPositions[i] = uPointLightPositions[i] - worldSpace.xyz;
        }

        for (int i = 0; i < NUM_LIGHTS; i++){
            vPointLightColor[i] = uPointLightColor[i] ;
        }

        


        //Lighting
        
        
        //  TODO: Pass in a uniform of all lights in the world
                            /* Light position */
        // v_surfaceToView = cameraLoc - worldSpace.xyz;
                                /* Light position */
        v_spot_surfaceToLight = uSpotLightLoc - worldSpace.xyz;
        // vec3(5.0, 0.0, -2.0)
        gl_PointSize = 10.0;
        // v_color = a_color;
        v_texcoord = texcoord;

        //Now the final gl_Position will be the world space coordinates.
        gl_Position=ApplyProjection(MoveCamera(worldSpace));

    }`

    static fragmentShaderSource =/*glsl*/`#version 300 es
    //Fragment shaders do not have precision so we have to set it.
    precision mediump float;
    
    // in vec3 v_color;
    in vec2 v_texcoord;
    uniform sampler2D sampler;

    in vec3 fakenormal;
    in vec3 v_surfaceToLight;
    in vec3 v_surfaceToView;
    in vec3 v_spot_surfaceToLight;

    in vec4 v_WorldSpace;
    
    const int NUM_LIGHTS = 8;
    
    in vec3 vPointLightPositions[NUM_LIGHTS];
    
    in vec3 vPointLightColor[NUM_LIGHTS];
    
    uniform vec3 uSpotLightDir;
    uniform vec3 uSpotLightColor;
    uniform bool useLighting;
    out vec4 fragColor;


    void main()
    {
        
        float ambient = .05;	
        if (!useLighting) {
            ambient = 1.0;
        }
        vec3 finalLightContrib;
        finalLightContrib = vec3(finalLightContrib + ambient);

        vec3 pointContribution;
        // if (!useLighting) {
        //     vec4 fragColor = texture(sampler, v_texcoord);
        //     if (fragColor.w < 1.0) {
        //         discard;
        //     }
        // }

        for (int i = 0; i < NUM_LIGHTS; i++){
            float p_light = dot(normalize(fakenormal),normalize(vPointLightPositions[i]))*2.0/length(vPointLightPositions[i]);
            vec3 p_light_color = vPointLightColor[i];
            if(p_light <0.0)
            {
                p_light = 0.0;
            }
            pointContribution += p_light * p_light_color;
        }            
        float d_light = .25 * dot(normalize(fakenormal),normalize(vec3(20.0,5.0,20.0)));
        if (d_light < 0.0)
        {
            d_light = 0.0;
        }
        
        finalLightContrib += pointContribution + d_light;
        
        float spot_light_power;
        // uSpotLightDir = vec3(1,0,0);
        float spot_light = dot(normalize(v_spot_surfaceToLight),uSpotLightDir);//- light dir;
        if(spot_light >= .98)
        {
            spot_light_power = dot(normalize(fakenormal),normalize(v_spot_surfaceToLight));
            if(spot_light_power <0.0)
            {
                spot_light_power = 0.0;
            }
        }
        vec4 tempColor = texture(sampler, v_texcoord);
        if (tempColor.w < 1.0) {
            discard;
        }

        finalLightContrib += spot_light_power;
        fragColor = vec4(tempColor.xyz * finalLightContrib,1);        
    }`

    createShader(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

        if (success) {
            return shader;
        }

        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    createProgram(vs, fs) {
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
}