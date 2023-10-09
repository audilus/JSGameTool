//Fragment shaders do not have precision so we have to set it.
            precision mediump float;
		    varying vec3 v_color;
            varying vec3 fakenormal;
            varying vec3 v_surfaceToLight;
            varying vec3 v_surfaceToLights[6];
            varying vec3 v_surfaceToView;
            varying vec3 v_spot_surfaceToLight;

            varying vec4 v_WorldSpace;
            
            const int NUM_LIGHTS = 32;
            
            varying vec3 vPointLightPositions[NUM_LIGHTS];
            varying vec3 vPointLightColor[NUM_LIGHTS];


		    void main()
		    {
                
                float ambient = .10;	

                vec3 finalLightContrib;
                finalLightContrib = vec3(finalLightContrib + ambient);

                vec3 pointContribution;
                for (int i = 0; i < NUM_LIGHTS; i++){
                    float p_light = dot(normalize(fakenormal),normalize(vPointLightPositions[i]))*2.0/length(vPointLightPositions[i]);
                    // vec3 p_light_color = vPointLightColor[i];
                    if(p_light <0.0)
                    {
                        p_light = 0.0;
                    }
                    pointContribution += p_light * vec3(1.0, 0.5, 0.5);
                }
                
                // finalLightContrib += pointContribution;
			    
                // float d_light = .25 * dot(normalize(fakenormal),normalize(vec3(20.0,5.0,20.0)));
                // if (d_light < 0.0)
                // {
                //     d_light = 0.0;
                // }
                
                // finalLightContrib = finalLightContrib + d_light;
                // float pointContribution = 0.0;
                // for (int i = 0; i < 6; i++){
                //     float p_light = dot(normalize(fakenormal),normalize(v_surfaceToLights[i]))*2.0/length(v_surfaceToLights[i]);
                //     if(p_light <0.0)
                //     {
                //         p_light = 0.0;
                //     }
                //     pointContribution += p_light;
                // }
                finalLightContrib += pointContribution + d_light;
                gl_FragColor = vec4(v_color * finalLightContrib, 1);
                // finalLightContrib = finalLightContrib + vec4( v_color*(d_light),1);

                
                /*float spot_light = dot(normalize(v_spot_surfaceToLight),vec3(1,0,0));//- light dir;
                if(spot_light >= .98)
                {
                    spot_light_power = dot(normalize(fakenormal),normalize(v_spot_surfaceToLight));
                    if(spot_light_power <0.0)
                    {
                        spot_light_power = 0.0;
                    }
                }
                gl_FragColor = vec4(v_color*(spot_light_power),1);*/
                
                //gl_FragColor = vec4(v_color * finalLightContrib, 1) ;
		    }