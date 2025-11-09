# Sửa lỗi "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"

## Nguyên nhân

Lỗi này xảy ra khi:
1. **DATABASE_URL không được set** trong file `.env`
2. **Connection string không đúng format** (password không phải string)
3. **Connection string bị lỗi** hoặc thiếu thông tin

## Cách sửa

### Bước 1: Tạo file `.env` trong thư mục gốc

Tạo file `.env` (không có extension) trong thư mục `D:\New folder\b-n-sao-naver\`

### Bước 2: Lấy DATABASE_URL từ Neon.tech

1. Đăng nhập vào [Neon.tech](https://neon.tech)
2. Chọn project của bạn
3. Vào tab **Connection Details** hoặc **Connection String**
4. Copy connection string (sẽ có dạng như sau):

```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
```

### Bước 3: Thêm vào file `.env`

Thêm dòng sau vào file `.env`:

```env
POSTGRES_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
```

**Lưu ý quan trọng:**
- ✅ **KHÔNG** có dấu ngoặc kép `"` hoặc `'` xung quanh connection string
- ✅ Phải có `?sslmode=require` ở cuối
- ✅ Password phải là string hợp lệ (không có ký tự đặc biệt gây lỗi)

### Bước 4: Khởi động lại API server

Sau khi thêm `.env`, khởi động lại API server:

```bash
npm run dev:api
```

### Bước 5: Kiểm tra

Kiểm tra log của API server, bạn sẽ thấy:
```
[db] Database connection configured
[db] Connection string: postgresql://username:****@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
API listening on http://localhost:3001
```

## Ví dụ file `.env` đầy đủ

```env
# Database (REQUIRED)
POSTGRES_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Secret (optional)
JWT_SECRET=my_secret_key_123

# API Port (optional)
PORT=3001

# CORS Origin (optional)
CORS_ORIGIN=http://localhost:3000
```

## Nếu vẫn lỗi

1. **Kiểm tra connection string:**
   - Mở Neon.tech dashboard
   - Copy lại connection string mới nhất
   - Đảm bảo password không có ký tự đặc biệt gây lỗi

2. **Kiểm tra file `.env`:**
   - File phải ở thư mục gốc (cùng cấp với `package.json`)
   - Tên file là `.env` (không có extension)
   - Không có dấu ngoặc kép thừa

3. **Kiểm tra database:**
   - Đảm bảo database đã được tạo trên Neon.tech
   - Kiểm tra tables đã được tạo chưa (users, tasks, etc.)

4. **Restart API server:**
   - Dừng API server (Ctrl+C)
   - Chạy lại: `npm run dev:api`

