# 🧊 冰箱托管 - 项目文件结构 (Cloud Sync 版)

**智能食材管理与菜谱推荐系统** - 现已支持云端同步与多设备访问。

---

## 📁 项目目录结构

```text
fridge-manager/
├── 📄 package.json                # 项目依赖（新增 @supabase/supabase-js）
├── 📄 vite.config.js              # Vite 构建配置
├── 📄 tailwind.config.js          # Tailwind CSS 样式配置
├── 📄 .env                        # 环境变量（存放 Supabase API 密钥，需忽略）
├── 📄 .gitignore                  # Git 忽略配置（确保 .env 不会被上传）
├── 📄 README.md                   # 项目基本介绍
│
├── 📂 public/                     # 静态资源
│   └── favicon.ico                # 网站图标
│
└── 📂 src/                        # 源代码目录
    ├── 📄 main.jsx                # 应用入口
    ├── 📄 App.jsx                 # 主控组件（含云端同步逻辑、路由切换）
    ├── 📄 index.css               # 全局样式
    │
    ├── 📂 config/                 # 配置目录 (NEW)
    │   └── 📄 supabaseClient.js   # Supabase 客户端初始化
    │
    ├── 📂 components/             # React 组件
    │   ├── 📄 LandingPage.jsx      # 欢迎页（含登录入口）
    │   ├── 📄 PreferencesPage.jsx  # 饮食偏好设置
    │   ├── 📄 IngredientsPage.jsx  # 食材录入（支持手动分类及云端推送）
    │   ├── 📄 MainPage.jsx         # 主展示页容器
    │   ├── 📄 FridgePanel.jsx      # 冰箱库存面板
    │   ├── 📄 RecipePanel.jsx      # 菜谱推荐面板
    │   └── 📄 IngredientCard.jsx   # 食材卡片（含过期逻辑判断）
    │
    └── 📂 utils/                  # 工具函数
        ├── 📄 dateUtils.js        # 日期处理（计算剩余保质期）
        └── 📄 templates.js        # 静态模板（预设食材与示例菜谱）

```

---

## 📋 云端功能详解 (NEW)

### 🔑 身份验证与同步 (`App.jsx` & `supabaseClient.js`)

* **Magic Link 登录**：用户通过邮箱接收登录链接，实现无密码安全访问。
* **状态监听**：通过 `onAuthStateChange` 实时监听用户登录/登出状态。
* **云端拉取**：登录后自动从 Supabase `ingredients` 表和 `preferences` 表同步数据至本地。

### 📤 数据持久化逻辑

* **双重存储**：数据操作会同时同步至 **LocalStorage**（保证离线可用）和 **Supabase**（保证跨设备同步）。
* **字段映射**：前端使用 `camelCase`（小驼峰），数据库使用 `snake_case`（下划线），通过转换函数确保兼容性。

### 🗄️ 数据库表设计

1. **`ingredients` 表**：
* `id`: 唯一标识 (UUID)
* `user_id`: 关联用户 ID (Auth.uid)
* `name`: 食材名称
* `category`: 食品类型（新增）
* `purchase_date`: 购买日期
* `storage`: 存储方式 (fridge/freezer/pantry)


2. **`preferences` 表**：
* `id`: 用户 ID (Primary Key)
* `tastes / quick_meals / allergens` 等 JSONB 格式存储。



---

## 🎨 核心组件功能

#### `IngredientsPage.jsx`

* **云端录入**：点击食材模板或手动添加时，数据会实时推送至 Supabase。
* **动态分类**：支持手动指定分类，并自动保存为用户自定义模板。

#### `IngredientCard.jsx`

* **过期提醒**：利用 `dateUtils` 计算剩余天数。
* 🔴 **红色**：≤1天（急需处理）
* 🟡 **黄色**：≤3天（近期消耗）
* 🟢 **绿色**：>3天（新鲜）



#### `RecipePanel.jsx`

* **智能推荐**：结合用户在 `PreferencesPage` 设置的口味，优先推荐即将过期的食材组合。

---

## 🚀 快速启动与部署

### 1. 环境变量配置

在根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的匿名Key

```

### 2. 开发命令

```bash
npm install        # 安装依赖
npm run dev        # 启动本地开发（localhost:5173）
npm run build      # 构建生产版本（用于部署到 Vercel）

```

### 3. Git 分支管理

* `main`: 生产环境分支。
* `dev-supabase`: 开发与实验分支。

---

## 📝 开发规范

* **命名**：组件统一使用大驼峰（如 `FridgePanel.jsx`），工具函数使用小驼峰。
* **安全**：禁止将敏感 Key 直接写在代码中，必须通过 `import.meta.env` 调用。
* **数据**：云端操作需使用 `maybeSingle()` 处理空返回，防止 `406` 报错。

**最后更新：** 2026-01-10
