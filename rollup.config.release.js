import { uglify } from "rollup-plugin-uglify";
import config from './rollup.config';

config[0].output.file = 'dist/ipsub.min.js';
config[0].plugins.push(
  uglify({ mangle: { toplevel: true }})
);

config[1].output.file = 'dist/message-dispatcher.min.js';
config[1].plugins.push(
  uglify({ mangle: { toplevel: true }})
);

export default config;
