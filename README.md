# fenglguiz · 王叔叔的分流规则

小猫咪(Clash)分流规则配置，用于聚合订阅转换。参考七尺宇 https://www.youtube.com/@qichiyu

## 订阅链路

```
机场原订阅 → jk.linkun.dpdns.org/xcs (聚合Worker)
  └ SUBAPI: SUBAPI.cmliussss.net (subconverter 转换后端)
  └ SUBCONFIG: 本仓库 小猫咪分流规则.ini (分流规则)
→ 软路由 OpenClash / 小猫咪 App
```

## 文件

- `小猫咪分流规则.ini` — subconverter 标准 [custom] 格式规则（现役，SUBAPI 认这个）
- `配置.js` — 聚合 Worker 源码（cmliu cfwsub）

## 分流要点

- 国内大厂（抖音/字节/腾讯系媒体）**全部直连**，规则放最前
- 漏网之鱼默认 **直连**（防国内 App 被兜底绕境外）
- 规则链接全走 **jsDelivr 镜像**，国内直连可拉
- DNS 纯国内（223.5.5.5/119.29.29.29），防 CDN 解析海外 IP

## 更新规则

直接改 `小猫咪分流规则.ini` → push 后聚合源自动生效（jsDelivr 有 ~12h 缓存，急用可在 URL 后加 `?v=日期` 或走 raw 链接）。
