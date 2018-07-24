module.exports = function (w) {
  process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true;


    return {
      files: [
        'src/**/*.ts',
        'src/**/*.vue',
        'tests/**/*.sqlplan',
        'package.json',
        'tsconfig.json'
      ],

      tests: [
        'tests/**/*.ts'
      ],

      env: {
        type: 'node',
        runner: 'node'
      },

      preprocessors: {
        '**/*.js?(x)': file => require('@babel/core').transform(
          file.content,
          {sourceMap: true, compact: false, filename: file.path}),

        '**/*.vue': file => require('vue-jest').process(file.content, file.path)
      },

      testFramework: 'mocha',

      setup: () => {
        require('jsdom-global')();
        const Vue = require('vue');
        Vue.config.productionTip = false;

        if (global._tsconfigPathsRegistered) {
          return;
        }
        const tsConfigPaths = require('tsconfig-paths');
        const tsconfig = require('./tsconfig.json');
        tsConfigPaths.register({
          baseUrl: tsconfig.compilerOptions.baseUrl,
          paths: tsconfig.compilerOptions.paths
        });
        global._tsconfigPathsRegistered = true;
      },

      debug: true
    };
  };
