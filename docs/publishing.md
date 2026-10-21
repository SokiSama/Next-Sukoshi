# 发布到 GitHub

本目录是一份独立源码，不包含个人站点的文章、照片、账号快照、环境文件、Git 历史和部署关联。指定的示例头像、文章封面及一条站长博客友链（含头像）按站长要求保留。

## 新建仓库

先在 GitHub 创建空仓库，再在这个模板目录运行：

```bash
git init -b main
git add .
git commit -m "Initial open-source blog template"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

把远程地址替换成自己的仓库地址。也可通过 GitHub Desktop 添加此目录。不要在个人博客目录执行这些命令。

可以在 GitHub 仓库设置中启用 Template repository，方便其他人用模板创建自己的仓库。

## 发布包内容

保留源码、`public/` 示例资源、`package.json`、`package-lock.json`、构建配置、文档、测试、许可和 `.env.example`。

不要打包 `node_modules/`、`.next/`、`.env.local`、日志、Git bundle 或已有的 `.git/`。安装依赖后生成的目录不属于源码包。

新增素材时保留其来源和许可说明。模板自带的 MIT 许可覆盖模板代码及 SVG 示例图，依赖按各自许可使用。

## 持续检查

仓库包含 GitHub Actions 工作流，在 push 和 pull request 时运行安装、发布检查、ESLint、类型检查、单元测试和生产构建。工作流不需要服务账号或密钥。
