## ⚠️ 一次性手动设置（微软硬性要求）
微软商店规定 首个版本必须手动上传 ，之后才能用 CI 自动发布后续版本。步骤：

1. 在 Partner Center 注册开发者账号（现在个人/公司都免费）
2. 新建产品 → 选 MSIX 或 PWA 应用 → 保留 "Tydora" 名称
3. 在 Product identity 页拿到三个值：
   - Package/Identity/Name （形如 1234567890.Tydora ）
   - Package/Identity/Publisher （形如 CN=XXXX-XXXX-... ）
   - Product ID （Store product ID，用于 msstore publish -id ）
4. 本地用上面的身份构建 MSIX 并手动上传首个版本：
5. 在 Partner Center 关联 Microsoft Entra ID 租户，注册一个 Entra 应用并赋予 Manager 角色
## 配置 GitHub Secrets / Variables
首个版本过审上架后，在仓库 Settings → Secrets and variables → Actions 配置：

Secrets （敏感）：

- AZURE_AD_TENANT_ID 、 AZURE_AD_APPLICATION_CLIENT_ID 、 AZURE_AD_APPLICATION_SECRET 、 SELLER_ID
Variables （非敏感，用于控制发布开关）：

- MSSTORE_PACKAGE_IDENTITY_NAME 、 MSSTORE_PUBLISHER 、 MSSTORE_PRODUCT_ID 关键点： msstore.yml 中发布步骤用 if: vars.MSSTORE_PRODUCT_ID 门控。 只要不配 MSSTORE_PRODUCT_ID 变量，工作流只会构建 MSIX 并附到 Release，不会尝试发布 ——所以你现在就能推 tag 验证 MSIX 打包是否成功，等手动上架后再开启自动发布。
## 工作原理
打 v* 标签 → msstore.yml 在 windows-latest 上： tauri build --no-bundle 出原始 exe（前端已内嵌）→ 暂存 exe+图标+清单 → MakeAppx 打包 → 上传 artifact + 附到 Release →（配了变量时） msstore publish 提交商店。与现有 release.yml （NSIS/MSI/macOS/Linux）并行互不干扰。

Sources:

- Publishing app updates to Microsoft Store with GitHub Actions
- MakeAppx.exe 文档