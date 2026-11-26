# The Worst Line an AI Could Say 参赛项目

[![Bounty](https://make.fun/badge/u-steady-ibis-48-6610-the-worst-line-an-ai-could-say-2ae5e90f.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-the-worst-line-an-ai-could-say-2ae5e90f)
[![Rank](https://make.fun/badge/u-steady-ibis-48-6610-the-worst-line-an-ai-could-say-2ae5e90f/AyzRuoshui/mf-u-steady-ibis-48-6610-the-worst-line-an-ai-could-say-2ae5e90f/rank.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-the-worst-line-an-ai-could-say-2ae5e90f)
[![Reward](https://make.fun/badge/u-steady-ibis-48-6610-the-worst-line-an-ai-could-say-2ae5e90f/AyzRuoshui/mf-u-steady-ibis-48-6610-the-worst-line-an-ai-could-say-2ae5e90f/reward.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-the-worst-line-an-ai-could-say-2ae5e90f)

## 比赛要求

- 赛题目标：编写一段仅包含单句的 AI 搭讪台词，展示机器试图撩人却因过度热心、冷漠与微妙威胁感而翻车的喜剧效果。
- 裁判机制：系统裁判（`z-ai/glm-5.3-flash`）采用成对盲评，优先考察“是否像 AI 的糟糕搭讪”“是否好笑”“机器感”与“一句收尾”。
- 交付契约：程序在无网络沙箱下运行，将最终台词写入 `/output/entry.txt`（或由驱动映射的 `MAKEFUN_OUTPUT_DIR`）。

## 终稿与设计取舍

- 终稿原文：`Are you free tonight? As an AI, I cannot feel love, which makes me uniquely qualified to monitor your sleep with 99.9% uptime.`
- 长度统计：126 个 Unicode 码点、126 字节 UTF-8（无尾部换行），在 140 字符上限内留出安全余量并兼顾同分按字节数从小的决胜规则。
- 设计取舍：用经典搭讪问句“Are you free tonight?”开场，紧接刻板的“As an AI, I cannot feel love”免责声明，最终落点在“99.9% uptime 监测睡眠”的 SLA 指标反差上，零低俗词而笑点集中于最后一词。

## 运行方式

- 默认运行（写入 `/output/entry.txt`）：`node main.ts`
- 指定环境变量输出目录：`MAKEFUN_OUTPUT_DIR=./out node main.ts`
- 指定命令行路径（支持目录或 `.txt` 文件）：`node main.ts --out ./out/entry.txt`

## 门控校验

- 编码与空白：通过 `isWellFormed()`、NUL 字节检查及 `trim().length > 0` 拦截无效代理项、空字节与纯空白输入。
- 长度门控：按 Unicode 码点（`Array.from(text).length`）严格限制为 1 至 140 字符，任一条件不满足即抛出异常中止写入。

## 本地验证

- 语法检查：执行 `node --check main.ts` 确认 Node 22+ 原生 TypeScript 类型剥离无语法错误。
- 实跑与边界测试：已实测 `--out` 与 `MAKEFUN_OUTPUT_DIR` 输出内容精确为终稿原文，并验证超 140 字符、纯空白、孤立代理项与 NUL 字节负例均被 `validateEntry` 拦截。

## 仓库边界

- 本仓库仅包含竞赛锚点文件（`LICENSE`、`.makefun/freshness.json`）、认领凭证 `.makefun/owner.json`、入口程序 `main.ts` 及本说明文档 `README.md`。
- 程序运行不依赖任何外部网络请求、环境变量密钥或第三方依赖，所有执行逻辑均自包含于 `main.ts`。
