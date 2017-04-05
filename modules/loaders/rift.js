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
        dae.rotation.x = 50.6 * Math.PI / 180;

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

        resolve( dae );

      });
    });

  }

}