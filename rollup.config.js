import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default [{
  input: 'src/index.ts',
  output: {
    name: 'ipbus',
    sourcemap: true,
    file: 'dist/ipbus.js',
    format: 'umd' // most cpu lightweight, best bundle size
  },

  plugins: [
    typescript({tsconfig: "tsconfig.json"}), // typescript compilator, goes first
    resolve(), // allow bundling node_module dependencies, written in es6 ('import/export' format)
  ]
}, {
  input: 'src/dispatchers/message/index.ts',
  external: ['logger-console', 'utils/validate'],
  output: {
    name: 'message-dispatcher',
    sourcemap: true,
    file: 'dist/message-dispatcher.js',
    format: 'umd' // most cpu lightweight, best bundle size
  },
  plugins: [
    typescript({tsconfig: "tsconfig.json"}), // typescript compilator, goes first
    resolve(), // allow bundling node_module dependencies, written in es6 ('import/export' format)
  ]
}];
