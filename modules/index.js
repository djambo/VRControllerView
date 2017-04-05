import ModelData from '../models/modeldata.json'
import * as DaydreamController from './loaders/daydream';
import * as ViveController from './loaders/vive';
import * as RiftController from './loaders/rift';

export default function( camera, controls ){
  const handler = initialize( camera, controls );
  window.addEventListener( 'vr controller connected', handler );
}

function initialize( camera, controls ){

  return function( event ){

    const controller = event.detail;

    controller.standingMatrix = controls.getStandingMatrix()
    controller.head = camera

    function addToParent( model ){
      controller.add( model );
      window.dispatchEvent( new CustomEvent( 'vr controller view loaded', { detail: model }))
    }


    const { gamepadStyle } = controller;

    switch( gamepadStyle ){
      case 'daydream':
        DaydreamController.load( ModelData[ gamepadStyle ], controller )
        .then( addToParent );
        break;
      case 'vive':
        ViveController.load( ModelData[ gamepadStyle ], controller )
        .then( addToParent );
        break;
      case 'rift':
        //  rift needs handedness info
        RiftController.load( ModelData[ gamepadStyle ], controller )
        .then( addToParent );
        break;
    }

    //  If the controller dissappers we should too.
    //  We could probably do something more efficient than simply set it to invisible
    //  but this is just for illustration purposes, right? ;)

    controller.addEventListener( 'disconnected', function(){
      controller.visible = false;
    });

  }
}