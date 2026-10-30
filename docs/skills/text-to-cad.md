---
title: text-to-cad
description: 用自然语言描述产品设计，通过 build123d 和 OpenCASCADE 生成参数化 3D 模型，支持工程图、DfM 检查和制造集成。
date: 2026-10-30
---

# text-to-cad

`text-to-cad` 是一个将自然语言描述转化为参数化 3D CAD 模型的 Skill。它基于 Python 的 build123d 库和 OpenCASCADE 几何内核，让 Agent 能够直接生成可用于制造的工程级 3D 模型，支持 STEP、STL、GLB、3MF 等主流格式输出。

这篇记录根据 [GitHub 仓库](https://github.com/earthtojake/text-to-cad) 的公开信息整理。当前没有本地完整实战记录，示例用于说明工作方式，不当作已经验证过的项目结论。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 记录日期 | 2026-10-30 |
| Skill 名称 | `text-to-cad` |
| 来源 | [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) |
| 入口文件 | 仓库根目录下的插件配置 |
| 技术栈 | Python、build123d、OpenCASCADE |
| 安装方式 | Claude 插件市场或 Cursor Skills |
| 输出格式 | STEP、STL、GLB、3MF |
| 使用环境 | Claude Code、Cursor 等支持插件/Skill 的编码 Agent |

## 它解决什么

传统 3D 建模需要掌握 CAD 软件操作，从草图到实体再到工程图，学习曲线陡峭。`text-to-cad` 把这个过程变成自然语言对话：

- **快速原型**：用一句话描述零件形状，直接生成参数化模型
- **工程级输出**：生成的不是网格模型，而是基于 B-Rep 的精确几何体，可直接用于 CNC、3D 打印或注塑
- **设计迭代**：通过对话修改尺寸、倒角、孔位等参数，不必重新建模
- **制造集成**：内置 DfM（面向制造的设计）检查，提前发现工艺问题

适合的场景：

- 机械结构快速验证
- 定制化零件设计（手机壳、支架、连接件）
- 机器人部件建模（支持 URDF/SRDF 生成）
- 工程图纸自动化

不适合：复杂曲面造型（如汽车车身）、需要渲染级网格的艺术模型、或已有成熟 CAD 流程的工业场景。

## 核心能力

| 能力 | 说明 |
| --- | --- |
| 参数化建模 | 基于 build123d 的 CSG 和扫掠操作，尺寸可参数化 |
| 工程图生成 | 自动创建正交视图、剖视图、尺寸标注 |
| DfM 检查 | 钣金折弯、CNC 加工、注塑成型的工艺性校验 |
| 多格式导出 | STEP（通用 CAD）、STL（3D 打印）、GLB（Web 预览）、3MF（切片软件） |
| 机器人描述 | 生成 URDF/SRDF，用于机器人仿真和控制 |

## 安装与准备

### Claude Code 插件方式

```bash
claude plugin marketplace add earthtojake/text-to-cad#latest
```

### Cursor Skills 方式

```bash
npx skills add earthtojake/text-to-cad
```

### 环境依赖

- Python 3.9+
- build123d 库（会自动安装）
- OpenCASCADE 几何内核（build123d 的底层依赖）

安装完成后，Agent 会在对话中自动调用 build123d 生成模型脚本，无需手动编写 Python 代码。

## 实际用法

### 输入示例

```text
设计一个手机支架，要求：
- 底部有配重槽，可以放硬币
- 支撑角度 60 度
- 手机接触面有橡胶垫槽
- 整体用 PLA 3D 打印
```

Agent 会：

1. 解析需求，生成 build123d Python 脚本
2. 执行脚本，输出 STEP 和 STL 文件
3. 可选：生成工程图或预览渲染

### 迭代修改

```text
把支撑角度改成 45 度，底部加一个 USB 充电线槽
```

Agent 修改参数，重新生成模型，保留其他设计不变。

### 输出与效果

一次完整生成应留下：

1. Python 脚本（可版本控制，参数化设计源文件）
2. STEP 文件（通用 CAD 格式，可导入 SolidWorks、FreeCAD 等）
3. STL 文件（用于 3D 打印切片）
4. 可选：GLB（Web 预览）、工程图 PDF

## 踩坑与解决

- **复杂曲面性能问题**。build123d 基于 OpenCASCADE，布尔运算在复杂几何体上可能很慢。建议分解操作步骤，避免一次性做大量布尔组合。
- **尺寸精度**。参数化建模依赖精确数值，避免使用近似值（如 `3.14` 代替 `math.pi`），否则累积误差会导致装配失败。
- **DfM 检查不是万能的**。它校验几何规则（如最小壁厚、脱模角度），但不评估结构强度。关键部件仍需有限元分析。
- **导出格式选择**。STEP 用于后续 CAD 编辑，STL 用于 3D 打印，GLB 用于 Web 展示。不要混用。
- **把示例当成实战结论**。本页目前是基于上游公开文档的整理，尚未记录本地完整安装、生成和验证结果。

## 使用心得

从上游文档看，这个 Skill 最有价值的两点：一是「设计即代码」——Python 脚本可进版本库，参数化修改比 GUI 操作更可追溯；二是「制造前置」——DfM 检查在设计阶段就发现工艺问题，避免建模完成后才发现无法加工。

代价是对硬件有要求，OpenCASCADE 的几何运算在大模型上可能较慢。实际体验如何——生成速度、复杂零件稳定性、中文提示词理解——等本地跑过真实案例再补。

## 项目实战

暂未记录本地项目中完整走通的一次 `text-to-cad` 生成。后续有真实案例时，补充描述、Python 脚本、输出文件和截图，不把假设写成结论。

## 参考资料

- [earthtojake/text-to-cad 仓库](https://github.com/earthtojake/text-to-cad)
- [build123d 文档](https://build123d.readthedocs.io/)
- [OpenCASCADE 官网](https://www.opencascade.com/)
- [DfM 设计指南](https://www.protolabs.com/resources/design-manufacturing-guides/)
