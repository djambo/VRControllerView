



var Grids = {}




Grids.createColorBounds = function( size = 12, cells = 12 ){


	//  Create a 12 × 12 × 12 gridded cube room for easy spatial reference.
	//  We’ll use Rubik’s Cube notion and colors because reasons. 

	const grids = new THREE.Object3D()

	size /= 2
	for( let i = 0; i < 6; i ++ ){

		const centerColor = 0xFFFFFF
		let grid

		if( i === 0 ){//  Front (Red).

			grid = new THREE.GridHelper( size, cells, centerColor, 0xFF0000 )
			grid.position.z = -size
			grid.position.y =  size
			grid.rotation.x =  Math.PI / 2
		}
		else if( i === 1 ){//  Up (Yellow).
		
			grid = new THREE.GridHelper( size, cells, centerColor, 0xFFEE00 )
			grid.position.y = size * 2
		}
		else if( i === 2 ){//  Right (Blue).
		
			grid = new THREE.GridHelper( size, cells, centerColor, 0x0033FF )
			grid.position.x = size
			grid.position.y = size
			grid.rotation.z = Math.PI / 2
		}
		else if( i === 3 ){//  Down (White).
		
			grid = new THREE.GridHelper( size, cells, centerColor, 0xFFFFFF )
			Object.assign( grid.material, {

				transparent: true,
				opacity:     0.1
			})
		}
		else if( i === 4 ){//  Left (Green).
		
			grid = new THREE.GridHelper( size, cells, centerColor, 0x00CC33 )
			grid.position.x = -size
			grid.position.y =  size
			grid.rotation.z =  Math.PI / 2
		}
		else if( i === 5 ){//  Back (Orange).

			grid = new THREE.GridHelper( size, cells, centerColor, 0xFF6600 )
			grid.position.z = size
			grid.position.y = size
			grid.rotation.x = Math.PI / 2
		}
		if( i !== 3 ) Object.assign( grid.material, {

			transparent: true,
			opacity:     0.1
		})
		grids.add( grid )
	}
	scene.add( grids )
}




Grids.createIntersectAxes = function( size = 12, cells = 12 ){

	const 
	geometry   = new THREE.Geometry(),
	cellSize   = size / cells,
	lineLength = 0.02//  0.02 meters = 2 centimeters.
	
	for( let z = cells / -2; z <= cells / 2; z ++ ){

		for( let y = cells / -2; y <= cells / 2; y ++ ){

			for( let x = cells / -2; x <= cells / 2; x ++ ){

				const 
				xc = x * cellSize,
				yc = y * cellSize,
				zc = z * cellSize

				geometry.vertices.push( 

					new THREE.Vector3( xc + lineLength / -2, yc, zc ),
					new THREE.Vector3( xc + lineLength /  2, yc, zc ),
					new THREE.Vector3( xc, yc + lineLength / -2, zc ),
					new THREE.Vector3( xc, yc + lineLength /  2, zc ),
					new THREE.Vector3( xc, yc, zc + lineLength / -2 ),
					new THREE.Vector3( xc, yc, zc + lineLength /  2 )
				)
			}
		}
	}
	const lines = new THREE.LineSegments( 

		geometry, 
		new THREE.LineBasicMaterial({

			linewidth:   1,
			color:       0xFFFFFF,
			transparent: true,
			opacity:     0.5
		})
	)
	scene.add( lines )
}




Grids.createFullGrid = function( size = 12, cells = 12 ){

	const 
	geometry  = new THREE.Geometry(),
	cellSize  = size / cells,
	cellNoLo  = cells / -2,
	cellNoHi  = cells /  2,
	gapLength = 0.02//  0.02 meters = 2 centimeters.
	
	for( let z = cellNoLo; z <= cellNoHi; z ++ ){

		for( let y = cellNoLo; y <= cellNoHi; y ++ ){

			for( let x = cellNoLo; x <= cellNoHi; x ++ ){

				const 
				xc = x * cellSize,
				yc = y * cellSize,
				zc = z * cellSize

				if( x < cellNoHi ) geometry.vertices.push( 

					new THREE.Vector3( xc + gapLength, yc, zc ),
					new THREE.Vector3( xc + cellSize - gapLength, yc, zc )
				)
				if( y < cellNoHi ) geometry.vertices.push( 

					new THREE.Vector3( xc, yc + gapLength, zc ),
					new THREE.Vector3( xc, yc + cellSize - gapLength, zc )
				)
				if( z < cellNoHi ) geometry.vertices.push( 

					new THREE.Vector3( xc, yc, zc + gapLength ),
					new THREE.Vector3( xc, yc, zc + cellSize - gapLength )
				)
			}
		}
	}
	const lines = new THREE.LineSegments( 

		geometry, 
		new THREE.LineBasicMaterial({

			linewidth:   1,//0.5,
			color:       0xFFFFFF,
			transparent: true,
			opacity:     0.05,
			blending:    THREE.AdditiveBlending
		})
	)
	scene.add( lines )
}




Grids.createFloor = function( size = 12, cells = 12 ){

	window.floor = new THREE.Mesh( 

		new THREE.PlaneGeometry( size, size ),
		new THREE.MeshPhongMaterial({

			color:       0x111111,
			transparent: true,
			opacity:     0.9
		})
	)
	floor.receiveShadow = true
	floor.castShadow = true
	floor.rotation.x = Math.PI / -2
	scene.add( floor )

	const 
	color = 0x000000,//0xFFFFFF,
	grid  = new THREE.GridHelper( size / 2, cells, color, color ),
	opacity = 0.2//0.05
	Object.assign( grid.material, {

		transparent: true,
		opacity
	})
	scene.add( grid )
}




//setupTasks.add( Grids.createColorBounds )
//setupTasks.add( Grids.createIntersectAxes )
//setupTasks.add( Grids.createFullGrid )
setupTasks.add( Grids.createFloor )



