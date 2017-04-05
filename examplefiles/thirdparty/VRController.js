/*


	THREE.VRController




	Why is this useful?
	1. This creates a THREE.Object3D() per gamepad and passes it to you
	through an event for inclusion in your scene. It then handles copying the
	live positions and orientations from the gamepad to this Object3D.
	2. It also broadcasts button events to you on the Object3D instance.
	For supported devices button names are mapped to the buttons array when
	possible for convenience. (And this support is easy to extend.)

	What do I have to do?
	1. Include THREE.VRController.update() in your animation loop and listen
	for the appropriate events.
	2. When you receive a controller instance -- again, just an Object3D --
	you ought to set its standingMatrix property to equal your
	controls.getStandingMatrix() and if you are expecting 3DOF controllers set
	its head property equal to your camera.


*/




THREE.VRController = function( gamepad ){

	THREE.Object3D.call( this )
	this.matrixAutoUpdate = false


	//  These are special properties you ought to overwrite on the instance
	//  in your own code. For example:
	//    controller.standingMatrix = controls.getStandingMatrix()
	//    controller.head = camera//  Only really needed if controller is 3DOF.

	this.standingMatrix = new THREE.Matrix4()
	this.head = {

		position:   new THREE.Vector3(),
		quaternion: new THREE.Quaternion()
	}


	//  Do we recognize this type of controller based on its gamepad.id string?
	//  If not we’ll still roll with it, just the buttons won’t be mapped.

	const supported = THREE.VRController.supported[ gamepad.id ]
	let style, buttonNames = [], primaryButtonName
	if( supported !== undefined ){

		style = supported.style
		buttonNames = supported.buttons
		primaryButtonName = supported.primary
	}


	//  It is crucial that we have a reference to the actual gamepad!
	//  In addition to requiring its .pose for position and orientation
	//  updates, it also gives us all the goodies like .id, .index,
	//  and maybe best of all... haptics!
	//  We’ll also add style and DOF here but not onto the actual gamepad
	//  object because that’s the browser’s territory.

	this.gamepad      = gamepad
	this.gamepadStyle = style
	this.gamepadDOF   = null//  Have to wait until gamepad.pose is defined to handle this.
	this.name         = gamepad.id


	//  Setup axes and button states so we can watch for change events.
	//  If we have english names for these buttons that’s great.
	//  If not... We’ll just roll with it because trying is important :)

	const
	axes    = [ 0, 0 ],
	buttons = []

	gamepad.buttons.forEach( function( button, i ){

		buttons[ i ] = {

			name:      buttonNames[ i ] !== undefined ? buttonNames[ i ] : 'button_'+ i,
			value:     button.value,
			isTouched: button.touched,
			isPressed: button.pressed
		}
	})

	this.getButtonByName = function( name ){
		return buttons.find( function( button ){
			return button.name === name;
		});
	}

	this.listenForButtonEvents = function(){

		const
		verbosity  = THREE.VRController.verbosity,
		controller = this

		const prefix = '> #'+ controller.gamepad.index +' '+ controller.gamepad.id +' ('+ controller.gamepad.hand +') '
		if( axes[ 0 ] !== gamepad.axes[ 0 ] || axes[ 1 ] !== gamepad.axes[ 1 ]){

			axes[ 0 ] = gamepad.axes[ 0 ]
			axes[ 1 ] = gamepad.axes[ 1 ]
			if( verbosity >= 0.5 ) console.log( prefix +'axes changed', axes )
			controller.dispatchEvent({ type: 'axes changed', axes: axes })

			// if( controller.gamepadStyle === 'vive' ){

				//============== MOVE THUMB ON TRACKPAD ==================//

			// 	var posX = mapRange(axes[ 0 ], -1, 1, 0.019, -0.019) //0.019 / -0.019 are values specified in the SteamVR json file
			// 	var posZ = mapRange(axes[ 1 ], -1, 1, -0.019, 0.019)

			// 	var trackpadTouch = controller.children[0].getObjectByName( "trackpad_touch" ).children[ 0 ];
			// 		trackpadTouch.position.x = posX;
			// 		trackpadTouch.position.z = posZ;

			// 	// not sure how I can get the trackpad in in easier way here
			// 	var trackpad = buttons.filter(function( btn ) {return btn.name == 'trackpad';})[0];

			// 	if(trackpad.isPressed) {

			// 		var rotX = mapRange(axes[ 0 ], -1, 1, -7, 7); // -7 / 7 and -4 / 4 are values specified in the SteamVR json file
			// 		var rotZ = mapRange(axes[ 1 ], -1, 1, -4, 4);

			// 		var trackpadPivot = controller.children[0].getObjectByName( "trackpad_pivot");
			// 			trackpadPivot.position.y = 0.001;
			// 			trackpadPivot.rotation.z = rotX * Math.PI / 180;
			// 			trackpadPivot.rotation.x = rotZ * Math.PI / 180;
			// 	}

			// } else if( controller.gamepadStyle === 'rift' ){

			// 	var rotX = mapRange(axes[ 0 ], -1, 1, -20, 20); // -7 / 7 and -4 / 4 are values specified in the SteamVR json file
			// 	var rotZ = mapRange(axes[ 1 ], -1, 1, 20, -20);

			// 	var thumbstickPivot = controller.children[0].getObjectByName( "thumbstick_pivot");

			// 	if(controller.gamepad.hand == 'left') {

			// 			thumbstickPivot.rotation.z = rotX * Math.PI / 180;
			// 			thumbstickPivot.rotation.x = rotZ * Math.PI / 180;

			// 	} else if(controller.gamepad.hand == 'right') {

			// 			thumbstickPivot.rotation.z = rotX * Math.PI / 180;
			// 			thumbstickPivot.rotation.x = rotZ * Math.PI / 180;

			// 	}

			// }

		}
		buttons.forEach( function( button, i ){

			const
			prefixFull = prefix + button.name +' ',
			isPrimary  = button.name === primaryButtonName ? ' isPrimary!' : ''

			if( button.value !== gamepad.buttons[ i ].value ){

				button.value = gamepad.buttons[ i ].value
				if( verbosity >= 0.5 ) console.log( prefixFull +'value changed'+ isPrimary, button.value )
				controller.dispatchEvent({ type: button.name  +' value changed', value: button.value })
				if( isPrimary !== '' ) controller.dispatchEvent({ type: 'primary value changed', value: button.value })

				//============== MOVE ALL OTHER BUTTONS ===================//
				// if( controller.gamepadStyle === 'vive' ){

				// 	if(button.name == 'trigger') {

				// 		button.mappedValue = mapRange(button.value, 0, 1, 0, 17);
				// 		controller.children[0].getObjectByName( button.name + "_pivot").rotation.x = button.mappedValue * Math.PI / 180;

				// 	} else if(button.name == 'grips') {

				// 		controller.children[0].getObjectByName( "lgrip_pivot").rotation.y = - button.value * 2 *  Math.PI / 180;
				// 		controller.children[0].getObjectByName( "rgrip_pivot").rotation.y =  button.value * 2 * Math.PI / 180;

				// 	} else if(button.name == 'menu') {

				// 		button.mappedValue = mapRange(button.value, 0, 1, 0, 0.00075);
				// 		controller.children[0].getObjectByName( 'button' ).position.y = - button.mappedValue;

				// 	}

				// } else if( controller.gamepadStyle === 'rift' ){

				// 	if(button.name == 'thumbstick') {

				// 		// controller.children[0].getObjectByName( "thumbstick_pivot").children[0].position.y = -0.003317;
				// 		// thumbstickPivot.position.z = 0.000386;

				// 	} else if(button.name == 'trigger') {

				// 		button.mappedValue = mapRange(button.value, 0, 1, 0, 17);
				// 		controller.children[0].getObjectByName( button.name + "_pivot").rotation.x = button.mappedValue * Math.PI / 180;

				// 	} else if(button.name == 'grip') {

				// 		button.mappedValue = mapRange(button.value, 0, 1, 0, 12);

				// 		if(controller.gamepad.hand == 'left') {

				// 			controller.children[0].getObjectByName( "grip_pivot").rotation.y = - button.mappedValue *  Math.PI / 180;

				// 		} else if(controller.gamepad.hand == 'right') {

				// 			controller.children[0].getObjectByName( "grip_pivot").rotation.y = button.mappedValue *  Math.PI / 180;

				// 		}

				// 	} else if(button.name == 'A') {

				// 		button.mappedValue = mapRange(button.value, 0, 1, 0, 0.00085);
				// 		controller.children[0].getObjectByName( 'a_button' ).children[0].position.y = - button.mappedValue;

				// 	} else if(button.name == 'B') {

				// 		button.mappedValue = mapRange(button.value, 0, 1, 0, 0.00085);
				// 		controller.children[0].getObjectByName( 'b_button' ).children[0].position.y = - button.mappedValue;

				// 	} else if(button.name == 'X') {

				// 		button.mappedValue = mapRange(button.value, 0, 1, 0, 0.00085);
				// 		controller.children[0].getObjectByName( 'x_button' ).children[0].position.y = - button.mappedValue;

				// 	} else if(button.name == 'Y') {

				// 		button.mappedValue = mapRange(button.value, 0, 1, 0, 0.00085);
				// 		controller.children[0].getObjectByName( 'y_button' ).children[0].position.y = - button.mappedValue;
				// 	}
				// }

			}
			if( button.isTouched !== gamepad.buttons[ i ].touched ){

				button.isTouched = gamepad.buttons[ i ].touched
				const suffix = ' ' + ( button.isTouched ? 'began' : 'ended' )
				if( verbosity >= 0.5 ) console.log( prefixFull +'touch'+ suffix + isPrimary )
				controller.dispatchEvent({ type: button.name  +' touch'+ suffix })
				if( isPrimary !== '' ) controller.dispatchEvent({ type: 'primary touch'+ suffix })

				//============== SHOW HIDE THUMB ON TRACKPAD ===================//

				// if( controller.gamepadStyle === 'vive' ){

				// 	if(button.name == 'trackpad') {

				// 		if(button.isTouched){

				// 			controller.children[0].getObjectByName( "trackpad_touch").visible = true
				// 		} else {

				// 			controller.children[0].getObjectByName( "trackpad_touch").visible = false
				// 		}

				// 	}

				// }
			}
			if( button.isPressed !== gamepad.buttons[ i ].pressed ){

				button.isPressed = gamepad.buttons[ i ].pressed
				const suffix = ' ' + ( button.isPressed ? 'began' : 'ended' )
				if( verbosity >= 0.5 ) console.log( prefixFull +'press'+ suffix + isPrimary )
				controller.dispatchEvent({ type: button.name  +' press'+ suffix })
				if( isPrimary !== '' ) controller.dispatchEvent({ type: 'primary press'+ suffix })

				//=================RELEASE TRACKPAD BUTTON =====================//

				if( controller.gamepadStyle === 'vive' ){

					if(button.name == 'trackpad'){

						var trackpadPivot = controller.children[0].getObjectByName( "trackpad_pivot");
							trackpadPivot.position.y = 0.002;
							trackpadPivot.rotation.set( 0, 0, 0 );
					}

				} else if( controller.gamepadStyle === 'rift' ){

					if(button.name == 'thumbstick'){

						// var thumbstickPivot = controller.children[0].getObjectByName( "thumbstick_pivot").children[0];
						// 	thumbstickPivot.position.y = 0;
					}
				}

			}
		})
	}
	this.getButtonState = function( buttonName ){

		return buttons.find( function( button ){

			return button.name === buttonName
		})
	}

}
THREE.VRController.prototype = Object.create( THREE.Object3D.prototype )
THREE.VRController.prototype.constructor = THREE.VRController

function mapRange(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

//  Update the position, orientation, and button states,
//  fire button events if nessary.

THREE.VRController.prototype.update = function(){

	const
	gamepad = this.gamepad,
	pose = gamepad.pose


	//  Once connected a gamepad will have a not-undefined pose
	//  but that pose will be null until a user action ocurrs.
	//  If it’s all null then no point in going any futher here.

	if( pose === null || ( pose.orientation === null && pose.position === null )) return


	//  If we’ve gotten to here then gamepad.pose has a definition
	//  so now we can set a convenience variable to know if we are 3DOF or 6DOF.

	this.gamepadDOF = ( +gamepad.pose.hasOrientation + +gamepad.pose.hasPosition ) * 3


	//  ORIENTATION. Do we have data for this?
	//  If so let’s use it. If not ... no fallback plan.

	if( pose.orientation !== null ) this.quaternion.fromArray( pose.orientation )


	//  POSITION -- EXISTS!
	//  If we’ve got it then we’ll assume we have orientation too; 6 Degrees Of Freedom (6DOF).

	if( pose.position !== null ){

		this.position.fromArray( pose.position )
		this.matrix.compose( this.position, this.quaternion, this.scale )
	}


	//  POSITION -- NOPE ;(
	//  But if we don’t have position data we’ll assume 3 Degrees Of Freedom (3DOF),
	//  and use an arm model that takes head position and orientation into account.

	else {


		//  If this is our first go-round with a 3DOF this then we’ll need to
		//  create the arm model.

		if( this.armModel === undefined ) this.armModel = new OrientationArmModel()


		//  Now and forever after we can just update this arm model
		//  with the head (camera) position and orientation
		//  and use its output to predict where the this is.

		this.armModel.setHeadPosition( this.head.position )
		this.armModel.setHeadOrientation( this.head.quaternion )
		this.armModel.setControllerOrientation(( new THREE.Quaternion() ).fromArray( pose.orientation ))
		this.armModel.update()
		this.matrix.compose(

			this.armModel.getPose().position,
			this.armModel.getPose().orientation,
			this.scale
		)
	}


	//  Ok, we know where the this ought to be so let’s set that.

	this.matrix.multiplyMatrices( this.standingMatrix, this.matrix )
	this.matrixWorldNeedsUpdate = true


	//  BUTTON EVENTS.

	this.listenForButtonEvents()
}




    /////////////////
   //             //
  //   Statics   //
 //             //
/////////////////


//  This makes inspecting through the console a little bit saner.

THREE.VRController.verbosity = 0.5


//  This is what makes everything so convenient. We keep track of found
//  controllers right here. And by adding this one update function into your
//  animation loop we automagically update all the controller positions,
//  orientations, and button states.

THREE.VRController.controllers = {}
THREE.VRController.hasGamepadEvents = 'ongamepadconnected' in window
THREE.VRController.scanGamepads = function(){

	const gamepads = navigator.getGamepads()
	for( let i = 0; i < gamepads.length; i ++ ){

		const gamepad = gamepads[ i ]
		if( gamepad !== null && this.controllers[ gamepad.index ] === undefined ){

			THREE.VRController.onGamepadConnect( gamepad )
		}
	}
}


//  These event listeners track gamepads connecting and disconnecting,
//  create controller instances, and add them to our controllers array
//  so that THREE.VRController.update can update them all in one go.

THREE.VRController.onGamepadConnect = function( gamepad ){


	//  Let’s create a new controller object
	//  that’s really an extended THREE.Object3D
	//  and pass it a reference to this gamepad.

	const
	scope = THREE.VRController,
	controller = new scope( gamepad )


	//  We also need to store this reference somewhere so that we have a list
	//  controllers that we know need updating, and by using the gamepad.index
	//  as the key we also know which gamepads have already been found.

	scope.controllers[ gamepad.index ] = controller


	//  Let’s give the controller a little rumble; some haptic feedback to
	//  let the user know it’s connected and happy.

	if( controller.gamepad.haptics ) controller.gamepad.haptics[ 0 ].vibrate( 0.25, 500 )


	//  Now we’ll broadcast a global connection event.
	//  We’re not using THREE’s dispatchEvent because this event
	//  is the means of delivering the controller instance.
	//  How would we listen for events on the controller instance
	//  if we don’t already have a reference to it?!

	if( scope.verbosity >= 0.5 ) console.log( 'vr controller connected', controller )
	window.dispatchEvent( new CustomEvent( 'vr controller connected', { detail: controller }))
}
window.addEventListener( 'gamepadconnected', function( event ){

	THREE.VRController.onGamepadConnect( event.gamepad )
})


THREE.VRController.onGamepadDisconnect = function( gamepad ){


	//  We need to find the controller that holds the reference to this gamepad.

	const
	scope = THREE.VRController,
	controller = scope.controllers[ gamepad.index ]


	//  Now we can broadcast the disconnection event on the controller itself
	//  and also delete from our controllers object. Goodbye!

	if( scope.verbosity >= 0.5 ) console.log( 'vr controller disconnected', controller )
	controller.dispatchEvent({ type: 'disconnected', controller: controller })
	delete controller
}
window.addEventListener( 'gamepaddisconnected', function( event ){

	THREE.VRController.onGamepadDisconnect( event.gamepad )
})


THREE.VRController.update = function(){

	const scope = this

	if( this.hasGamepadEvents === false ) THREE.VRController.scanGamepads()
	Object.keys( this.controllers ).forEach( function( controllerKey ){

		scope.controllers[ controllerKey ].update()
	})
}




    /////////////////
   //             //
  //   Support   //
 //             //
/////////////////


//  Let’s take an ID string as reported directly from the gamepad API,
//  translate that to a more generic “style name”
//  and also see if we can’t map some names to the buttons!

THREE.VRController.supported = {

	'Daydream Controller': {

		style: 'daydream',


		//  Daydream’s thumbpad is both a 2D trackpad and a button.
		//  X axis: -1 = Left, +1 = Right
		//  Y axis: -1 = Top,  +1 = Bottom  NOTE THIS IS FLIPPED FROM VIVE!

		buttons: [ 'thumbpad' ],
		primary: 'thumbpad'
	},
	'OpenVR Gamepad': {

		style: 'vive',
		buttons: [


			//  Vive’s thumpad is both a 2D trackpad and a button. We can
			//  1. touch it -- simply make contact with the trackpad (binary)
			//  2. press it -- apply force to depress the button (binary)
			//  3. get XY values for the point of contact on the trackpad.
			//  X axis: -1 = Left,   +1 = Right
			//  Y axis: -1 = Bottom, +1 = Top

			'trackpad',


			//  Vive’s trigger offers a binary touch and a
			//  gradient of “pressed-ness” values from 0.0 to 1.0.
			//  Here’s my best guess at the trigger’s internal rules:
			//  if( value > 0.00 ) touched = true else touched = false
			//  if( value > 0.51 ) pressed = true   THRESHOLD FOR TURNING ON
			//  if( value < 0.45 ) pressed = false  THRESHOLD FOR TURNING OFF

			'trigger',


			//  Each Vive controller has two grip buttons, one on the left and one on the right.
			//  They are not distinguishable -- pressing either one will register as a press
			//  with no knowledge of which one was pressed.
			//  This value is binary, it is either touched/pressed (1) or not (0)
			//  so no need to track anything other than the pressed boolean.

			'grips',


			//  The menu button is the tiny button above the thumbpad (NOT the one below it).
			//  It’s simple; just a binary on / off press.

			'menu'
		],
		primary: 'trigger'
	},
	'Oculus Touch (Right)': {

		style: 'rift',
		buttons: [


			//  Rift’s thumbstick has axes values and is also a button,
			//  similar to Vive’s thumbpad.
			//  But unlike Vive’s thumbpad it only has a binary touch value.
			//  The press value is never set to true.
			//  X axis: -1 = Left, +1 = Right
			//  Y axis: -1 = Top,  +1 = Bottom  NOTE THIS IS FLIPPED FROM VIVE!

			'thumbstick',


			//  Rift’s trigger is twitchier than Vive’s.
			//  Compare these threshold guesses to Vive’s trigger:
			//  if( value > 0.1 ) pressed = true   THRESHOLD FOR TURNING ON
			//  if( value < 0.1 ) pressed = false  THRESHOLD FOR TURNING OFF

			'trigger',


			//  Rift’s grip button follows the exact same pattern as the trigger.

			'grip',


			//  Rift has two old-school video game buttons, A and B.
			// (For the left-hand controller these are X and Y.)
			//  They report separate binary on/off values for both touch and press.

			'A', 'B',


			//  Rift has an inert base “button” that’s really just a resting place
			//  for your thumbs and only reports a binary on/off for touch.

			'thumbrest'
		],
		primary: 'trigger'
	},
	'Oculus Touch (Left)': {

		style: 'rift',
		buttons: [

			'thumbstick',
			'trigger',
			'grip',
			'X', 'Y',
			'thumbrest'
		],
		primary: 'trigger'
	}
}


