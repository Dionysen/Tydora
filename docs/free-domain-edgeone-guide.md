# 免费域名申请 + EdgeOne 绑定指南

> 更新时间：2026-08-17
> 适用场景：Tydora 网站（EdgeOne Pages 已部署）获取一个**永久公开的自定义域名**，不花钱、不备案。

---

## 一、先认清现实（重要）

1. **免费域名无法完成工信部备案**（备案要求国内注册商 + 实名，免费域名全在海外）。
2. EdgeOne 项目如果加速区域为"全球（含中国大陆）"，绑定域名**必须已备案**。
3. 所以免费域名唯一能走的路径是：**加速区域改为"不含中国大陆"（`-a overseas`）+ 绑定免费域名**。
4. 代价：国内访问不再走国内加速节点（绕路），但**地址永久公开、稳定可访问**，且拥有自定义域名。

> 如果未来想要"国内加速 + 公开访问"，唯一路径是购买域名（首年约 10 元）+ 工信部备案（1-2 周），见文末。

---

## 二、申请免费域名（二选一）

### 方式 A：is-a.dev（推荐，快，几分钟到几小时）

专为开发者提供的免费子域名 `你的名字.is-a.dev`，申请方式 = 给 GitHub 仓库提 PR。

1. 打开仓库：[is-a-dev/register](https://github.com/is-a-dev/register)
2. 点击 **Fork** 到自己的 GitHub 账号下
3. 在 fork 后的仓库里创建目录 `domains/<你的域名>/`，添加一个 `index.json` 文件，内容模板：

   ```json
   {
     "owner": {
       "username": "zuorn",
       "email": "你的GitHub邮箱"
     },
     "record": {
       "CNAME": "tydora-kqhejlta.edgeone.cool"
     }
   }
   ```

4. 提交并创建 **Pull Request**，标题写 `Requesting <你的域名>.is-a.dev`
5. 等待机器人审核（一般几分钟到 1 天），合并后域名即生效

> 注意：`record.CNAME` 要指向 EdgeOne 给你的目标地址（绑定域名时控制台会给，见第三节）。可以先在控制台拿到目标地址后再填 PR。

### 方式 B：eu.org（稳定老牌，但审核慢，几天到几周）

1. 打开 [nic.eu.org](https://nic.eu.org/) 注册账号
2. 填写申请表单，选择你想要的 `.eu.org` 域名（如 `tydora.eu.org`）
3. 提供理由（例：个人文档站 / 技术博客），等待人工审核
4. 审核通过后获得域名，可自选 DNS 服务商或使用 eu.org 自带 DNS

---

## 三、EdgeOne 侧操作

> 前提：`tydora` 项目已部署（如未部署，先执行下方第一步）。

### 第 1 步：把项目区域切到 overseas（不含中国大陆）

在项目根目录执行：

```powershell
npm run deploy:edgeone -- --name=tydora --area=overseas
```

这会重新构建并用 `overseas` 区域部署，覆盖之前的 `global` 区域项目。

### 第 2 步：控制台添加自定义域名

1. 打开 [EdgeOne Pages 控制台](https://pages.edgeone.ai) → 项目 `tydora` → 「域名管理」
2. 点击「添加自定义域名」，输入你的免费域名（如 `tydora.is-a.dev`）
3. 按弹窗提示在域名 DNS 服务商处添加解析记录，完成**归属验证**
4. 添加 **CNAME 记录**，指向 EdgeOne 提供的目标地址（如 `tydora-kqhejlta.edgeone.cool`）
5. 关联到 **Production（生产）** 环境
6. 等待 HTTPS 证书自动签发（EdgeOne 会免费托管，一般几分钟）

### 第 3 步：验证

浏览器打开 `https://你的域名`，确认：
- 首页正常显示（无 401）
- 中英文入口、文档页、图片、favicon 正常
- 无 `/Tydora/` 前缀残留（根路径构建）

---

## 四、以后发布新版本

```powershell
npm run deploy:edgeone -- --name=tydora --area=overseas
```

自动构建 + 部署，绑定域名不受影响，无需再碰控制台。

---

## 五、常见问题

| 问题 | 说明 |
|------|------|
| 访问返回 401 | 域名尚未关联生产环境，或证书未签发完，等待几分钟重试 |
| CNAME 解析不生效 | 免费域名 DNS 生效慢，用 `ping` / `nslookup` 确认解析指向 |
| 国内访问还是很慢 | 这是 `overseas` 区域的预期结果；要国内加速需购买域名 + 备案 |
| 想恢复国内加速 | 用 `--area=global` 重新部署，但绑定域名必须先备案，否则只能看 3 小时预览链接 |

---

## 六、（可选）未来正式方案：买域名 + 备案

如果网站用户以国内为主、希望体验最优：

1. 注册一个便宜域名（如 `.xyz`，首年约 10 元）
2. 走腾讯云/阿里云 **ICP 备案**（约 1-2 周）
3. 备案通过后绑定到 EdgeOne，`--area=global` 部署，国内直接加速
