# Build Configuration Guide

This document describes the cross-platform build configuration for the Diff View application.

## Overview

The application supports building for three major platforms:

- **Windows**: Squirrel installer (.exe)
- **macOS**: DMG installer (.dmg) and ZIP archive (.zip)
- **Linux**: DEB package (.deb) and RPM package (.rpm)

## Prerequisites

### All Platforms

- Node.js 18+
- npm or yarn
- Git

### Windows (for Windows builds)

- Windows 10/11 or Windows Server
- Visual Studio Build Tools or Visual Studio Community
- Optional: Code signing certificate (.pfx file)

### macOS (for macOS builds)

- macOS 10.15+
- Xcode Command Line Tools
- Optional: Apple Developer account for code signing and notarization

### Linux (for Linux builds)

- Ubuntu 18.04+ or equivalent Linux distribution
- Build essentials: `sudo apt-get install build-essential`

## Build Commands

### Quick Build (Current Platform)

```bash
npm run build:current    # Build for current platform
npm run package:current  # Package for current platform (no installer)
```

### Cross-Platform Builds

```bash
npm run build:all        # Build for all platforms (requires platform-specific tools)
npm run build:windows    # Build Windows installer
npm run build:macos      # Build macOS DMG and ZIP
npm run build:linux      # Build Linux DEB and RPM packages
```

### Packaging Only (No Installers)

```bash
npm run package:all      # Package for all platforms
npm run package:windows  # Package for Windows
npm run package:macos    # Package for macOS
npm run package:linux    # Package for Linux
```

## Code Signing Configuration

### Windows Code Signing

1. Obtain a code signing certificate (.pfx file)
2. Create a `.env` file based on `build/build-config.env.example`
3. Set the following environment variables:
   ```
   WINDOWS_CERTIFICATE_FILE=path/to/certificate.pfx
   WINDOWS_CERTIFICATE_PASSWORD=your_certificate_password
   ```

### macOS Code Signing and Notarization

1. Join the Apple Developer Program
2. Create certificates in Xcode or Apple Developer portal
3. Set environment variables:
   ```
   APPLE_ID=your-apple-id@example.com
   APPLE_APP_PASSWORD=your-app-specific-password
   APPLE_TEAM_ID=YOUR_TEAM_ID
   APPLE_SIGNING_IDENTITY=Developer ID Application: Your Name (TEAM_ID)
   ```

**Note**: App-specific passwords can be generated at [appleid.apple.com](https://appleid.apple.com)

### Linux Code Signing

Linux packages are typically signed by the distribution maintainers. For custom repositories:

- GPG key signing for APT repositories
- RPM signing with GPG keys

## Build Artifacts

After successful builds, artifacts will be located in:

- `out/make/` - Installers and packages
- `out/` - Packaged applications (without installers)

### Windows Artifacts

- `out/make/squirrel.windows/x64/diff-view-1.0.0 Setup.exe` - Squirrel installer

### macOS Artifacts

- `out/make/dmg/x64/Diff View-1.0.0.dmg` - DMG installer
- `out/make/zip/darwin/x64/diff-view-darwin-x64-1.0.0.zip` - ZIP archive

### Linux Artifacts

- `out/make/deb/x64/diff-view_1.0.0_amd64.deb` - Debian package
- `out/make/rpm/x64/diff-view-1.0.0-1.x86_64.rpm` - RPM package

## Troubleshooting

### Common Issues

**Build fails with "Cannot find module"**

```bash
npm install
npm run postinstall
```

**Windows: "MSBuild not found"**

- Install Visual Studio Build Tools
- Or install Visual Studio Community with C++ workload

**macOS: "No signing identity found"**

- Install Xcode Command Line Tools: `xcode-select --install`
- For code signing, ensure certificates are installed in Keychain

**Linux: "Package dependencies not met"**

```bash
sudo apt-get update
sudo apt-get install build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon0 libgtk-3-dev
```

### Environment Variables

All environment variables are optional. Without code signing configuration, the application will build unsigned packages suitable for development and testing.

For production releases, code signing is highly recommended for:

- Windows: Avoiding SmartScreen warnings
- macOS: Gatekeeper compatibility and App Store distribution
- Linux: Repository inclusion and user trust

## CI/CD Integration

The build configuration supports automated builds in CI/CD environments:

```yaml
# Example GitHub Actions workflow
- name: Build for Windows
  run: npm run build:windows
  env:
    WINDOWS_CERTIFICATE_FILE: ${{ secrets.WINDOWS_CERT_FILE }}
    WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}

- name: Build for macOS
  run: npm run build:macos
  env:
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_APP_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

## Security Considerations

- Store certificates and passwords securely
- Use environment variables or secure secret management
- Never commit certificates or passwords to version control
- Regularly rotate signing certificates and passwords
- Test unsigned builds before signing for production

## Platform-Specific Notes

### Windows

- Squirrel installer provides automatic updates capability
- MSI packages can be generated by setting `noMsi: false` in forge config
- Windows Store packages require additional configuration

### macOS

- DMG provides better user experience than ZIP
- Notarization is required for macOS 10.15+ distribution
- Universal binaries (Intel + Apple Silicon) require additional configuration

### Linux

- DEB packages work on Debian, Ubuntu, and derivatives
- RPM packages work on RedHat, Fedora, SUSE, and derivatives
- AppImage format can be added for broader compatibility
- Snap and Flatpak packages require separate configuration
