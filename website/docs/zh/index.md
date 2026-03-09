---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "SnapPerf"
  tagline: SnapPerf 是一个 Android 应用程序，旨在为应用和系统提供更深层次的控制。
  actions:
    - theme: brand
      text: 开始使用
      link: /zh/guide/what-is-snapperf
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/fahrez182/SnapPerf
    - theme: alt
      text: 下载
      link: https://github.com/fahrez182/SnapPerf/releases

features:
  - icon: 🖥️
    title: Shell 执行器
    details: 直接从应用中运行 shell 命令，支持 <b>ADB/非 Root</b> 和可选的 Root 执行。
  - icon: ⚡
    title: 插件（非 Root 模块）
    details: 使用不需要 root 权限的第三方模块扩展 SnapPerf。
    link: ./plugin/what-is-plugin
  - icon: 🌐
    title: WebUI（非 Root 版本）
    details: 通过基于 Web 的交互界面执行 shell 命令。
    link: ./plugin/what-is-plugin/#webui
---