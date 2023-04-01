module.exports = {
  packagerConfig: {
    // ignore the index.js file
    //ignore: ['index.js', 'main.js'],
  },
  rebuildConfig: {},
  makers: [{
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'z88kat',
          homepage: 'https://www.z88dx.com'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};