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
        dae.scale.x = dae.scale.y = dae.scale.z = 1 ;
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

  const thumbstick = model.getObjectByName( 'thumbstick' );
  const thumbstickPivot = model.getObjectByName( 'thumbstick_pivot' );
  const triggerPivot = model.getObjectByName( 'trigger_pivot' );
  const gripPivot = model.getObjectByName( 'grip_pivot' );

  if(controller.gamepad.hand == 'left') {
    var xButton = model.getObjectByName( 'x_button' ).children[ 0 ];
    var yButton = model.getObjectByName( 'y_button' ).children[ 0 ];

  } else if(controller.gamepad.hand == 'right') {
    var aButton = model.getObjectByName( 'a_button' ).children[ 0 ];
    var bButton = model.getObjectByName( 'b_button' ).children[ 0 ];
  }

  const baseCol = new THREE.Color(0x666666);
  const touchCol = new THREE.Color(0x6666ff);

  return {
    'thumbstick touch began': function(){
      thumbstick.children[0].material.color = touchCol;
    },
    'thumbstick touch ended': function(){
      thumbstick.children[0].material.color = baseCol;
    },
    'axes changed': function( { axes } ){

      const rotX = mapRange(axes[ 1 ], -1, 1, -20, 20);
      const rotZ = mapRange(axes[ 0 ], 1, -1, -20, 20);

      thumbstickPivot.rotation.x = - rotX * TO_RADIANS;
      thumbstickPivot.rotation.z = - rotZ * TO_RADIANS;
    },
    //can't add this yet. The event doesn't get fired

    // 'trigger touch began': function(){      
    //   trigger.material.color = touchCol;
    // },
    // 'trigger touch ended': function(){      
    //   trigger.material.color = baseCol;
    // },
    'trigger value changed': function( { value } ){
      const mapped = mapRange( value, 0, 1, 0, 17);
      triggerPivot.rotation.x = mapped * TO_RADIANS;
    },
    //can't add this yet. The event doesn't get fired

    // 'grip touch began': function(){      
    //   grip.material.color = touchCol;
    // },
    // 'grip touch ended': function(){      
    //   grip.material.color = baseCol;
    // },
    'grip value changed': function( { value } ){
      const mapped = mapRange( value, 0, 1, 0, 12);
      if(controller.gamepad.hand == 'left') {
        gripPivot.rotation.y = - mapped * TO_RADIANS;
      } else if(controller.gamepad.hand == 'right') {
        gripPivot.rotation.y = mapped * TO_RADIANS;
      }
    },
    'A touch began': function(){      
      aButton.material.color = touchCol;
    },
    'A touch ended': function(){      
      aButton.material.color = baseCol;
    },
    'A value changed': function( { value } ){      
      const mapped = mapRange(value, 0, 1, 0, 0.00085);
      aButton.position.y = -mapped; 
    },
    'B touch began': function(){      
      bButton.material.color = touchCol;
    },
    'B touch ended': function(){      
      bButton.material.color = baseCol;
    },
    'B value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 0.00085);
      bButton.position.y = -mapped;
    },
    'X touch began': function(){      
      xButton.material.color = touchCol;
    },
    'X touch ended': function(){      
      xButton.material.color = baseCol;
    },
    'X value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 0.00085);
      xButton.position.y = -mapped;
    },
    'Y touch began': function(){      
      yButton.material.color = touchCol;
    },
    'Y touch ended': function(){      
      yButton.material.color = baseCol;
    },
    'Y value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 0.00085);
      yButton.position.y = -mapped;
    }
  }
}