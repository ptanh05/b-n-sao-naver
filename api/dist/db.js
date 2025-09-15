"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.ensureSchema = ensureSchema;
const pg_1 = require("pg");
const connectionString = 'postgresql://neondb_owner:npg_foiZeNlvT20P@ep-purple-frost-a1uw6i95-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
if (!connectionString) {
    console.warn('[db] POSTGRES_URL/DATABASE_URL is not set. Backend will fail to connect to DB.');
}
exports.pool = new pg_1.Pool({ connectionString });
async function ensureSchema() {
    // No-op: bạn đã tạo bảng trên Neon.tech theo schema cung cấp
    return;
}
