"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.ensureSchema = ensureSchema;
const pg_1 = require("pg");
const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
    console.warn('[db] POSTGRES_URL/DATABASE_URL is not set. Backend will fail to connect to DB.');
}
exports.pool = new pg_1.Pool({ connectionString });
async function ensureSchema() {
    // No-op: bạn đã tạo bảng trên Neon.tech theo schema cung cấp
    return;
}
