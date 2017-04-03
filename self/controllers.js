



    /////////////////////
   //                 //
  //   Controllers   //
 //                 //
/////////////////////


//  This is the only thing you need to do to add controller support:
//  Call THREE.VRController’s update() function within your update loop.
//  That’s all! It will detect new controllers, update the positions
//  and rotations of existing ones, and alert you if one disconnects.

updateTasks.add( THREE.VRController.update.bind( THREE.VRController ))


//  We have to catch an instance of the controller on the global window
//  object first, then we can listen in for all future events on the 
//  controller instance itself. 

window.addEventListener( 'vr controller connected', function( event ){


	//  And here’s that controller instance we’ve been waiting for:

	const controller = event.detail


	//  First things first. We set the standing matrix based on our
	//  THREE control’s standing matrix. 
	//  Then we’ll add a reference to our camera -- this will only
	//  be used if our controller is 3DOF instead of 6DOF.
	//  Then add this controller (a glorified Object3D) to our scene. 

	controller.standingMatrix = window.controls.getStandingMatrix()
	controller.head = window.camera
	scene.add( controller )


	//  Do we have a DAT GUI VR panel available?
	//  If so, let’s allow controller interaction with it!

	let guiHook
	if( window.dat !== undefined && window.dat.GUIVR !== undefined ){

		guiHook = dat.GUIVR.addInputObject( controller )
		scene.add( guiHook )
	}
	

	//  Here on stage for the first time in New York City 
	//  is VRController, in the style of... [controller.gamepadStyle]

	if( controller.gamepadStyle === 'daydream' ){

		const
		textureLoader = new THREE.TextureLoader(),
		texture = textureLoader.load( 'other/VRControllers/Daydream/daydream_diffuse.png' ),
		loader = new THREE.JSONLoader()
		loader.load( 'other/VRControllers/Daydream/daydream.json', function( geometry ){

			const mesh = new THREE.Mesh( 

				geometry,
				new THREE.MeshStandardMaterial({
				
					map: texture, 
					color: 0x666666, 
					metalness: 0,
					roughness: 0.6
				})
			)
			mesh.name = 'Daydream controller'
			mesh.castShadow = true
			mesh.receiveShadow = true
			controller.add( mesh )
		})


		//  We’re running on a phone, not a full blown gaming PC. 
		//  Killing the shadow maps will help keep the FPS up.
		//  https://github.com/mrdoob/three.js/issues/1055

		renderer.shadowMap.autoUpdate = false
		renderer.shadowMap.enabled = false
		floor.receiveShadow = false
		renderer.clearTarget( mainLight.shadowMap )
	}
	else if( controller.gamepadStyle === 'vive' ){

		let loader = new THREE.ColladaLoader();
			loader.options.convertUpAxis = true;

		loader.load( 'other/VRControllers/Vive/vive_controller.dae', function ( collada ) {
				
			dae = collada.scene;

			//some collada import fixes
			dae.scale.x = dae.scale.y = dae.scale.z = 1;
			dae.rotation.y = Math.PI;

			//hide scrolling wheel
			dae.getObjectByName( "trackpad_scroll_cut").visible = false;
			//hide thumb cursos
			dae.getObjectByName( "trackpad_touch").visible = false;

 			dae.traverse ( function (child) {
				if (child instanceof THREE.Mesh) {
			    	child.castShadow = true;

	        		// even a 4k shadowmap looks bad 
					// child.receiveShadow = true

					child.material.color = new THREE.Color(0.8,0.8,0.8);
					child.material.specular = new THREE.Color(0.19, 0.19, 0.19);
					child.material.shininess = 20;
					child.material.side = THREE.DoubleSide;
				}
			})

			var rightLabel = dae.getObjectByName( "rstatus").children[0];
			var leftLabel = dae.getObjectByName( "lstatus").children[0];

			//this works only if when the page is loaded, both controllers are already on
			if(controller.gamepad.hand == 'left') {

				rightLabel.visible = false;
				leftLabel.material.alphaMap = leftLabel.material.map;
				leftLabel.material.transparent = true;

			} else if(controller.gamepad.hand == 'right') {
				
				leftLabel.visible = false;
				rightLabel.material.alphaMap = rightLabel.material.map;
				rightLabel.material.transparent = true;
			
			} else {
				leftLabel.visible = rightLabel.visible = false;
			}
			
			controller.add( dae );
		});

	}
	else if( controller.gamepadStyle === 'rift' ){

		let loader = new THREE.ColladaLoader();
			loader.options.convertUpAxis = true;
				
		let path  = 'other/VRControllers/Rift/';
		let filename;

		if(controller.gamepad.hand == 'left') {

			fileName = 'oculus_cv1_controller_left.dae';

		}  else if (controller.gamepad.hand == 'right') {
			
			fileName = 'oculus_cv1_controller_right.dae';

		}

		loader.load( path + filaName, function ( collada ) {

			dae = collada.scene;

			//some collada fixes
			dae.scale.x = dae.scale.y = dae.scale.z = 1;
			dae.rotation.y = Math.PI;
			dae.rotation.x = 50.6 * Math.PI / 180;
				
			dae.position.copy( new THREE.Vector3(0.0055,0.04, -0.03) );

			let loader = new THREE.TextureLoader();
			loader.setPath( 'other/VRControllers/Rift/' );

			dae.traverse ( function (child) {

			    if (child instanceof THREE.Mesh) {
			    	child.castShadow = true;
		     	
		        	// 4k shadowmap looks bad 
					// child.receiveShadow = true
					child.material.color = new THREE.Color(0.4,0.4,0.4);
					child.material.specular = new THREE.Color(0.06, 0.06, 0.06);

					child.material.shininess = 20;
					child.material.side = THREE.DoubleSide;
					child.material.map = loader.load( 'oculus_cv1_controller_col.png' );
					child.material.specularMap = loader.load( 'oculus_cv1_controller_spec.png' );
				}
		   	})

			controller.add( dae );
		})
	}


	//  This will work on every controller’s primary button!

	controller.addEventListener( 'primary press began', function(){

		controller.bubble = new Bubble( this )
		controller.add( this.bubble )
		if( controller.gamepad.hapticActuators ) controller.gamepad.hapticActuators[ 0 ].pulse( 0.3, 200 )
		if( guiHook ) guiHook.pressed( true )
	})
	controller.addEventListener( 'primary press ended', function(){

		controller.bubble.release()
		//if( controller.gamepad.hapticActuators ) controller.gamepad.hapticActuators[ 0 ].pulse( 0.1, 50 )
		if( guiHook ) guiHook.pressed( false )
	})


	//  If the controller dissappers we should too.
	//  We could probably do something more efficient than simply set it to invisible
	//  but this is just for illustration purposes, right? ;)

	controller.addEventListener( 'disconnected', function(){

		controller.visible = false
	})
})



