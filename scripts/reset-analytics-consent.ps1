<#
.SYNOPSIS
    重置 Tydora 的匿名统计同意状态，让「首次启动同意弹窗」重新出现。
.DESCRIPTION
    - 自动关闭正在运行的 Tydora（dev 与 release 均适用）
    - 备份并删除 WebView2 的 Local Storage 目录（里面包含 tydora.analytics.consent）
    - 重新启动 Tydora 后即可看到同意弹窗

    注意：
    - localStorage 中还保存着仓库(vault)列表、最近文件、侧栏宽度、界面设置等本地配置，
      删除后这些配置会恢复默认（备份保存在 .bak 目录，可手动还原）。
    - 你的笔记文件、内容不会被影响，它们不存储在 localStorage 中。
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/reset-analytics-consent.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "==> [1/4] 关闭正在运行的 Tydora ..."
Get-Process -Name "tydora", "Tydora" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 1000

# WebView2 的 Local Storage 目录（Tauri v2 + WebView2 默认位置）
$storageDir = Join-Path $env:LOCALAPPDATA "com.tydora.editor\EBWebView\Default\Local Storage"

if (-not (Test-Path $storageDir)) {
    Write-Host "    未找到 Local Storage 目录：$storageDir"
    Write-Host "    可能从未运行过 Tydora，或路径有差异。请手动检查后重试。"
    exit 1
}

Write-Host "==> [2/4] 备份当前 Local Storage ..."
$backupDir = "$storageDir.bak"
if (Test-Path $backupDir) {
    Remove-Item -Recurse -Force $backupDir
}
Copy-Item -Recurse -Force $storageDir $backupDir
Write-Host "    已备份到：$backupDir"

Write-Host "==> [3/4] 删除 Local Storage ..."
Remove-Item -Recurse -Force $storageDir
if (-not (Test-Path $storageDir)) {
    Write-Host "    删除成功。"
} else {
    Write-Host "    删除失败：目录仍存在，可能有进程占用文件。请关闭 Tydora 后重试。"
    exit 1
}

Write-Host "==> [4/4] 完成！"
Write-Host ""
Write-Host "    现在重新启动 Tydora（例如：npm run tauri dev），即可看到首次启动的同意弹窗。"
Write-Host "    如果之后想恢复原来的本地配置，把下面的目录改回原名即可："
Write-Host "    $backupDir"
