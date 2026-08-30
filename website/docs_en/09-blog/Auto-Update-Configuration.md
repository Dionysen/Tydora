---
title: Auto Update Configuration
tags: [settings]
---

# Auto Update Configuration

Inimark supports automatic updates: when a user launches the app, it automatically checks for and installs the latest version. This document explains how to configure the signing keys required for automatic updates.

## How It Works

1. When the developer builds the app, the installer is signed using a private key
2. The build artifacts include a `.sig` signature file and `latest.json` version information
3. When the user launches the app, Tauri downloads `latest.json` from GitHub Releases
4. After verifying the signature, it automatically downloads and installs the update

## Generating Signing Keys

### Installing minisign

```bash
# Windows (using scoop)
scoop install minisign

# macOS
brew install minisign

# Linux
sudo apt install minisign
```

### Generating a Key Pair

```bash
minisign -G -s ~/.tauri/inimark.key -p ~/.tauri/inimark.key.pub
```

You will be prompted to enter a password; this password becomes `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

This generates two files:
- `~/.tauri/inimark.key` — private key (keep secret)
- `~/.tauri/inimark.key.pub` — public key (public)

## Configuring GitHub Secrets

### Steps

1. Open the `zuorn/Inimark` repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret name | Value | Description |
|------------|-----|------|
| `TAURI_SIGNING_PRIVATE_KEY` | Private key file contents | The output of `cat ~/.tauri/inimark.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | The password set when generating the key | Optional; leave empty if no password was set |

### Copying the Private Key Contents

```bash
# Windows
type %USERPROFILE%\.tauri\inimark.key

# macOS / Linux
cat ~/.tauri/inimark.key
```

Paste the complete output into the GitHub Secret.

## Configuring the Public Key

Configure the public key in `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "pubkey": "<public key contents>",
      "endpoints": [
        "https://github.com/zuorn/Inimark/releases/latest/download/latest.json"
      ]
    }
  }
}
```

The public key contents can be obtained with the following command:

```bash
# Windows
type %USERPROFILE%\.tauri\inimark.key.pub

# macOS / Linux
cat ~/.tauri/inimark.key.pub
```

## Build Artifacts

Once configured, Release builds automatically generate the following files:

| File | Description |
|------|------|
| `Inimark_x.x.x_x64-setup.exe` | Windows installer |
| `Inimark_x.x.x_x64-setup.exe.sig` | Windows signature file |
| `Inimark_aarch64.app.tar.gz` | macOS ARM installer |
| `Inimark_aarch64.app.tar.gz.sig` | macOS ARM signature file |
| `Inimark_amd64.AppImage` | Linux installer |
| `Inimark_amd64.AppImage.sig` | Linux signature file |
| `latest.json` | Version information (read automatically by Tauri) |

## Verifying the Configuration

### Local Verification

```bash
# Build the app
npm run tauri build

# Check whether .sig files were generated
ls src-tauri/target/release/bundle/nsis/*.sig
```

### GitHub Actions Verification

1. Push to the `release` branch or trigger Actions manually
2. Review the build logs to confirm there are no signing-related errors
3. Check that the Release contains the `.sig` files and `latest.json`

## Frequently Asked Questions

### Q: Build fails with a signing error

Make sure the value of `TAURI_SIGNING_PRIVATE_KEY` contains the complete private key contents, including the part that begins with `untrusted comment:`.

### Q: Users cannot auto-update

Check whether `latest.json` is accessible:
```
https://github.com/zuorn/Inimark/releases/latest/download/latest.json
```

### Q: How do I change the key

1. Generate a new key pair with `minisign -G`
2. Update the private key in the GitHub Secrets
3. Update the public key in `tauri.conf.json`
4. Rebuild and publish

## Related Documents

- [[01-Getting-Started/02-About]] — Version information
- [[07-Settings/01-General-Settings]] — Application settings
