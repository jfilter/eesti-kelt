module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "parserOptions": {
        ecmaVersion: 6,
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: "module"
    },
    "env": {
      "jquery": true,
      "browser": true,
    }
};
