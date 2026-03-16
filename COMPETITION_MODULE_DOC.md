# 竞赛模块全局说明文档

> 文档版本：v1.0 | 生成日期：2026-03-06 | 适用分支：main

---

## 目录

1. [模块业务逻辑概述](#1-模块业务逻辑概述)
2. [数据库表结构](#2-数据库表结构)
3. [定时任务（Cron Job）](#3-定时任务cron-job)
4. [前后端 API 接口清单](#4-前后端-api-接口清单)
5. [前端页面与组件](#5-前端页面与组件)
6. [遗留问题与下一步优化建议](#6-遗留问题与下一步优化建议)

---

## 1. 模块业务逻辑概述

### 1.1 整体架构

竞赛模块负责维护和展示全校各类学科竞赛的信息，包括竞赛名称、级别、类别、起止时间及报名方式。核心特性为**动态状态判定**与**自动跨年滚动**两大机制，确保竞赛信息无需人工干预即可常年保持准确。

### 1.2 动态状态计算规则

竞赛状态**不存储在数据库中**，而是在每次查询时由 SQL `CASE` 表达式实时计算（见 `server/controllers/competitionController.js` 中的 `DYNAMIC_STATUS_EXPR`）：

| 条件 | 计算得出的状态 |
|------|--------------|
| `start_time IS NULL` 或 `end_time IS NULL` | 返回数据库中原始的 `status` 字段值 |
| `NOW() < start_time` | `未开始`（蓝色标签） |
| `start_time <= NOW() <= end_time` | `进行中`（绿色标签） |
| `end_time < NOW() < end_time + 2个月` | `已结束`（灰色标签） |
| `NOW() >= end_time + 2个月` | 由定时任务将日期滚入下一年度，状态变回 `未开始` |

**设计意图**：避免运维人员每年手动修改数百条赛事数据。只需初次录入正确的起止时间，此后由定时任务自动维护。

### 1.3 自动跨年滚动机制

当一个赛事的 `end_time` 已过去超过 **2 个月**时，定时任务（每天凌晨 2:00 运行）会自动将其 `start_time` 和 `end_time` 各向后推进 **1 年**，并将 `needs_review` 标记置为 `1`，提示管理员核查滚动后的日期是否准确。

**流程示意**：
```
end_time 已过 2 个月
    ↓
Cron Job 触发
    ↓
start_time += 1 year, end_time += 1 year
needs_review = 1
    ↓
管理员在"赛事时间审核"页面核对并确认
    ↓
needs_review = 0，进入下一轮循环
```

---

## 2. 数据库表结构

### 2.1 competitions 表

> 注意：该表不在 `server/database.sql` 的初始建表脚本中，需通过迁移脚本单独创建（参见 `server/migrations/seed_competitions.sql`）。

```sql
CREATE TABLE competitions (
  id               INT          PRIMARY KEY AUTO_INCREMENT,
  name             VARCHAR(500) NOT NULL COMMENT '竞赛名称',
  organizer        TEXT                  COMMENT '主办单位',
  level            VARCHAR(50)           COMMENT '级别：National / Provincial / 一级 / 二级 等',
  status           VARCHAR(50)           COMMENT '原始状态（仅当时间字段为空时使用）',
  description      LONGTEXT              COMMENT '竞赛介绍（支持 Markdown）',
  deadline         VARCHAR(50)           COMMENT '报名截止日期（人类可读字符串，如 2026-07-15）',
  entry_method     TEXT                  COMMENT '参赛方式说明',
  official_website VARCHAR(500)          COMMENT '官方网站 URL',
  participants     VARCHAR(200)          COMMENT '参赛规模描述（如 "420万+ 项目"）',
  category         VARCHAR(200)          COMMENT '竞赛类别（英文分类标签，如 "Computer Science"）',
  timeline         TEXT                  COMMENT '赛程时间轴（可选补充字段）',

  -- ★ 动态状态与跨年滚动的核心字段 ★
  start_time       DATE                  COMMENT '报名/赛事开始时间（用于动态状态计算）',
  end_time         DATE                  COMMENT '报名/赛事结束时间（用于动态状态计算）',
  needs_review     TINYINT(1) DEFAULT 0  COMMENT '跨年滚动后置 1，管理员核对后清零',

  created_at       TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2 关键字段说明

| 字段 | 类型 | 作用 |
|------|------|------|
| `start_time` | DATE | 动态状态"未开始/进行中"的判断依据 |
| `end_time` | DATE | 动态状态"已结束"与"跨年触发"的判断依据 |
| `needs_review` | TINYINT(1) | 定时任务滚动后置 1；管理员核对后由 API 置回 0 |
| `status` | VARCHAR(50) | 兜底值：当 `start_time`/`end_time` 为空时直接返回该字段 |
| `category` | VARCHAR(200) | 英文分类标签，前端按 `CATEGORY_GROUPS` 映射为中文大类 |
| `level` | VARCHAR(50) | 前端映射：`National`→国家级，`Provincial`→省级 |

---

## 3. 定时任务（Cron Job）

### 3.1 文件位置

```
server/jobs/competitionRollover.js
```

### 3.2 触发时间

每天 **凌晨 02:00**（服务器本地时间），使用 `node-cron` 实现：

```js
cron.schedule('0 2 * * *', rolloverCompetitions);
```

### 3.3 执行逻辑（伪代码）

```
1. 查询所有 end_time < NOW() - 2个月 的竞赛
2. 对每条记录：
   a. start_time = DATE_ADD(start_time, INTERVAL 1 YEAR)
   b. end_time   = DATE_ADD(end_time,   INTERVAL 1 YEAR)
   c. needs_review = 1
3. 输出日志：本次滚动了 N 条记录
```

### 3.4 注册位置

在 `server/index.js` 中引入并启动：

```js
require('./jobs/competitionRollover');
```

---

## 4. 前后端 API 接口清单

### 4.1 后端接口（前缀：`/api/competitions`）

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/` | 公开 | 获取竞赛列表（支持 `category`/`level`/`status`/`search` 筛选），返回动态状态 |
| `GET` | `/:id` | 公开 | 获取单条竞赛详情，返回动态状态 |
| `GET` | `/review/list` | 需登录 + Admin | 获取 `needs_review = 1` 的待审核竞赛列表 |
| `PUT` | `/:id/review` | 需登录 + Admin | 提交核对后的起止时间，并将 `needs_review` 置为 0 |

#### GET `/` 返回示例

```json
[
  {
    "id": 1,
    "name": "中国国际大学生创新大赛",
    "level": "National",
    "category": "Innovation/Entrepreneurship",
    "status": "未开始",          // 动态计算结果
    "computed_status": "未开始",
    "start_time": "2026-03-01",
    "end_time": "2026-07-15",
    "needs_review": 0
  }
]
```

#### PUT `/:id/review` 请求体

```json
{
  "start_time": "2026-03-01",
  "end_time": "2026-07-15"
}
```

#### PUT `/:id/review` 成功响应

```json
{ "success": true, "message": "审核完成，时间已更新" }
```

### 4.2 前端 API 调用（`src/services/api.js`）

| 调用 | 页面/文件 | 说明 |
|------|-----------|------|
| `api.get('/competitions')` | `Competitions.jsx` | 获取全部竞赛用于列表展示 |
| `api.get('/competitions/:id')` | `CompetitionDetail.jsx` | 获取竞赛详情 |
| `api.get('/competitions/review/list')` | `CompetitionReview.jsx` | 获取待审核列表 |
| `api.put('/competitions/:id/review', body)` | `CompetitionReview.jsx` | 提交时间核对 |

---

## 5. 前端页面与组件

### 5.1 竞赛列表页 — `src/pages/Competitions.jsx`

- URL: `/competitions`
- 功能：分类侧边栏（5 大类）+ 搜索框 + 分页表格
- **状态标签颜色规则**（`getStatusBadge` 函数）：

  | 状态值 | Badge 颜色 | Bootstrap variant |
  |--------|-----------|-------------------|
  | `进行中` | 绿色 | `success` |
  | `未开始` | 蓝色 | `primary` |
  | `已结束` | 灰色 | `secondary` |

- 兼容后端返回中文（`进行中`）和旧英文值（`ongoing`）两种格式。

### 5.2 竞赛详情页 — `src/pages/CompetitionDetail.jsx`

- URL: `/competitions/:id`
- 功能：展示竞赛完整介绍（含 Markdown 渲染）、参赛方式、官网链接。

### 5.3 赛事时间审核页 — `src/pages/CompetitionReview.jsx` ⭐ 新增

- URL: `/admin/competition-review`
- 权限：仅 Admin
- 功能：
  - 展示所有 `needs_review = 1` 的竞赛列表
  - 每行有"核对时间"按钮，点击弹出 Modal
  - Modal 内含开始时间 / 结束时间 DatePicker
  - 确认保存后调用后端 PUT 接口，刷新列表
- 入口：侧边栏管理员专属菜单「赛事时间审核」

### 5.4 后台用户管理页 — `src/pages/AdminDashboard.jsx`

- URL: `/admin`
- 功能：查看/删除所有注册用户。

### 5.5 侧边栏 — `src/components/Sidebar.jsx`

- 管理员登录后额外显示：
  - 🛡️ 后台管理 → `/admin`
  - 📋 赛事时间审核 → `/admin/competition-review`

---

## 6. 遗留问题与下一步优化建议

### 6.1 当前已知问题

| # | 问题描述 | 影响范围 |
|---|----------|----------|
| 1 | `competitions` 表不在主 `database.sql` 建表脚本中，Docker 首次部署需手动执行 `seed_competitions.sql` | 新环境初始化 |
| 2 | `start_time` / `end_time` 字段类型为 `DATE`，精度不足以区分同一天内的开始/结束，若将来支持精确到小时的赛程需改为 `DATETIME` | 数据精度 |
| 3 | 前端 `Competitions.jsx` 的 `category` 分组使用硬编码的英文标签映射表，新增竞赛类别时需同步更新前端代码 | 可维护性 |
| 4 | `getReviewList` 接口路由为 `GET /competitions/review/list`，与 `GET /competitions/:id` 之间有潜在冲突（已通过注册顺序规避，但需长期注意） | 路由健壮性 |
| 5 | 定时任务每次滚动不记录历史，无法追溯某竞赛被滚动了几次 | 可追溯性 |

### 6.2 下一步优化建议

#### 优先级 High

- **将竞赛表并入主 `database.sql`**，确保 `docker-compose up` 一键完成全部初始化，零人工干预。
- **增加竞赛 CRUD 管理界面**：目前竞赛数据全部通过 SQL 种子文件导入，无法在后台添加/编辑单条竞赛。建议在 `AdminDashboard` 下新增竞赛管理子页面（包含新增、编辑、删除功能）。

#### 优先级 Medium

- **滚动历史日志**：在 `audit_logs` 表中记录每次跨年滚动的 `竞赛ID → 旧时间 → 新时间`，便于溯源。
- **needs_review 批量核对**：当前只能逐条核对，可增加"批量确认"按钮，提升效率。
- **邮件/站内通知**：定时任务完成滚动后，自动向所有 Admin 发送待审核提醒邮件。

#### 优先级 Low

- **竞赛类别后端化**：将 `CATEGORY_GROUPS` 映射表从前端代码移至数据库，通过 API 动态获取，避免新增类别需重新部署前端。
- **状态筛选联动**：在竞赛列表页增加状态下拉筛选（进行中/未开始/已结束），直接调用后端 `?status=进行中` 参数，减少前端数据量。
- **竞赛收藏功能**：允许用户收藏感兴趣的竞赛，并在首页"我的关注"模块快速访问。

---

*文档由 AI 辅助生成，如有字段变更请同步更新本文档。*
