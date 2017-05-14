exports.files = {
  javascripts: {
    joinTo: {
      'js/app.js': /^app/,
      'js/vendor.js': /^node_modules/,
    },
  },
  stylesheets: { joinTo: 'css/app.css' },
};

exports.plugins = {
  babel: {
    presets: ['latest', 'stage-0', 'react'],
  },
  pleeease: {
    sass: true,
    autoprefixer: {
      browsers: ['> 1%'],
    },
  },
};

exports.modules = {
  autoRequire: {
    'js/app.js': ['initialize'],
  },
};

exports.npm = {
  globals: {
    jQuery: 'jquery',
    $: 'jquery',
    bootstrap: 'bootstrap',
  },
  styles: {
    bootstrap: ['dist/css/bootstrap.css'],
  },
};
