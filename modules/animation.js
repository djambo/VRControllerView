export function mapRange(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function bindAnimations( controller, bindings ){
  Object.keys( bindings ).forEach( function( eventName ){
    const bindingFn = bindings[ eventName ];
    controller.addEventListener( eventName, bindingFn );
  });
}