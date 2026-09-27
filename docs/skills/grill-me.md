---
title: grill-me
description: 通过设计树和分轮追问，把计划或设计里的隐含决策问到达成共识。
date: 2026-09-26
---

# grill-me

`grill-me` 是一个用户主动触发的访谈入口，用来把计划、设计或重要决策里的分支逐项问清楚。它负责澄清和压力测试，不负责替你直接实现；所有分支都收敛、双方形成共识并得到确认后，才进入后续执行。

这篇记录根据 [skills.sh 的 grill-me 页面](https://www.skills.sh/mattpocock/skills/grill-me) 和上游仓库的公开文件整理。当前没有本地完整实战记录，示例用于说明工作方式，不当作已经验证过的项目结论。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 记录日期 | 2026-09-26 |
| Skill 名称 | `grill-me` |
| 来源 | [mattpocock/skills](https://github.com/mattpocock/skills) |
| 入口文件 | [`skills/productivity/grill-me/SKILL.md`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) |
| 底层能力 | `grilling` |
| 版本或提交 | `main` 分支，未锁定具体提交 |
| 自动调用 | 禁用；需要用户主动触发 |
| 使用环境 | 支持 Skills 或 Skill tool 的编码 Agent |

## 它解决什么

开发开始前，很多错误来自“以为已经说清楚”，而不是代码本身。`grill-me` 把一个目标拆成设计决策树：每个决定继续展开它依赖的子决定，直到目标、范围、约束、取舍和验收标准都能被复述。

它尤其适合：

- 功能开始前的需求澄清和范围收敛
- 页面、交互或产品方案的设计评审
- 架构选择、模块边界和技术取舍
- 改动较大、返工代价高的实施计划
- 需要把隐含假设暴露出来的讨论

它不适合已经完全明确的单行修复、简单查值或只需要执行既定方案的任务。此时直接执行或使用专门的调试流程更省时间。

## `grill-me` 和 `grilling`

两者是入口和实现的关系：

- `grill-me` 是用户调用的入口，上游文件将自动调用设为禁用，并把能力交给 `grilling`。
- `grilling` 是实际执行访谈的可复用能力，负责设计树、分轮问题和共识确认。
- 在支持斜杠命令的 Agent 里，通常使用 `/grill-me`；在支持 Skill tool 的环境里，调用名是 `grilling`。具体入口以宿主 Agent 的安装方式为准。

## 安装与准备

按 skills.sh 页面安装单个 Skill：

```bash
npx skills add https://github.com/mattpocock/skills --skill grill-me
```

也可以按上游仓库 README 安装技能集合，再在选择步骤中选 `grill-me`：

```bash
npx skills@latest add mattpocock/skills
```

开始访谈前，准备三类信息即可：想达成的目标、已知约束，以及你已经做出的决定。代码、文件和配置等可由 Agent 检查的事实，不要为了“喂上下文”而手工猜测或重复描述。

## 实际用法

### 输入与操作

先主动触发入口，并说明访谈边界。例如：

```text
/grill-me

我准备重做首页 Hero 区域。
目标是让首屏更像一卷展开的山水，桌面和手机都要稳定。
请先围绕目标、内容层级、滚动方式、响应式约束和验收标准进行访谈。
每轮只讨论当前已经具备前置条件的问题；先不要改代码，等共识确认后再执行。
```

如果环境没有 `/grill-me`，但提供了 Skill tool，可以调用 `grilling`，并把同样的目标、约束和暂停条件传进去。

### 分轮访谈

`grilling` 不是想到一个问题问一个问题，而是按设计树的 frontier（当前可回答的问题集合）分轮推进：

1. 把目标拆成决策树，列出相互依赖的决定。
2. 找出前置条件已经确定的 frontier。
3. 在同一轮把整个 frontier 一次问完；每题编号，并给出推荐答案。
4. 等用户回答这一轮，再根据答案重新计算下一轮 frontier。
5. 依赖尚未回答的问题，留到后续轮次，不提前猜答案。
6. frontier 为空后，先复述双方的共同理解，等用户确认，再进入执行。

一轮问题的形状大致如下：

```text
❓ Q1 - 目标边界：这次改动必须解决什么，哪些内容明确不在范围内？

➡️ 建议答案：先只调整首屏信息层级和滚动节奏，不改资料卡片的数据结构。

---

❓ Q2 - 验收方式：怎样算“稳定”？要检查哪些尺寸和状态？

➡️ 建议答案：至少检查桌面宽屏、窄桌面和手机竖屏，并确认滚动到底部后落款不被遮挡。
```

### 输出与效果

一次完整访谈应留下这些结果：

- 已确认的目标、范围、约束和验收标准
- 仍未决定的分支，以及它们为什么要晚一轮讨论
- 每轮问题和用户选择，避免决策在后续实现中丢失
- 一份可复述的共同理解，作为执行前的检查点

它不会因为访谈开始就自动修改代码。实现、测试或发布仍需要后续明确的执行步骤和授权。

## 踩坑与解决

- **误以为每轮只能问一个问题。** 上游规则要求一轮把当前 frontier 全部问完；只有依赖未决答案的问题才放到下一轮。
- **把事实问题丢给用户。** 文件、代码和环境能直接查到的内容，应由 Agent 自己检查，必要时派子 Agent 查证。
- **问题顺序反了。** 先问目标和范围，再问方案与技术取舍；依赖关系没有理顺时，不要急着问实现细节。
- **访谈结束就开始改代码。** frontier 为空只是问题问完，还要先复述共同理解并等待用户确认。
- **把示例当成实战结论。** 本页目前是基于上游公开说明的整理，尚未记录本地完整安装、执行和验证结果。

## 使用心得

目前可以确认的优点是：它把“感觉差不多”变成了可追踪的决策树，并强制把推荐答案和用户选择放在同一轮里比较。真正使用时，仍应人工检查推荐答案是否符合业务语境，尤其是范围、数据边界和验收标准。

建议每轮回答后顺手记录三件事：已经确定的决定、被排除的选项、下一轮解锁了哪些问题。这样后续转入规格、任务或代码实现时，不必重新猜测上下文。

## 项目实战

暂未记录本地项目中完整走通的一次 `grill-me` 会话。后续有真实案例时，再补充目标、问题轮次、最终决策和验证结果，不把假设写成结论。

## 参考资料

- [skills.sh：mattpocock/skills/grill-me](https://www.skills.sh/mattpocock/skills/grill-me)
- [`grill-me/SKILL.md`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md)
- [`grilling/SKILL.md`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)
- [mattpocock/skills README](https://github.com/mattpocock/skills#readme)
