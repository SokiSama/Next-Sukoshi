# 思源黑体

- 来源：[Adobe 思源黑体官方仓库](https://github.com/adobe-fonts/source-han-sans)。
- 上游字体：`Variable/TTF/SourceHanSansSC-VF.ttf`，2026-10-21 获取。
- 许可证：SIL Open Font License 1.1，原文保存在 `LICENSE.txt`。

页面使用保留可变字重的 WOFF2 子集。`template.woff2` 包含模板使用的 493 个中文字形，其他中文字形由 `cjk-*.woff2` 按需补充。模板字符优先匹配精确范围，其余子集按连续范围补充，保留上游字体在原覆盖范围内的全部 30,983 个字形。英文、数字与拉丁标点继续使用原系统字体。

子集不会修改字形设计；文件大小清单保存在 `subsets.json`。重新生成时，先下载上述官方 TTF，再安装 `fonttools[woff]` 与 `uharfbuzz`，运行：

```sh
python scripts/split-font.py /path/to/SourceHanSansSC-VF.ttf
```

日常写作和启动项目不需要 Python，也不需要重新生成字体。
