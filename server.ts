import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("perfume.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    manufacturer TEXT,
    supplier TEXT,
    price REAL,
    unit TEXT,
    stock INTEGER,
    discount INTEGER,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('guest', 'user', 'manager', 'admin'))
  );
`);

// Seed data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (name, category, description, manufacturer, supplier, price, unit, stock, discount, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    "Chanel No. 5",
    "Женская парфюмерия",
    "Классический аромат, символ элегантности и женственности.",
    "Chanel",
    "LVMH Distribution",
    12500,
    "мл",
    15,
    10,
    "https://picsum.photos/seed/chanel/200/300"
  );
  insertProduct.run(
    "Dior Sauvage",
    "Мужская парфюмерия",
    "Свежий, древесный аромат для уверенных в себе мужчин.",
    "Dior",
    "LVMH Distribution",
    9800,
    "мл",
    24,
    5,
    "https://picsum.photos/seed/dior/200/300"
  );
  insertProduct.run(
    "Tom Ford Lost Cherry",
    "Унисекс",
    "Насыщенный восточный аромат с нотами спелой вишни.",
    "Tom Ford",
    "Estée Lauder",
    25000,
    "мл",
    8,
    0,
    "https://picsum.photos/seed/tomford/200/300"
  );
}

const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
  insertUser.run("admin", "admin123", "admin");
  insertUser.run("manager", "manager123", "manager");
  insertUser.run("user", "user123", "user");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username) {
        return res.json({ role: 'guest' });
    }
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: "Неверные учетные данные" });
    }
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, category, description, manufacturer, supplier, price, unit, stock, discount, image } = req.body;
    const info = db.prepare(`
      INSERT INTO products (name, category, description, manufacturer, supplier, price, unit, stock, discount, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, description, manufacturer, supplier, price, unit, stock, discount, image || "https://picsum.photos/seed/perfume/200/300");
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, category, description, manufacturer, supplier, price, unit, stock, discount, image } = req.body;
    db.prepare(`
      UPDATE products 
      SET name = ?, category = ?, description = ?, manufacturer = ?, supplier = ?, price = ?, unit = ?, stock = ?, discount = ?, image = ?
      WHERE id = ?
    `).run(name, category, description, manufacturer, supplier, price, unit, stock, discount, image, id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
