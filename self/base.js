



    ///////////////
   //           //
  //   Tasks   //
 //           //
///////////////


const setupTasks = new TaskList()
document.addEventListener( 'DOMContentLoaded', function(){

	setupTasks.run().clear()
	update()
})


const updateTasks = new TaskList()
function update(){

	const vrDisplay = effect.getVRDisplay()
	if( vrDisplay !== undefined ) vrDisplay.requestAnimationFrame( update )
	else requestAnimationFrame( update )
	updateTasks.run()
	render()
}






    ///////////////
   //           //
  //   Three   //
 //           //
///////////////


setupTasks.add( function(){

	const
	container = document.getElementById( 'three' ),
	angle     = 70,
	width     = container.offsetWidth  || window.innerWidth,
	height    = container.offsetHeight || window.innerHeight,
	aspect    = width / height,
	near      = 0.1,
	far       = 100
	

	//  Fire up the WebGL renderer.

	window.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
	renderer.setClearColor( 0xBBBBBB )
	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setSize( width, height )
	renderer.shadowMap.enabled = true//  See https://github.com/mrdoob/three.js/issues/1055
	renderer.sortObjects = false
	container.appendChild( renderer.domElement )
	window.addEventListener( 'resize', onThreeResize, false )


	//  Create the scene tree to attach objects to.

	window.scene = new THREE.Scene()
	scene.name = 'scene'


	//  Create and place the camera.

	window.camera = new THREE.PerspectiveCamera( angle, aspect, near, far )
	camera.name = 'camera'
	camera.position.set( 0, 1.6, 2 )//  Will be overridden quickly by HMD.
	scene.add( camera )


	//  Get those VR controls in charge of our camera.

	window.controls = new THREE.VRControls( camera )
	controls.name = 'controls'
	controls.standing = true
	updateTasks.add( controls.update.bind( controls ))


	//  Effect for when it’s time to take our single camera
	//  and split it into two for stereoscopics!

	window.effect = new THREE.VREffect( renderer )
	effect.name = 'effect'
	if( WEBVR.isAvailable() === true ) document.body.appendChild( WEBVR.getButton( effect ))
	else document.body.appendChild( WEBVR.getMessage() )


	//  Aaaaaaaand this could be useful for animation, eh?

	window.clock = new THREE.Clock()
})
function onThreeResize(){

	const
	container = document.getElementById( 'three' ),
	width     = container.offsetWidth  || window.innerWidth,
	height    = container.offsetHeight || window.innerHeight

	camera.aspect = width / height
	camera.updateProjectionMatrix()
	effect.setSize( width, height )
	if( typeof controls.handleResize === 'function' ) controls.handleResize()
}
function render(){
	
	effect.render( scene, camera )
}
function screengrab( preferMono = true ){

	preferMono ? renderer.render( scene, camera ) : effect.render( scene, camera )

	const 
	image  = renderer.domElement.toDataURL( 'image/png' ),
	anchor = document.createElement( 'a' )

	anchor.download = 'screengrab.png'
	anchor.href = image
	anchor.click()
	return false
}




//  Add some simple lighting so we can immediately see whatever meshes we make.

setupTasks.add( function(){

	scene.add( new THREE.HemisphereLight( 0x888877, 0x777788 ))

	const light = new THREE.DirectionalLight( 0xFFFFFF )
	light.position.set( -1, 10, 1 )
	light.castShadow = true
	light.shadow.camera.near   =   8
	light.shadow.camera.far    =  10.5
	light.shadow.camera.top    =  2//22
	light.shadow.camera.bottom = -2//-22
	light.shadow.camera.right  =  2//22
	light.shadow.camera.left   = -2//-22
	light.shadow.mapSize.set( 4096, 4096 )
	scene.add( light )
	//scene.add( new THREE.CameraHelper( light.shadow.camera ) )
	window.mainLight = light
})



