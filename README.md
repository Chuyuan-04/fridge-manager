# 🧊 冰箱托管 - 项目文件结构

智能食材管理与菜谱推荐系统

---

## 📁 项目目录结构

```
fridge-manager/
├── 📄 package.json                    # 项目依赖和脚本配置
├── 📄 vite.config.js                  # Vite 构建工具配置
├── 📄 tailwind.config.js              # Tailwind CSS 配置
├── 📄 postcss.config.js               # PostCSS 配置（用于 Tailwind）
├── 📄 index.html                      # HTML 入口文件
├── 📄 .gitignore                      # Git 忽略文件配置
├── 📄 README.md                       # 项目说明文档
│
├── 📂 public/                         # 静态资源文件夹
│   └── favicon.ico                    # 网站图标
│
└── 📂 src/                            # 源代码目录
    ├── 📄 main.jsx                    # 应用入口文件（挂载 React 到 DOM）
    ├── 📄 App.jsx                     # 主应用组件（路由和状态管理）
    ├── 📄 index.css                   # 全局样式（包含 Tailwind 指令）
    │
    ├── 📂 components/                 # React 组件目录
    │   ├── 📄 LandingPage.jsx         # 首页/欢迎页面
    │   ├── 📄 PreferencesPage.jsx     # 个性化偏好设置页面
    │   ├── 📄 IngredientsPage.jsx     # 食材录入页面
    │   ├── 📄 MainPage.jsx            # 主页面（布局容器）
    │   ├── 📄 FridgePanel.jsx         # 冰箱面板（左侧）
    │   ├── 📄 RecipePanel.jsx         # 菜谱推荐面板（右侧）
    │   └── 📄 IngredientCard.jsx      # 食材卡片组件
    │
    └── 📂 utils/                      # 工具函数目录
        ├── 📄 dateUtils.js            # 日期计算工具（过期判断）
        └── 📄 templates.js            # 数据模板（快速食材、示例菜谱）
```

---

## 📋 文件功能详解

### 🔧 配置文件

#### `package.json`
**功能：** 项目依赖管理和脚本定义
- 定义所有 npm 依赖包（React、Vite、Tailwind、Lucide Icons）
- 配置运行脚本（`dev`、`build`、`preview`）
- 设置项目元信息

#### `vite.config.js`
**功能：** Vite 开发服务器和构建配置
- 配置 React 插件
- 设置开发服务器端口（默认 3000）
- 配置构建输出目录

#### `tailwind.config.js`
**功能：** Tailwind CSS 框架配置
- 定义需要扫描的文件路径
- 配置主题扩展
- 设置插件

#### `postcss.config.js`
**功能：** PostCSS 处理器配置
- 集成 Tailwind CSS
- 配置 Autoprefixer（自动添加浏览器前缀）

#### `index.html`
**功能：** HTML 入口文件
- 定义页面基础结构
- 挂载点 `<div id="root">`
- 引入主 JavaScript 文件

---

### 📦 源代码文件

#### `src/main.jsx`
**功能：** React 应用入口
- 创建 React 根节点
- 挂载 App 组件到 DOM
- 启用 React 严格模式

**关键代码：**
```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

#### `src/App.jsx`
**功能：** 主应用组件（核心路由和状态管理）
- 管理页面导航状态（`landing` → `preferences` → `ingredients` → `main`）
- 全局状态管理（用户偏好、食材列表）
- 条件渲染不同页面组件

**管理的状态：**
- `step`: 当前页面（landing / preferences / ingredients / main）
- `preferences`: 用户饮食偏好
- `ingredients`: 冰箱食材列表

---

#### `src/index.css`
**功能：** 全局样式
- 引入 Tailwind CSS 基础样式
- 定义全局 CSS 重置
- 设置字体和基础样式

---

### 🎨 组件文件 (src/components/)

#### `LandingPage.jsx`
**功能：** 首页欢迎页面
- 展示产品介绍和核心价值
- 引导用户开始使用
- 三大特点展示（省时、减少浪费、精准推荐）

**Props：**
- `onNext`: 点击「开始托管」按钮的回调

---

#### `PreferencesPage.jsx`
**功能：** 用户偏好设置页面
- 收集饮食偏好（口味、快手菜偏好）
- 设置饮食限制（过敏原、饮食类型）
- 健康状态配置

**Props：**
- `preferences`: 偏好对象
- `setPreferences`: 更新偏好的函数
- `onNext`: 下一步回调
- `onSkip`: 跳过回调

**特点：** 所有设置均为可选，支持随时跳过

---

#### `IngredientsPage.jsx`
**功能：** 食材录入页面
- 快速模板添加（常见食材一键添加）
- 手动添加食材（自定义名称、数量、保质期等）
- 显示已添加食材列表

**Props：**
- `ingredients`: 食材列表
- `setIngredients`: 更新食材列表的函数
- `onComplete`: 完成设置的回调

**支持的录入方式：**
1. 快速模板（预设 6 种常见食材）
2. 手动输入（完全自定义）

---

#### `MainPage.jsx`
**功能：** 主页面布局容器
- 顶部导航栏
- 左右两栏布局（冰箱 + 菜谱）
- 底部快速统计

**Props：**
- `ingredients`: 食材列表
- `setIngredients`: 更新食材
- `preferences`: 用户偏好
- `onBack`: 返回食材录入页面

**包含的子组件：**
- `FridgePanel` - 左侧冰箱面板
- `RecipePanel` - 右侧菜谱面板

---

#### `FridgePanel.jsx`
**功能：** 冰箱管理面板（左侧）
- 展示所有食材卡片
- 按过期时间排序
- 提供添加食材入口

**Props：**
- `ingredients`: 食材列表
- `setIngredients`: 更新食材
- `onBack`: 返回录入页面添加食材

**主要功能：**
- 食材数量增减
- 自动删除数量为 0 的食材
- 过期提醒（颜色编码）

---

#### `IngredientCard.jsx`
**功能：** 单个食材卡片组件
- 显示食材信息（名称、数量、剩余天数）
- 根据过期时间显示不同颜色
- 提供「用了」和「补充」按钮

**Props：**
- `item`: 食材对象（包含 name、amount、shelfLife 等）
- `onUpdateAmount`: 更新数量的回调函数

**颜色编码：**
- 🔴 红色：已过期或今天到期（≤1 天）
- 🟡 黄色：即将过期（≤3 天）
- 🟢 绿色：新鲜（>3 天）

**存储图标：**
- ❄️ 冷冻
- 🧊 冷藏
- 📦 常温

---

#### `RecipePanel.jsx`
**功能：** 菜谱推荐面板（右侧）
- 设置本次偏好（速度、人数、心情）
- 生成个性化菜谱推荐
- 记录实际用量并自动扣除食材

**Props：**
- `ingredients`: 食材列表
- `setIngredients`: 更新食材

**推荐逻辑：**
1. 优先推荐使用即将过期食材的菜谱
2. 根据心情调整推荐（压力大→脆口，难过→甜口）
3. 根据人数和速度偏好筛选
4. 只推荐食材充足的菜谱

**核心功能：**
- 场景化偏好设置（Session-based）
- 智能菜谱生成
- 实际用量记录
- 一键完成并扣除食材

---

### 🛠️ 工具函数 (src/utils/)

#### `dateUtils.js`
**功能：** 日期计算和状态判断工具

**导出函数：**

1. **`getDaysLeft(purchaseDate, shelfLife)`**
   - 计算食材剩余保质期天数
   - 参数：购买日期、保质期（天）
   - 返回：剩余天数（负数表示已过期）

2. **`getStatusColor(daysLeft)`**
   - 根据剩余天数返回对应的 Tailwind 样式类
   - 返回颜色：红色/黄色/绿色

3. **`getTodayDate()`**
   - 获取今天的日期（格式：YYYY-MM-DD）
   - 用于默认购买日期

---

#### `templates.js`
**功能：** 静态数据模板

**导出数据：**

1. **`quickTemplates`** - 快速食材模板
   - 包含 6 种常见食材（鸡蛋、牛奶、洋葱、土豆、番茄、鸡胸肉）
   - 每个模板包含：名称、单位、保质期、存储方式

2. **`mockRecipes`** - 示例菜谱数据
   - 3 道示例菜谱（番茄炒蛋、洋葱炒牛肉、土豆鸡块）
   - 每个菜谱包含：
     - 基本信息（名称、图标、难度、时长）
     - 步骤列表
     - 所需食材及用量

---

## 🔄 数据流向

```
用户操作
   ↓
App.jsx (状态管理)
   ↓
┌─────────────────┬─────────────────┐
│  LandingPage    │  PreferencesPage │
│  IngredientsPage│                  │
└─────────────────┴─────────────────┘
   ↓
MainPage (布局容器)
   ↓
┌─────────────────┬─────────────────┐
│  FridgePanel    │  RecipePanel     │
│     ↓           │     ↓            │
│ IngredientCard  │  (菜谱卡片)      │
└─────────────────┴─────────────────┘
   ↓
工具函数 (dateUtils / templates)
```

---

## 🎯 核心状态

### 1. `step` - 页面导航
```javascript
'landing' → 'preferences' → 'ingredients' → 'main'
```

### 2. `preferences` - 用户偏好
```javascript
{
  tastes: [],              // 口味偏好（多选）
  quickMeals: false,       // 是否偏好快手菜
  allergens: [],           // 过敏原
  dietType: [],            // 饮食类型
  considerNutrition: false // 是否考虑营养
}
```

### 3. `ingredients` - 食材列表
```javascript
[
  {
    id: 1234567890,        // 唯一标识
    name: '鸡蛋',          // 食材名称
    amount: 6,             // 数量
    unit: '个',            // 单位
    purchaseDate: '2025-01-07', // 购买日期
    storage: 'fridge',     // 存储方式
    shelfLife: 21          // 保质期（天）
  }
]
```

---

## 📦 依赖包说明

### 核心依赖
- **react** (18.2.0) - React 核心库
- **react-dom** (18.2.0) - React DOM 渲染
- **lucide-react** (0.263.1) - 图标库

### 开发依赖
- **vite** (4.3.9) - 构建工具
- **@vitejs/plugin-react** (4.0.0) - Vite 的 React 插件
- **tailwindcss** (3.3.2) - CSS 框架
- **autoprefixer** (10.4.14) - CSS 自动前缀
- **postcss** (8.4.24) - CSS 处理器

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 📝 开发注意事项

1. **文件命名规范**
   - 组件文件：大驼峰命名 + `.jsx` 扩展名
   - 工具文件：小驼峰命名 + `.js` 扩展名

2. **组件设计原则**
   - 单一职责：每个组件只负责一个功能
   - Props 传递：父组件管理状态，子组件接收 props
   - 无副作用：纯展示组件不修改外部状态

3. **状态管理**
   - 全局状态在 `App.jsx` 中管理
   - 局部状态在各自组件中使用 `useState`

4. **样式管理**
   - 使用 Tailwind 工具类
   - 避免内联样式
   - 保持样式一致性

---

## 🎨 设计系统

### 颜色方案
- **主色调（蓝色）：** 按钮、链接
- **成功色（绿色）：** 新鲜食材、完成操作
- **警告色（黄色）：** 即将过期
- **危险色（红色）：** 已过期、删除操作
- **中性色（灰色）：** 背景、边框、禁用状态

### 间距系统
- 小间距：`gap-2` (8px)
- 中间距：`gap-4` (16px)
- 大间距：`gap-6` (24px)

---

## 👥 贡献指南

欢迎提交 Issue 和 Pull Request！

---

**最后更新：** 2025-01-07