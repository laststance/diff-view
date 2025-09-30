import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/icons/icon', // Electron will automatically append the correct extension
    name: 'Diff View',
    executableName: 'diff-view',
    appBundleId: 'com.diffview.app',
    appCategoryType: 'public.app-category.developer-tools',
    win32metadata: {
      CompanyName: 'Diff View',
      FileDescription:
        'An offline desktop application for GitHub-style text comparison and diff visualization',
      OriginalFilename: 'diff-view.exe',
      ProductName: 'Diff View',
      InternalName: 'diff-view',
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'diff-view',
      authors: 'Diff View',
      description:
        'An offline desktop application for GitHub-style text comparison and diff visualization',
      iconUrl: './assets/icons/win/icon.ico',
      setupIcon: './assets/icons/win/icon.ico',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        name: 'diff-view',
        productName: 'Diff View',
        genericName: 'Text Diff Viewer',
        description:
          'An offline desktop application for GitHub-style text comparison and diff visualization',
        categories: ['Development', 'Utility'],
        icon: './assets/icons/linux/icon-256x256.png',
      },
    }),
    new MakerDeb({
      options: {
        name: 'diff-view',
        productName: 'Diff View',
        genericName: 'Text Diff Viewer',
        description:
          'An offline desktop application for GitHub-style text comparison and diff visualization',
        categories: ['Development', 'Utility'],
        icon: './assets/icons/linux/icon-256x256.png',
        maintainer: 'Ryota Murakami <dojce1048@gmail.com>',
        homepage: 'https://github.com/diff-view/diff-view',
      },
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
