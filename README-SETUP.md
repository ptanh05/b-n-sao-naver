# Hướng dẫn khởi động dự án

## Vấn đề "Failed to fetch" khi đăng ký

Lỗi này xảy ra khi **API server chưa được khởi động**. Bạn cần chạy cả 2 server:

### 1. Khởi động API Server (Backend)

Mở terminal thứ nhất và chạy:

```bash
# Cách 1: Chạy trực tiếp với tsx (khuyến nghị cho development)
cd api
npx tsx src/server.ts

# Cách 2: Build rồi chạy
npm run api:build
npm run api:start
```

API server sẽ chạy tại: `http://localhost:3001`

### 2. Khởi động Next.js Server (Frontend)

Mở terminal thứ hai và chạy:

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### 3. Kiểm tra kết nối

Sau khi cả 2 server đã chạy, kiểm tra API health:

```bash
curl http://localhost:3001/api/health
```

Nếu thấy `{"ok":true,"name":"time-management-api"}` thì API đã chạy đúng.

## Cấu hình môi trường

Tạo file `.env` hoặc `.env.local` trong thư mục gốc (nếu chưa có):

```env
# Database (REQUIRED - lấy từ Neon.tech)
# Có thể dùng POSTGRES_URL hoặc DATABASE_URL
POSTGRES_URL=postgresql://user:password@host:5432/database?sslmode=require
# HOẶC
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT Secret (optional, mặc định là 'dev_jwt')
JWT_SECRET=your_jwt_secret_key

# API URL (optional, mặc định là http://localhost:3001/api)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# CORS Origin (optional, mặc định là http://localhost:3000)
CORS_ORIGIN=http://localhost:3000
```

### Lấy DATABASE_URL từ Neon.tech

1. Đăng nhập vào [Neon.tech](https://neon.tech)
2. Chọn project của bạn
3. Vào **Connection Details** hoặc **Connection String**
4. Copy connection string (dạng: `postgresql://user:password@host/database?sslmode=require`)
5. Paste vào file `.env` với tên `POSTGRES_URL` hoặc `DATABASE_URL`

**Lưu ý quan trọng:**
- Connection string phải là **string** (không có dấu ngoặc kép thừa)
- Phải có `?sslmode=require` ở cuối cho Neon.tech
- Password trong connection string phải là string hợp lệ

## Lưu ý

- **Phải chạy cả 2 server** (API và Next.js) để ứng dụng hoạt động
- API server phải chạy trước khi mở frontend
- Kiểm tra port 3001 không bị chiếm bởi ứng dụng khác
- Nếu vẫn lỗi, kiểm tra CORS settings trong `api/src/server.ts`

