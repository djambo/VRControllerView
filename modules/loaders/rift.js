import { mapRange, bindAnimations } from '../animation';

export function load( {
  modelLeftPath,
  modelRightPath,
  color,
  specular,
  shininess,
  diffusePath,
  specularPath }, controller ){

  let loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;

  const hand = controller.gamepad.hand;

  if( hand === undefined ){
    return new Promise();
  }


  let modelPath;

  if( hand == 'left') {
    modelPath = modelLeftPath;
  } else if ( hand == 'right') {
    modelPath = modelRightPath;
  }

  if( modelPath ){

    return new Promise( function( resolve, reject ){
      loader.load( modelPath, function ( collada ) {

        const dae = collada.scene;

        //some collada fixes
        dae.scale.x = dae.scale.y = dae.scale.z = 1;
        dae.rotation.y = Math.PI;
        dae.rotation.x = 50.6 * TO_RADIANS;

        dae.position.copy( new THREE.Vector3(0.0055,0.04, -0.03) );

        let textureLoader = new THREE.TextureLoader();

        dae.traverse ( function (child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.material.color = new THREE.Color().setStyle( color );
            child.material.specular = new THREE.Color().setStyle( specular );
            child.material.shininess = shininess;
            child.material.side = THREE.DoubleSide;
            child.material.map = textureLoader.load( diffusePath );
            child.material.specularMap = textureLoader.load( specularPath );
          }
        });

        bindAnimations( controller, generateBindings( controller, dae ) );
        resolve( dae );

      });
    });

  }

}

const TO_RADIANS = Math.PI / 180;

function generateBindings( controller, model ){

  // const triggerPivot = model.getObjectByName( 'trigger_pivot' );
  const triggerPivot = controller.children[0].getObjectByName( 'trigger_pivot' );

  const thumbstickPivot = model.getObjectByName( 'thumbstick_pivot' );
  const triggerPivot = model.getObjectByName( 'trigger_pivot' );
  const gripPivot = model.getObjectByName( 'grip_pivot' );

  if(controller.gamepad.hand == 'left') {
    
    const xButton = model.getObjectByName( 'x_button' );
    const yButton = model.getObjectByName( 'y_button' );

  } else if(controller.gamepad.hand == 'right') {
  
    const aButton = model.getObjectByName( 'a_button' );
    const bButton = model.getObjectByName( 'b_button' );
  
  }

  return {
    //ADD TOUCH DETECTION TO ALL THE BUTTONS??
    // 'trackpad touch began': function(){
    //   trackpadTouch.visible = trackpad.isTouched;
    // },
    // 'trackpad touch ended': function(){
    //   trackpadTouch.visible = trackpad.isTouched;
    // },
    'axes changed': function( { axes } ){

       const rotX = mapRange(axes[ 0 ], -1, 1, -20, 20); // -7 / 7 and -4 / 4 are values specified in the SteamVR json file
       const rotZ = mapRange(axes[ 1 ], -1, 1, 20, -20);

       // if(controller.gamepad.hand == 'left') {

       //     thumbstickPivot.rotation.z = rotX * TO_RADIANS;
       //     thumbstickPivot.rotation.x = rotZ * TO_RADIANS;

       // } else if(controller.gamepad.hand == 'right') {

           thumbstickPivot.rotation.z = rotX * TO_RADIANS;
           thumbstickPivot.rotation.x = rotZ * TO_RADIANS;

       // }

    },
    'trigger value changed': function( { value } ){
      const mapped = mapRange( value, 0, 1, 0, 17);
      triggerPivot.rotation.x = mapped * TO_RADIANS;
    },
    'grip value changed': function( { value } ){
      const mapped = mapRange( value, 0, 1, 0, 12);
      
      if(controller.gamepad.hand == 'left') {

        gripPivot.rotation.y = - mapped * TO_RADIANS;

      } else if(controller.gamepad.hand == 'right') {
      
        gripPivot.rotation.y = mapped * TO_RADIANS;
      
      }
    },
    'A value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 0.00085);
      aButton.position.y = -mapped;
    },
    'B value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 0.00085);
      bButton.position.y = -mapped;
    },
    'X value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 0.00085);
      xButton.position.y = -mapped;
    },
    'Y value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 0.00085);
      yButton.position.y = -mapped;
    }
  }
}