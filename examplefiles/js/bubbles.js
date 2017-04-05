



    ////////////////////
   //                //
  //   Le Bubbles   //
 //                //
////////////////////


function Bubble( controller ){

	THREE.Object3D.call( this )
	this.controller = controller


	//  Lettuce make zee bubbles.
	//  We’ll start with the solids.

	const geometry = new THREE.OctahedronGeometry( 1, 2 )
	let mesh = new THREE.Mesh(

		geometry,
		new THREE.MeshPhongMaterial({

			color:    0x156289,
			emissive: 0x072534,
			side:     THREE.DoubleSide,
			shading:  THREE.FlatShading
		})
	)
	this.add( mesh )


	//  Then we can get all wireframey.

	mesh = new THREE.Mesh(

		geometry,
		new THREE.LineBasicMaterial({

			color:       0xFFFFFF,
			transparent: true,
			opacity:     0.5
		})
	)
	this.add( mesh )


	//  And away we go.

	const scale = 0.01
	this.scale.set( scale, scale, scale )
	this.stage    = 'grow'
	this.velocity =  new THREE.Vector3( 0, 0, 0.2 )
	this.gravity  =  new THREE.Vector3( 0, -0.01, 0 )
	this.index    =  Bubble.instances.length
	Bubble.instances.push( this )
}
Bubble.prototype = Object.create( THREE.Object3D.prototype )
Bubble.prototype.constructor = Bubble




Bubble.prototype.grow = function(){

	const scale = this.scale.x * 1.05
	this.scale.set( scale, scale, scale )
}
Bubble.prototype.release = function(){
	

	//  Time to detach from the controller
	//  because we are FREE!

	const worldPosition = this.getWorldPosition()
	scene.add( this )
	this.position.copy( worldPosition )
	

	//  We also have to fly off into the same direction
	//  as this controller’s current direction.

	const matrix = new THREE.Matrix4()
	matrix.extractRotation( this.controller.matrix )
	this.velocity.applyMatrix4( matrix )
	this.velocity.multiplyScalar( -1 )
	
	this.stage = 'fly'
}
Bubble.prototype.destroy = function(){

	scene.remove( this )
	delete Bubble.instances[ this.index ]
}




Bubble.instances = []
Bubble.update = function(){

	Bubble.instances.forEach( function( bubble ){

		if( bubble.stage === 'grow' || bubble.stage === 'fly' ){

			bubble.rotation.x += 0.03
			bubble.rotation.y += 0.03
			if( bubble.stage === 'grow' ) bubble.grow()
			else if( bubble.stage === 'fly' ){

				bubble.position.add( bubble.velocity )
				bubble.velocity.multiplyScalar( 0.999 )
				bubble.position.add( bubble.gravity )
				bubble.gravity.multiplyScalar( 1.1 )
				if( bubble.position.y + bubble.scale.x <= 0 ){

					bubble.stage = 'die'
					bubble.destroy()
				}
			}
		}
	})
}
updateTasks.push( Bubble.update )







