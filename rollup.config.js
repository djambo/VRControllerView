// rollup.config.js
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import babel from 'rollup-plugin-babel';;
import json from 'rollup-plugin-json';
import * as path from 'path';

export default {

  entry       :   'modules/index.js',
  dest        :   'build/vrcontrollerview.js',
  format      :   'iife',
  sourceMap   :   true,

  //  we are building a <script> include bundle, so it needs a module name
  //  eg, VRControllerView.init() etc
  moduleName  :   'VRControllerView',

  //  external dependencies that modules will reference
  external: [
    'three',
    path.resolve( './examples/thirdparty/three.min.js' )
  ],

  plugins: [

    //  transpile, but exclude node modules
    babel({
      exclude:      [ 'node_modules/**', 'models/**' ]
    }),

    //  allow import of json in modules
    json({
      include:      'models/**',
      exclude:      [ 'node_modules/**' ],
      preferConst:  true,
    }),

    //  start a test server
    serve({
      contentBase:  './',
      host:         'localhost',
      port:         8000
    }),
    livereload()
  ]
};