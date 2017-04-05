document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>');
var VRControllerView = (function () {
'use strict';

const daydream = {"modelName":"Daydream controller","diffusePath":"models/daydream/daydream_diffuse.png","modelPath":"models/daydream/daydream.json","color":"#666666","metalness":0,"roughness":0.6};
const vive = {"modelName":"Vive","modelPath":"models/vive/vive_controller.dae","color":"#cccccc","specular":"#303030","shininess":20};
const rift = {"modelLeftPath":"models/rift/oculus_cv1_controller_left.dae","modelRightPath":"models/rift/oculus_cv1_controller_right.dae","diffusePath":"models/rift/oculus_cv1_controller_col.png","specularPath":"models/rift/oculus_cv1_controller_spec.png","color":"#666666","specular":"#0f0f0f","shininess":20};
var ModelData = {
	daydream: daydream,
	vive: vive,
	rift: rift
};

function load(_ref) {
  var diffusePath = _ref.diffusePath,
      modelPath = _ref.modelPath,
      color = _ref.color,
      metalness = _ref.metalness,
      roughness = _ref.roughness,
      modelName = _ref.modelName;


  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load(diffusePath);
  var loader = new THREE.JSONLoader();

  return new Promise(function (resolve, reject) {

    loader.load(modelData.modelPath, function (geometry) {
      var mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({

        map: texture,
        color: new THREE.Color().setStyle(color),
        metalness: metalness,
        roughness: roughness
      }));
      mesh.name = modelName;
      resolve(mesh);
    });
  });
}

function mapRange(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function bindAnimations(controller, bindings) {
  Object.keys(bindings).forEach(function (eventName) {
    var bindingFn = bindings[eventName];
    controller.addEventListener(eventName, bindingFn);
  });
}

function load$1(_ref, controller) {
  var modelPath = _ref.modelPath,
      color = _ref.color,
      specular = _ref.specular,
      shininess = _ref.shininess;

  var loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;

  return new Promise(function (resolve, reject) {
    // console.log('wubalubadubdub')
    loader.load(modelPath, function (collada) {

      var dae = collada.scene;

      //some collada import fixes
      dae.scale.x = dae.scale.y = dae.scale.z = 1;
      dae.rotation.y = Math.PI;

      //hide scrolling wheel
      dae.getObjectByName('trackpad_scroll_cut').visible = false;
      //hide thumb cursos
      dae.getObjectByName('trackpad_touch').visible = false;

      dae.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.material.color = new THREE.Color().setStyle(color);
          child.material.specular = new THREE.Color().setStyle(specular);
          child.material.shininess = shininess;
          child.material.side = THREE.DoubleSide;
        }
      });

      var rightLabel = dae.getObjectByName('rstatus').children[0];
      var leftLabel = dae.getObjectByName('lstatus').children[0];

      //this works only if when the page is loaded, both controllers are already on
      var hand = controller.gamepad.hand;
      if (hand == 'left') {

        rightLabel.visible = false;
        leftLabel.material.alphaMap = leftLabel.material.map;
        leftLabel.material.transparent = true;
      } else if (hand == 'right') {

        leftLabel.visible = false;
        rightLabel.material.alphaMap = rightLabel.material.map;
        rightLabel.material.transparent = true;
      } else {
        leftLabel.visible = rightLabel.visible = false;
      }

      bindAnimations(controller, generateBindings(controller, dae));

      resolve(dae);
    });
  });
}

var TO_RADIANS = Math.PI / 180;

function generateBindings(controller, model) {
  var trackpad = controller.getButtonByName('trackpad');

  var trackpadTouch = model.getObjectByName('trackpad_touch');
  var trackpadPivot = model.getObjectByName('trackpad_pivot');
  var triggerPivot = model.getObjectByName('trigger_pivot');
  var lgripPivot = model.getObjectByName('lgrip_pivot');
  var rgripPivot = model.getObjectByName('rgrip_pivot');
  var menuButton = model.getObjectByName('button');

  return {
    'trackpad touch began': function trackpadTouchBegan() {
      trackpadTouch.visible = trackpad.isTouched;
    },
    'trackpad touch ended': function trackpadTouchEnded() {
      trackpadTouch.visible = trackpad.isTouched;
    },
    'trackpad press ended': function trackpadPressEnded() {
      trackpadPivot.position.y = 0.002;
      trackpadPivot.rotation.set(0, 0, 0);
    },
    'axes changed': function axesChanged(_ref2) {
      var axes = _ref2.axes;


      //0.019 / -0.019 are values specified in the SteamVR json file
      var posX = mapRange(axes[0], -1, 1, 0.019, -0.019);
      var posZ = mapRange(axes[1], -1, 1, -0.019, 0.019);

      trackpadTouch.position.x = posX;
      trackpadTouch.position.z = posZ;

      if (trackpad.isPressed) {
        // -7 / 7 and -4 / 4 are values specified in the SteamVR json file
        var rotX = mapRange(axes[0], -1, 1, -7, 7);
        var rotZ = mapRange(axes[1], -1, 1, -4, 4);

        trackpadPivot.position.y = 0.001;
        trackpadPivot.rotation.z = rotX * Math.PI / 180;
        trackpadPivot.rotation.x = rotZ * Math.PI / 180;
      }
    },
    'trigger value changed': function triggerValueChanged(_ref3) {
      var value = _ref3.value;

      var mapped = mapRange(value, 0, 1, 0, 17);
      triggerPivot.rotation.x = mapped * TO_RADIANS;
    },
    'grips value changed': function gripsValueChanged(_ref4) {
      var value = _ref4.value;

      lgripPivot.rotation.y = -value * 2 * TO_RADIANS;
      rgripPivot.rotation.y = value * 2 * TO_RADIANS;
    },
    'menu value changed': function menuValueChanged(_ref5) {
      var value = _ref5.value;

      var mapped = mapRange(value, 0, 1, 0, 0.00075);
      menuButton.position.y = -mapped;
    }
  };
}

function load$2(_ref, controller) {
  var modelLeftPath = _ref.modelLeftPath,
      modelRightPath = _ref.modelRightPath,
      color = _ref.color,
      specular = _ref.specular,
      shininess = _ref.shininess,
      diffusePath = _ref.diffusePath,
      specularPath = _ref.specularPath;


  var loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;

  var hand = controller.gamepad.hand;

  if (hand === undefined) {
    return new Promise();
  }

  var modelPath = void 0;

  if (hand == 'left') {
    modelPath = modelLeftPath;
  } else if (hand == 'right') {
    modelPath = modelRightPath;
  }

  if (modelPath) {

    return new Promise(function (resolve, reject) {
      loader.load(modelPath, function (collada) {

        var dae = collada.scene;

        //some collada fixes
        dae.scale.x = dae.scale.y = dae.scale.z = 1;
        dae.rotation.y = Math.PI;
        dae.rotation.x = 50.6 * Math.PI / 180;

        dae.position.copy(new THREE.Vector3(0.0055, 0.04, -0.03));

        var textureLoader = new THREE.TextureLoader();

        dae.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.material.color = new THREE.Color().setStyle(color);
            child.material.specular = new THREE.Color().setStyle(specular);
            child.material.shininess = shininess;
            child.material.side = THREE.DoubleSide;
            child.material.map = textureLoader.load(diffusePath);
            child.material.specularMap = textureLoader.load(specularPath);
          }
        });

        resolve(dae);
      });
    });
  }
}

var index = function (camera, controls) {
  var handler = initialize(camera, controls);
  window.addEventListener('vr controller connected', handler);
};

function initialize(camera, controls) {

  return function (event) {

    var controller = event.detail;

    controller.standingMatrix = controls.getStandingMatrix();
    controller.head = camera;

    function addToParent(model) {
      controller.add(model);
      window.dispatchEvent(new CustomEvent('vr controller view loaded', { detail: model }));
    }

    var gamepadStyle = controller.gamepadStyle;


    switch (gamepadStyle) {
      case 'daydream':
        load(ModelData[gamepadStyle], controller).then(addToParent);
        break;
      case 'vive':
        load$1(ModelData[gamepadStyle], controller).then(addToParent);
        break;
      case 'rift':
        //  rift needs handedness info
        load$2(ModelData[gamepadStyle], controller).then(addToParent);
        break;
    }

    //  If the controller dissappers we should too.
    //  We could probably do something more efficient than simply set it to invisible
    //  but this is just for illustration purposes, right? ;)

    controller.addEventListener('disconnected', function () {
      controller.visible = false;
    });
  };
}

return index;

}());
//# sourceMappingURL=vrcontrollerview.js.map
