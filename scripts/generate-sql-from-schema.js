const fs = require("fs");
const path = require("path");

// مسیر فایل JSON Schema
const schemaPath = path.join(
  __dirname,
  "../src/app/form/full_form_schema.json"
);
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const fields = [];

// استخراج همه فیلدها از schema
schema.sections.forEach((section) => {
  section.fields.forEach((field) => {
    fields.push(field.name);
  });
});

// حالا SQL ایجاد می‌کنیم
let sql = `CREATE TABLE IF NOT EXISTS items (\n`;
sql += `id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n`;

fields.forEach((field, index) => {
  sql += `"${field}" TEXT`;
  if (index < fields.length - 1) sql += ",\n";
});

sql += `,\nblob_url TEXT,\ncreated_at TIMESTAMP DEFAULT NOW()\n);`;

fs.writeFileSync(path.join(__dirname, "create_table.sql"), sql);

console.log("✅ SQL file generated: scripts/create_table.sql");
