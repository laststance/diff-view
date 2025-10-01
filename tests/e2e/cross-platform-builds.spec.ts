import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

test.describe('Cross-Platform Build Configuration', () => {
  test('should successfully package application', async () => {
    // Test that packaging works without errors
    try {
      const output = execSync('npm run package:current', {
        encoding: 'utf-8',
        timeout: 60000, // 60 second timeout
      });
      expect(output).toContain('Packaging application');
      expect(output).toContain('✔');
    } catch (error) {
      console.error('Packaging failed:', error);
      throw error;
    }
  });

  test('should successfully create distributables', async () => {
    // Test that make process works without errors
    try {
      const output = execSync('npm run build:current', {
        encoding: 'utf-8',
        timeout: 120000, // 2 minute timeout
      });
      expect(output).toContain('Making distributables');
      expect(output).toContain('Artifacts available at');
    } catch (error) {
      console.error('Build failed:', error);
      throw error;
    }
  });

  test('should verify build artifacts exist', async () => {
    const buildDir = path.join(__dirname, '../../out');

    // Check that build directory exists
    expect(fs.existsSync(buildDir)).toBe(true);

    // Check for packaged application
    const packagedAppPath = path.join(buildDir, 'Diff View-darwin-arm64');
    expect(fs.existsSync(packagedAppPath)).toBe(true);

    // Check for make artifacts
    const makeDir = path.join(buildDir, 'make');
    if (fs.existsSync(makeDir)) {
      // Check for DMG on macOS
      if (process.platform === 'darwin') {
        const dmgFiles = fs
          .readdirSync(makeDir)
          .filter((file) => file.endsWith('.dmg'));
        expect(dmgFiles.length).toBeGreaterThan(0);
      }

      // Check for ZIP archives
      const zipDir = path.join(makeDir, 'zip');
      if (fs.existsSync(zipDir)) {
        const hasZipFiles = fs
          .readdirSync(zipDir, { recursive: true })
          .some((file) => typeof file === 'string' && file.endsWith('.zip'));
        expect(hasZipFiles).toBe(true);
      }
    }
  });

  test('should verify application metadata in package.json', async () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Verify application metadata
    expect(packageJson.name).toBe('diff-view');
    expect(packageJson.productName).toBe('Diff View');
    expect(packageJson.description).toContain('diff visualization');
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(packageJson.author).toBeDefined();
    expect(packageJson.license).toBe('MIT');
  });

  test('should verify cross-platform build scripts exist', async () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Check for cross-platform build scripts
    expect(packageJson.scripts).toHaveProperty('build:all');
    expect(packageJson.scripts).toHaveProperty('build:windows');
    expect(packageJson.scripts).toHaveProperty('build:macos');
    expect(packageJson.scripts).toHaveProperty('build:linux');
    expect(packageJson.scripts).toHaveProperty('package:all');
    expect(packageJson.scripts).toHaveProperty('package:windows');
    expect(packageJson.scripts).toHaveProperty('package:macos');
    expect(packageJson.scripts).toHaveProperty('package:linux');
  });
});

test.describe('Build Configuration Validation', () => {
  test('should validate forge configuration', async () => {
    const forgeConfigPath = path.join(__dirname, '../../forge.config.ts');
    expect(fs.existsSync(forgeConfigPath)).toBe(true);

    // Read and validate forge configuration
    const forgeConfig = fs.readFileSync(forgeConfigPath, 'utf-8');

    // Check for required makers
    expect(forgeConfig).toContain('MakerDMG');
    expect(forgeConfig).toContain('MakerZIP');
    expect(forgeConfig).toContain('MakerDeb');
    expect(forgeConfig).toContain('MakerRpm');
    expect(forgeConfig).toContain('MakerSquirrel');

    // Check for security configurations
    expect(forgeConfig).toContain('FusesPlugin');
    expect(forgeConfig).toContain('asar: true');

    // Check for application metadata
    expect(forgeConfig).toContain('appBundleId');
    expect(forgeConfig).toContain('appCategoryType');
    expect(forgeConfig).toContain('win32metadata');
  });

  test('should validate required dependencies', async () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Check for required Electron Forge makers
    expect(packageJson.devDependencies).toHaveProperty(
      '@electron-forge/maker-dmg'
    );
    expect(packageJson.devDependencies).toHaveProperty(
      '@electron-forge/maker-zip'
    );
    expect(packageJson.devDependencies).toHaveProperty(
      '@electron-forge/maker-deb'
    );
    expect(packageJson.devDependencies).toHaveProperty(
      '@electron-forge/maker-rpm'
    );
    expect(packageJson.devDependencies).toHaveProperty(
      '@electron-forge/maker-squirrel'
    );

    // Check for Electron Forge core
    expect(packageJson.devDependencies).toHaveProperty('@electron-forge/cli');
    expect(packageJson.devDependencies).toHaveProperty(
      '@electron-forge/plugin-vite'
    );
    expect(packageJson.devDependencies).toHaveProperty(
      '@electron-forge/plugin-fuses'
    );
  });

  test('should validate build documentation', async () => {
    const buildDocPath = path.join(__dirname, '../../BUILD.md');
    expect(fs.existsSync(buildDocPath)).toBe(true);

    const buildDoc = fs.readFileSync(buildDocPath, 'utf-8');

    // Check for required documentation sections
    expect(buildDoc).toContain('Cross-Platform Builds');
    expect(buildDoc).toContain('Code Signing Configuration');
    expect(buildDoc).toContain('Windows Code Signing');
    expect(buildDoc).toContain('macOS Code Signing');
    expect(buildDoc).toContain('Build Artifacts');
    expect(buildDoc).toContain('Troubleshooting');

    // Check for build commands documentation
    expect(buildDoc).toContain('npm run build:all');
    expect(buildDoc).toContain('npm run build:windows');
    expect(buildDoc).toContain('npm run build:macos');
    expect(buildDoc).toContain('npm run build:linux');
  });

  test('should validate entitlements files for macOS', async () => {
    const entitlementsPath = path.join(
      __dirname,
      '../../build/entitlements.mac.plist'
    );
    const inheritEntitlementsPath = path.join(
      __dirname,
      '../../build/entitlements.mac.inherit.plist'
    );

    expect(fs.existsSync(entitlementsPath)).toBe(true);
    expect(fs.existsSync(inheritEntitlementsPath)).toBe(true);

    const entitlements = fs.readFileSync(entitlementsPath, 'utf-8');
    const inheritEntitlements = fs.readFileSync(
      inheritEntitlementsPath,
      'utf-8'
    );

    // Check for required entitlements
    expect(entitlements).toContain('com.apple.security.cs.allow-jit');
    expect(entitlements).toContain('com.apple.security.device.clipboard');
    expect(entitlements).toContain(
      'com.apple.security.files.user-selected.read-write'
    );
    expect(entitlements).toContain('com.apple.security.network.client');

    expect(inheritEntitlements).toContain('com.apple.security.cs.allow-jit');
    expect(inheritEntitlements).toContain(
      'com.apple.security.device.clipboard'
    );
  });

  test('should validate build environment configuration', async () => {
    const buildConfigPath = path.join(
      __dirname,
      '../../build/build-config.env.example'
    );
    expect(fs.existsSync(buildConfigPath)).toBe(true);

    const buildConfig = fs.readFileSync(buildConfigPath, 'utf-8');

    // Check for required environment variables
    expect(buildConfig).toContain('WINDOWS_CERTIFICATE_FILE');
    expect(buildConfig).toContain('WINDOWS_CERTIFICATE_PASSWORD');
    expect(buildConfig).toContain('APPLE_ID');
    expect(buildConfig).toContain('APPLE_APP_PASSWORD');
    expect(buildConfig).toContain('APPLE_TEAM_ID');
    expect(buildConfig).toContain('APPLE_SIGNING_IDENTITY');
    expect(buildConfig).toContain('BUILD_NUMBER');
    expect(buildConfig).toContain('NODE_ENV');
  });
});

test.describe('Platform-Specific Build Tests', () => {
  test('should test Windows build configuration', async () => {
    const forgeConfigPath = path.join(__dirname, '../../forge.config.ts');
    const forgeConfig = fs.readFileSync(forgeConfigPath, 'utf-8');

    // Check for Windows-specific configurations
    expect(forgeConfig).toContain('MakerSquirrel');
    expect(forgeConfig).toContain('win32metadata');
    expect(forgeConfig).toContain('CompanyName');
    expect(forgeConfig).toContain('FileDescription');
    expect(forgeConfig).toContain('ProductName');
    expect(forgeConfig).toContain('OriginalFilename');
    expect(forgeConfig).toContain('InternalName');

    // Check for Windows code signing placeholders
    expect(forgeConfig).toContain('certificateFile');
    expect(forgeConfig).toContain('certificatePassword');
    expect(forgeConfig).toContain('WINDOWS_CERTIFICATE_FILE');
    expect(forgeConfig).toContain('WINDOWS_CERTIFICATE_PASSWORD');
  });

  test('should test macOS build configuration', async () => {
    const forgeConfigPath = path.join(__dirname, '../../forge.config.ts');
    const forgeConfig = fs.readFileSync(forgeConfigPath, 'utf-8');

    // Check for macOS-specific configurations
    expect(forgeConfig).toContain('MakerDMG');
    expect(forgeConfig).toContain('MakerZIP');
    expect(forgeConfig).toContain('appBundleId');
    expect(forgeConfig).toContain('appCategoryType');
    expect(forgeConfig).toContain('public.app-category.developer-tools');

    // Check for macOS code signing placeholders (commented out)
    expect(forgeConfig).toContain('osxSign');
    expect(forgeConfig).toContain('osxNotarize');
    expect(forgeConfig).toContain('entitlements.mac.plist');
  });

  test('should test Linux build configuration', async () => {
    const forgeConfigPath = path.join(__dirname, '../../forge.config.ts');
    const forgeConfig = fs.readFileSync(forgeConfigPath, 'utf-8');

    // Check for Linux-specific configurations
    expect(forgeConfig).toContain('MakerDeb');
    expect(forgeConfig).toContain('MakerRpm');
    expect(forgeConfig).toContain('categories');
    expect(forgeConfig).toContain('Development');
    expect(forgeConfig).toContain('Utility');

    // Check for Linux dependencies
    expect(forgeConfig).toContain('depends');
    expect(forgeConfig).toContain('requires');
    expect(forgeConfig).toContain('libgtk');
    expect(forgeConfig).toContain('libnss');
    expect(forgeConfig).toContain('libnotify');
    expect(forgeConfig).toContain('xdg-utils');
  });

  test('should validate application bundle structure on macOS', async () => {
    // Skip if not on macOS
    test.skip(process.platform !== 'darwin', 'macOS-specific test');

    const appPath = path.join(
      __dirname,
      '../../out/Diff View-darwin-arm64/Diff View.app'
    );

    // Only test if the app was built
    if (fs.existsSync(appPath)) {
      // Check for required macOS app bundle structure
      expect(fs.existsSync(path.join(appPath, 'Contents'))).toBe(true);
      expect(fs.existsSync(path.join(appPath, 'Contents/MacOS'))).toBe(true);
      expect(fs.existsSync(path.join(appPath, 'Contents/Resources'))).toBe(
        true
      );
      expect(fs.existsSync(path.join(appPath, 'Contents/Info.plist'))).toBe(
        true
      );

      // Check for application executable
      const macOSPath = path.join(appPath, 'Contents/MacOS');
      const executables = fs.readdirSync(macOSPath);
      expect(executables.length).toBeGreaterThan(0);

      // Check for application resources
      const resourcesPath = path.join(appPath, 'Contents/Resources');
      expect(fs.existsSync(resourcesPath)).toBe(true);
    }
  });

  test('should verify icon files exist for all platforms', async () => {
    const iconsDir = path.join(__dirname, '../../assets/icons');
    expect(fs.existsSync(iconsDir)).toBe(true);

    // Check for Windows icons
    const winIconsDir = path.join(iconsDir, 'win');
    expect(fs.existsSync(winIconsDir)).toBe(true);
    expect(fs.existsSync(path.join(winIconsDir, 'icon.ico'))).toBe(true);

    // Check for macOS icons
    const macIconsDir = path.join(iconsDir, 'mac');
    expect(fs.existsSync(macIconsDir)).toBe(true);
    expect(fs.existsSync(path.join(macIconsDir, 'icon.icns'))).toBe(true);

    // Check for Linux icons
    const linuxIconsDir = path.join(iconsDir, 'linux');
    expect(fs.existsSync(linuxIconsDir)).toBe(true);
    expect(fs.existsSync(path.join(linuxIconsDir, 'icon-256x256.png'))).toBe(
      true
    );
  });

  test('should validate build process can run without errors', async () => {
    // Test that the build configuration is valid by running typecheck
    try {
      const output = execSync('npm run typecheck', {
        encoding: 'utf-8',
        timeout: 30000,
      });
      expect(output).toContain('tsc --noEmit');
    } catch (error) {
      console.error('TypeScript validation failed:', error);
      throw error;
    }
  });
});
