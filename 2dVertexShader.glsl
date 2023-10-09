        attribute vec4 a_position;	
        attribute vec3 a_color;
        varying vec3 v_color;
        
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

        varying vec3 fakenormal;
        varying vec3 v_surfaceToLight;
        varying vec3 v_surfaceToView;
        varying vec3 v_spot_surfaceToLight;
		    
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
        varying vec3 v_surfaceToLights[6];
        varying vec4 worldSpace;
        // uniform vec3 u_pointLightPositions[256];
        // varying vec3 v_pointLightPositions[256];

        uniform bool u_pointLightCount[256];
        
        void main()
        {
            //  This check is just to handle our ground plane's normals
            if(length(a_position) < 5.0){
                fakenormal = RotateObject(a_position).xyz;
            }
            else {
                fakenormal = vec3(0.0, 1.0, 0.0);
            }

            worldSpace = PositionObject(RotateObject(a_position));

            //Lighting
            
            //  TODO: Pass in a uniform of all lights in the world
                                /* Light position */
            // v_surfaceToLight = vec3(0.0, 1.0, -5.0) - worldSpace.xyz;
            v_surfaceToLights[0] = vec3(0.0, 1.0, -15.0) - worldSpace.xyz;
            v_surfaceToLights[1] = vec3(10, 1.0, -15.0) - worldSpace.xyz;
            v_surfaceToLights[2] = vec3(20.0, 1.0, -15.0) - worldSpace.xyz;
            v_surfaceToLights[3] = vec3(30.0, 1.0, -15.0) - worldSpace.xyz;
            v_surfaceToLights[4] = vec3(40.0, 1.0, -15.0) - worldSpace.xyz;
            v_surfaceToLights[5] = vec3(50.0, 1.0, -15.0) - worldSpace.xyz;
            // v_surfaceToView = cameraLoc - worldSpace.xyz;
                                    /* Light position */
            v_spot_surfaceToLight - vec3(5.0, 0.0, -2.0) - worldSpace.xyz;

            gl_PointSize = 10.0;
            v_color = a_color;

            //Now the final gl_Position will be the world space coordinates.
            gl_Position=ApplyProjection(MoveCamera(PositionObject(RotateObject(ScaleObject(a_position)))));
        }