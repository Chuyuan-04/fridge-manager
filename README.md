# 🧊 冰箱托管 - 智能食材管理与菜谱推荐系统

这是一个从零构建的现代化全栈 Web 应用，旨在通过云端同步、智能分类和保质期追踪，帮助用户高效管理家庭库存，减少食物浪费。

---

## 📁 项目目录结构

```text
fridge-manager/
├── 📄 package.json                # 项目依赖、脚本配置 (新增 supabase-js)
├── 📄 vite.config.js              # Vite 构建工具配置
├── 📄 tailwind.config.js          # Tailwind CSS 样式配置
├── 📄 postcss.config.js           # PostCSS 配置（用于 Tailwind）
├── 📄 index.html                  # HTML 入口文件
├── 📄 .env                        # 环境变量（存放 Supabase 密钥，需忽略）
├── 📄 .gitignore                  # Git 忽略配置（保护私密密钥）
├── 📄 README.md                   # 项目综合说明文档
│
├── 📂 public/                     # 静态资源文件夹
│   └── favicon.ico                # 网站图标
│
└── 📂 src/                        # 源代码目录
    ├── 📄 main.jsx                # 应用入口（挂载 React 到 DOM）
    ├── 📄 App.jsx                 # 主应用组件（路由、状态管理、云端同步逻辑）
    ├── 📄 index.css               # 全局样式（包含 Tailwind 指令）
    │
    ├── 📂 config/                 # 配置目录 (NEW)
    │   └── 📄 supabaseClient.js   # Supabase 客户端初始化配置
    │
    ├── 📂 components/             # React 组件目录
    │   ├── 📄 LandingPage.jsx      # 首页/欢迎页面（含登录入口）
    │   ├── 📄 PreferencesPage.jsx  # 个性化偏好设置页面
    │   ├── 📄 IngredientsPage.jsx  # 食材录入页面（支持模板、自定义分类、云端推送）
    │   ├── 📄 MainPage.jsx         # 主页面布局容器
    │   ├── 📄 FridgePanel.jsx      # 冰箱管理面板（左侧）
    │   ├── 📄 RecipePanel.jsx      # 菜谱推荐面板（右侧）
    │   └── 📄 IngredientCard.jsx   # 食材卡片组件（含保质期颜色编码）
    │
    └── 📂 utils/                  # 工具函数目录
        ├── 📄 dateUtils.js        # 日期计算工具（过期判断、颜色映射）
        └── 📄 templates.js        # 静态模板（内置食材、示例菜谱数据）

```

---

## 📋 文件功能详解

### 🔧 配置文件

#### `package.json`

**功能：** 项目依赖管理和脚本定义

* 包含核心依赖：`react`, `lucide-react`, `@supabase/supabase-js`。
* 配置运行脚本：`dev` (本地开发), `build` (生产构建)。

#### `vite.config.js`

**功能：** Vite 开发服务器和构建配置。

#### `tailwind.config.js` & `postcss.config.js`

**功能：** Tailwind CSS 框架配置，定义了需要扫描的文件路径和主题扩展。

#### `.env` (重要)

**功能：** 存储 Supabase 的连接地址和匿名密钥，确保敏感信息不直接硬编码在代码中。

---

### 📦 核心逻辑文件

#### `src/App.jsx`

**功能：** 主应用组件（大脑）

* **路由控制**：管理 `landing` → `preferences` → `ingredients` → `main` 的页面跳转。
* **身份验证**：监听用户登录状态，实现 Magic Link 自动登录。
* **云端同步**：登录后自动从 Supabase 抓取食材和偏好设置。
* **本地备份**：结合 LocalStorage 实现数据的双重保障。

#### `src/config/supabaseClient.js`

**功能：** 初始化 Supabase 客户端，它是连接前端代码与云端数据库的桥梁。

---

### 🎨 组件文件 (`src/components/`)

#### `LandingPage.jsx`

**功能：** 首页。提供产品介绍和登录/开始入口。

#### `PreferencesPage.jsx`

**功能：** 收集口味、过敏原等饮食偏好。数据将实时同步至云端 `preferences` 表。

#### `IngredientsPage.jsx`

**功能：** 食材录入中心。

* **快速模板**：一键添加常见食材。
* **手动添加**：提供**食品类型（Category）**下拉框，支持自定义保质期和存储方式。
* **云端推送**：添加操作会触发数据库 `insert` 动作。

#### `MainPage.jsx`

**功能：** 核心布局。集成导航栏、统计信息以及左右两栏的功能面板。

#### `FridgePanel.jsx` & `IngredientCard.jsx`

**功能：** 冰箱管理。

* 展示食材列表，并根据 `dateUtils` 计算出的天数显示颜色。
* 🔴 红色：≤1天 | 🟡 黄色：≤3天 | 🟢 绿色：新鲜。

#### `RecipePanel.jsx`

**功能：** 个性化菜谱。根据冰箱现有食材和用户偏好，智能推荐今日食谱，并在使用后自动扣除库存。

---

### 🛠️ 工具函数 (`src/utils/`)

#### `dateUtils.js`

**核心算法：**

* `getDaysLeft`: 计算从购买日到过期日的剩余天数。
* `getStatusColor`: 将天数转换为对应的 Tailwind CSS 颜色类名。

#### `templates.js`

**数据基础：**

* `quickTemplates`: 预设食材数据。
* `mockRecipes`: 包含食材需求、步骤、难度的示例菜谱库。

---

## 🔄 数据流向图

1. **用户操作**（如点击“添加鸡蛋”）。
2. **React 状态更新**（UI 立即响应）。
3. **云端请求发送**（Supabase 数据库执行操作）。
4. **跨设备同步**（另一台设备登录时自动拉取最新状态）。

---

## 🎯 核心状态结构

### 1. `preferences` (用户偏好)

```javascript
{
  tastes: [],           // 口味
  quickMeals: false,    // 快手菜偏好
  allergens: [],        // 过敏原
  dietType: [],         // 饮食类型
  considerNutrition: false 
}

```

### 2. `ingredients` (食材列表)

```javascript
{
  id: "uuid",
  name: "食材名称",
  category: "肉类/蔬菜/...",
  amount: 6,
  purchase_date: "2026-01-10",
  shelfLife: 7
}

```

---

## 🚀 部署指南

1. **GitHub**: 提交代码到仓库（确保 `.env` 在忽略名单中）。
2. **Supabase**: 创建项目，设置 `ingredients` 和 `preferences` 数据表及 RLS 策略。
3. **Vercel**: 导入项目，并在 **Environment Variables** 中配置密钥。

---

**最后更新：** 2026-01-10
