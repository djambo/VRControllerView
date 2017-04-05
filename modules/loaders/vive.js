import { mapRange, bindAnimations } from '../animation';

export function load( { modelPath, color, specular, shininess }, controller ){
  let loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;

  return new Promise( function( resolve, reject ){
    // console.log('wubalubadubdub')
    loader.load( modelPath, function ( collada ) {

      const dae = collada.scene;

      //some collada import fixes
      dae.scale.x = dae.scale.y = dae.scale.z = 1;
      dae.rotation.y = Math.PI;

      //hide scrolling wheel
      dae.getObjectByName( 'trackpad_scroll_cut').visible = false;
      //hide thumb cursos
      dae.getObjectByName( 'trackpad_touch').visible = false;

      dae.traverse ( function (child) {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.material.color = new THREE.Color().setStyle( color );
          child.material.specular = new THREE.Color().setStyle( specular );
          child.material.shininess = shininess;
          child.material.side = THREE.DoubleSide;
        }
      })

      var rightLabel = dae.getObjectByName( 'rstatus').children[0];
      var leftLabel = dae.getObjectByName( 'lstatus').children[0];

      //this works only if when the page is loaded, both controllers are already on
      const hand = controller.gamepad.hand;
      if( hand == 'left') {

        rightLabel.visible = false;
        leftLabel.material.alphaMap = leftLabel.material.map;
        leftLabel.material.transparent = true;

      } else if( hand == 'right') {

        leftLabel.visible = false;
        rightLabel.material.alphaMap = rightLabel.material.map;
        rightLabel.material.transparent = true;

      } else {
        leftLabel.visible = rightLabel.visible = false;
      }

      bindAnimations( controller, generateBindings( controller, dae ) );

      resolve( dae );
    });

  });
}

const TO_RADIANS = Math.PI / 180;

function generateBindings( controller, model ){
  const trackpad = controller.getButtonByName( 'trackpad' );

  const trackpadTouch = model.getObjectByName( 'trackpad_touch' );
  const trackpadPivot = model.getObjectByName( 'trackpad_pivot' );
  const triggerPivot = model.getObjectByName( 'trigger_pivot' );
  const lgripPivot = model.getObjectByName( 'lgrip_pivot' );
  const rgripPivot = model.getObjectByName( 'rgrip_pivot' );
  const menuButton = model.getObjectByName( 'button' );

  return {
    'trackpad touch began': function(){
      trackpadTouch.visible = trackpad.isTouched;
    },
    'trackpad touch ended': function(){
      trackpadTouch.visible = trackpad.isTouched;
    },
    'trackpad press ended': function(){
      trackpadPivot.position.y = 0.002;
      trackpadPivot.rotation.set( 0, 0, 0 );
    },
    'axes changed': function( { axes } ){

      //0.019 / -0.019 are values specified in the SteamVR json file
      const posX = mapRange(axes[ 0 ], -1, 1, 0.019, -0.019)
      const posZ = mapRange(axes[ 1 ], -1, 1, -0.019, 0.019)

      trackpadTouch.position.x = posX;
      trackpadTouch.position.z = posZ;

      if( trackpad.isPressed ){
        // -7 / 7 and -4 / 4 are values specified in the SteamVR json file
        const rotX = mapRange(axes[ 0 ], -1, 1, -7, 7);
        const rotZ = mapRange(axes[ 1 ], -1, 1, -4, 4);

        trackpadPivot.position.y = 0.001;
        trackpadPivot.rotation.z = rotX * Math.PI / 180;
        trackpadPivot.rotation.x = rotZ * Math.PI / 180;
      }
    },
    'trigger value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 17);
      triggerPivot.rotation.x = mapped * TO_RADIANS;
    },
    'grips value changed': function( { value } ){
      lgripPivot.rotation.y = - value * 2 * TO_RADIANS;
      rgripPivot.rotation.y =  value * 2 * TO_RADIANS;
    },
    'menu value changed': function( { value } ){
      const mapped = mapRange(value, 0, 1, 0, 0.00075);
      menuButton.position.y = -mapped;
    }
  }
}