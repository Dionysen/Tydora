#Requires -Version 5.1
<#
.SYNOPSIS
  构建 Tydora 的 MSIX 包（用于提交到微软商店）。

.DESCRIPTION
  1. 读取 VERSION 文件得到 4 段版本号
  2. 用 tauri build --no-bundle 编译出原始 exe（前端已内嵌）
  3. 把 exe + 图标 + 处理后的 AppxManifest.xml 整理到暂存目录
  4. 调用 Windows SDK 的 MakeAppx.exe 打包成未签名的 .msix
     （商店会在认证时签名，因此提交的包不需要签名）

.PARAMETER PackageIdentityName
  商店分配的包标识名（Partner Center > Product identity > Package/Identity/Name）。
  未传则读取环境变量 MSSTORE_PACKAGE_IDENTITY_NAME。

.PARAMETER Publisher
  商店分配的发布者（形如 CN=...）。
  未传则读取环境变量 MSSTORE_PUBLISHER。

.PARAMETER Version
  覆盖版本号。默认读取仓库根的 VERSION 文件并补成 4 段。

.PARAMETER SkipBuild
  跳过 tauri build，直接用已存在的 exe 打包（本地快速测试用）。

.EXAMPLE
  ./scripts/build-msix.ps1
  ./scripts/build-msix.ps1 -PackageIdentityName "1234567890.Tydora" -Publisher "CN=ABCD-1234"
#>
[CmdletBinding()]
param(
    [string]$PackageIdentityName = $env:MSSTORE_PACKAGE_IDENTITY_NAME,
    [string]$Publisher = $env:MSSTORE_PUBLISHER,
    [string]$Version,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# ── 1. 版本号 ─────────────────────────────────────────────────────────────
if (-not $Version) {
    $Version = (Get-Content "$repoRoot/VERSION" -Raw).Trim()
}
$parts = $Version.Split('.')
if ($parts.Count -eq 3) {
    $Version = "$Version.0"
}
elseif ($parts.Count -lt 3 -or $parts.Count -gt 4) {
    throw "VERSION 必须是 3 或 4 段（X.Y.Z[.W]），当前：$Version"
}
foreach ($p in $parts) {
    if ($p -gt 65535) { throw "MSIX 版本每段不能超过 65535：$Version" }
}
Write-Host "MSIX version: $Version" -ForegroundColor Cyan

# ── 2. 商店身份标识 ───────────────────────────────────────────────────────
if (-not $PackageIdentityName) { throw "缺少 PackageIdentityName（参数或 MSSTORE_PACKAGE_IDENTITY_NAME 环境变量）" }
if (-not $Publisher) { throw "缺少 Publisher（参数或 MSSTORE_PUBLISHER 环境变量）" }
Write-Host "Identity Name: $PackageIdentityName"
Write-Host "Publisher:     $Publisher"

# ── 3. 编译 Tauri（仅 exe，不打包安装器）─────────────────────────────────
if (-not $SkipBuild) {
    Write-Host "`n==> Building Tauri app (--no-bundle)..." -ForegroundColor Green
    npm run tauri -- build --no-bundle
    if ($LASTEXITCODE -ne 0) { throw "tauri build 失败（exit $LASTEXITCODE）" }
}

# ── 4. 定位构建产物 exe ───────────────────────────────────────────────────
$releaseDir = "$repoRoot/src-tauri/target/release"
$appExe = Join-Path $releaseDir "tydora.exe"
if (-not (Test-Path $appExe)) {
    # 兜底：取 release 目录下最大的 exe（排除构建工具）
    $candidates = Get-ChildItem -Path "$releaseDir/*.exe" -ErrorAction SilentlyContinue |
        Where-Object { $_.Length -gt 1MB } |
        Sort-Object Length -Descending
    if (-not $candidates) { throw "在 $releaseDir 找不到 app exe" }
    $appExe = $candidates[0].FullName
    Write-Host "exe 名称不是 tydora.exe，使用：$appExe"
}
$exeName = Split-Path $appExe -Leaf
Write-Host "App exe: $appExe ($([math]::Round((Get-Item $appExe).Length / 1MB, 2)) MB)"

# ── 5. 准备暂存目录 ───────────────────────────────────────────────────────
$staging = "$repoRoot/src-tauri/target/msix-staging"
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging -Force | Out-Null
New-Item -ItemType Directory -Path "$staging/Assets" -Force | Out-Null

# ── 6. 生成 AppxManifest.xml（替换占位符）─────────────────────────────────
# 用 String.Replace 而非 -replace，避免 Publisher（形如 CN=...）里的字符被当作正则
$manifestTemplate = Get-Content "$repoRoot/src-tauri/msix/AppxManifest.xml" -Raw
$manifest = $manifestTemplate
$manifest = $manifest.Replace('{{PACKAGE_IDENTITY_NAME}}', $PackageIdentityName)
$manifest = $manifest.Replace('{{PUBLISHER}}', $Publisher)
$manifest = $manifest.Replace('{{VERSION}}', $Version)

# 若 exe 名不是 tydora.exe，同步修改 manifest 里的 Executable
if ($exeName -ne "tydora.exe") {
    $manifest = $manifest.Replace('Executable="tydora.exe"', "Executable=`"$exeName`"")
}

$manifestPath = "$staging/AppxManifest.xml"
[System.IO.File]::WriteAllText($manifestPath, $manifest, (New-Object System.Text.UTF8Encoding($true)))
Write-Host "AppxManifest.xml written"

# ── 7. 复制 exe 和图标 ────────────────────────────────────────────────────
Copy-Item $appExe "$staging/" -Force

$iconSrc = "$repoRoot/src-tauri/icons"
$icons = @(
    "StoreLogo.png", "Square30x30Logo.png", "Square44x44Logo.png",
    "Square71x71Logo.png", "Square89x89Logo.png", "Square107x107Logo.png",
    "Square142x142Logo.png", "Square150x150Logo.png", "Square284x284Logo.png",
    "Square310x310Logo.png"
)
$copied = 0
foreach ($icon in $icons) {
    $src = Join-Path $iconSrc $icon
    if (Test-Path $src) {
        Copy-Item $src "$staging/Assets/" -Force
        $copied++
    }
}
Write-Host "Copied $copied icons to Assets/"

# ── 8. 定位 MakeAppx.exe ──────────────────────────────────────────────────
$makeAppx = $null
$sdkRoot = "C:\Program Files (x86)\Windows Kits\10"
if (Test-Path $sdkRoot) {
    # 取最新 SDK 版本里的 x64 makeappx
    $binDirs = Get-ChildItem "$sdkRoot\bin" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending
    foreach ($dir in $binDirs) {
        $candidate = Join-Path $dir.FullName "x64\makeappx.exe"
        if (Test-Path $candidate) { $makeAppx = $candidate; break }
    }
}
if (-not $makeAppx) {
    $makeAppx = (Get-Command makeappx.exe -ErrorAction SilentlyContinue).Source
}
if (-not $makeAppx) {
    throw "找不到 MakeAppx.exe，请安装 Windows SDK（Windows Software Development Kit）。"
}
Write-Host "MakeAppx: $makeAppx"

# ── 9. 打包 ───────────────────────────────────────────────────────────────
$outDir = "$repoRoot/src-tauri/target/msix"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$msixName = "Tydora_$($Version)_x64.msix"
$msixPath = Join-Path $outDir $msixName
if (Test-Path $msixPath) { Remove-Item $msixPath -Force }

Write-Host "`n==> Packing MSIX..." -ForegroundColor Green
& $makeAppx pack /d $staging /p $msixPath /o
if ($LASTEXITCODE -ne 0) { throw "MakeAppx pack 失败（exit $LASTEXITCODE）" }

Write-Host "`n✓ MSIX 已生成: $msixPath" -ForegroundColor Green
Write-Host "  大小: $([math]::Round((Get-Item $msixPath).Length / 1MB, 2)) MB"

# 输出路径供 CI 消费（GITHUB_ENV）
if ($env:GITHUB_ENV) {
    "MSIX_PATH=$msixPath" | Out-File -FilePath $env:GITHUB_ENV -Append -Encoding UTF8
    "MSIX_NAME=$msixName" | Out-File -FilePath $env:GITHUB_ENV -Append -Encoding UTF8
}

return $msixPath
