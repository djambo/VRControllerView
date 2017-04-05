export function load( {
  diffusePath,
  modelPath,
  color,
  metalness,
  roughness,
  modelName } ){

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load( diffusePath );
  const loader = new THREE.JSONLoader();

  return new Promise( function( resolve, reject ){

    loader.load( modelData.modelPath, function( geometry ){
      const mesh = new THREE.Mesh(

        geometry,
        new THREE.MeshStandardMaterial({

          map: texture,
          color: new THREE.Color().setStyle( color ),
          metalness,
          roughness
        })

      )
      mesh.name = modelName;
      resolve( mesh );
    });

  });

}