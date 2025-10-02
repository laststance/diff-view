import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const isLinux = process.platform === 'linux';

/**
 * Creates the MakerDeb instance only when running on a Linux host.
 * Electron Forge requires native tooling (dpkg, fakeroot) that is available on Linux.
 */
const createDebMaker = () => {
  if (!isLinux) {
    return null;
  }

  return new MakerDeb(
    {
      options: {
        name: 'diff-view',
        productName: 'Diff View',
        genericName: 'Text Diff Viewer',
        description:
          'An offline desktop application for GitHub-style text comparison and diff visualization',
        categories: ['Development', 'Utility'],
        section: 'devel',
        priority: 'optional',
        icon: './assets/icons/linux/icon-256x256.png',
        maintainer: 'Ryota Murakami <dojce1048@gmail.com>',
        homepage: 'https://github.com/diff-view/diff-view',
        depends: [
          'libgtk-3-0',
          'libnotify4',
          'libnss3',
          'libxss1',
          'libxtst6',
          'xdg-utils',
          'libatspi2.0-0',
          'libdrm2',
          'libxcomposite1',
          'libxdamage1',
          'libxrandr2',
          'libgbm1',
          'libxkbcommon0',
          'libasound2',
        ],
        recommends: ['git'],
        bin: 'diff-view',
        mimeType: ['text/plain', 'text/x-diff'],
      },
    },
    ['linux']
  );
};

/**
 * Creates the MakerRpm instance only when running on a Linux host.
 * rpmbuild is not available on macOS, so this prevents local build failures.
 */
const createRpmMaker = () => {
  if (!isLinux) {
    return null;
  }

  return new MakerRpm(
    {
      options: {
        name: 'diff-view',
        productName: 'Diff View',
        genericName: 'Text Diff Viewer',
        description:
          'An offline desktop application for GitHub-style text comparison and diff visualization',
        categories: ['Development', 'Utility'],
        icon: './assets/icons/linux/icon-256x256.png',
        homepage: 'https://github.com/diff-view/diff-view',
        license: 'MIT',
        requires: [
          'gtk3',
          'libnotify',
          'nss',
          'libXScrnSaver',
          'libXtst',
          'xdg-utils',
          'at-spi2-atk',
          'libdrm',
          'libXcomposite',
          'libXdamage',
          'libXrandr',
          'mesa-libgbm',
          'libxkbcommon',
          'alsa-lib',
        ],
        bin: 'diff-view',
      },
    },
    ['linux']
  );
};

const linuxMakers = [
  new MakerZIP({}, ['linux']),
  createDebMaker(),
  createRpmMaker(),
].filter((maker): maker is MakerZIP | MakerDeb | MakerRpm => maker !== null);

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/icons/icon', // Electron will automatically append the correct extension
    name: 'Diff View',
    executableName: 'diff-view',
    appBundleId: 'com.diffview.app',
    appCategoryType: 'public.app-category.developer-tools',
    appVersion: process.env.npm_package_version || '1.0.0',
    buildVersion: process.env.BUILD_NUMBER || '1',
    appCopyright: `Copyright © ${new Date().getFullYear()} Diff View`,

    // Windows-specific metadata
    win32metadata: {
      CompanyName: 'Diff View',
      FileDescription:
        'An offline desktop application for GitHub-style text comparison and diff visualization',
      OriginalFilename: 'diff-view.exe',
      ProductName: 'Diff View',
      InternalName: 'diff-view',
    },

    // macOS code signing configuration (placeholders)
    // Uncomment and configure when code signing is needed:
    // osxSign: {
    //   identity: 'Developer ID Application: Your Name (TEAM_ID)',
    //   hardenedRuntime: true,
    //   entitlements: './build/entitlements.mac.plist',
    //   entitlementsInherit: './build/entitlements.mac.inherit.plist',
    // },

    // macOS notarization configuration (placeholders)
    // Uncomment and configure when notarization is needed:
    // osxNotarize: {
    //   appleId: process.env.APPLE_ID!,
    //   appleIdPassword: process.env.APPLE_APP_PASSWORD!,
    //   teamId: process.env.APPLE_TEAM_ID!,
    // },

    // Additional cross-platform options
    protocols: [
      {
        name: 'Diff View Protocol',
        schemes: ['diffview'],
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    // Windows Squirrel installer
    new MakerSquirrel(
      {
        name: 'diff-view',
        authors: 'Diff View',
        description:
          'An offline desktop application for GitHub-style text comparison and diff visualization',
        iconUrl: './assets/icons/win/icon.ico',
        setupIcon: './assets/icons/win/icon.ico',
        loadingGif: './assets/icons/win/loading.gif', // Optional loading animation
        // Code signing for Windows (placeholder)
        certificateFile: process.env.WINDOWS_CERTIFICATE_FILE,
        certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD,
        // Additional Windows-specific options
        noMsi: true, // Only create Squirrel installer, not MSI
        remoteReleases: process.env.SQUIRREL_REMOTE_RELEASES_URL,
      },
      ['win32']
    ),

    // macOS DMG installer (preferred over ZIP for distribution)
    new MakerDMG(
      {
        name: 'Diff View',
        icon: './assets/icons/mac/icon.icns',
        // background: './assets/dmg-background.png', // Optional custom background
        format: 'ULFO', // Compressed format
        // contents will be automatically configured by Electron Forge
      },
      ['darwin']
    ),

    // macOS ZIP archive (for direct distribution)
    new MakerZIP(
      {
        macUpdateManifestBaseUrl: process.env.MACOS_UPDATE_BASE_URL, // For auto-updates
      },
      ['darwin']
    ),

    ...linuxMakers,
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
