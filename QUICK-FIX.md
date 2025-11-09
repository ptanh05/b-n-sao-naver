# Hướng dẫn sửa lỗi "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"

## Nguyên nhân

Lỗi này xảy ra vì:
1. **API server không load file `.env`** - đã sửa bằng cách thêm `dotenv`
2. **Connection string không đúng format** hoặc không được set
3. **Password trong connection string có vấn đề**

## Các bước sửa

### Bước 1: Cài đặt dotenv (nếu chưa có)

```bash
npm install dotenv
```

### Bước 2: Tạo file `.env` trong thư mục gốc

Tạo file `.env` (không có extension) trong `D:\New folder\b-n-sao-naver\`

### Bước 3: Lấy connection string từ Neon.tech

1. Đăng nhập [Neon.tech](https://neon.tech)
2. Chọn project
3. Vào **Connection Details** hoặc **Connection String**
4. Copy connection string (dạng: `postgresql://user:password@host/database?sslmode=require`)

### Bước 4: Thêm vào file `.env`

```env
POSTGRES_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
```

**LƯU Ý QUAN TRỌNG:**
- ✅ **KHÔNG** có dấu ngoặc kép `"` hoặc `'` xung quanh connection string
- ✅ Phải có `?sslmode=require` ở cuối
- ✅ Password phải là string hợp lệ
- ✅ Không có khoảng trắng thừa

### Bước 5: Khởi động lại API server

```bash
npm run dev:api
```

### Bước 6: Kiểm tra log

Bạn sẽ thấy:
```
[db] Database connection configured
[db] Connection string: postgresql://username:****@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
API listening on http://localhost:3001
```

Nếu vẫn thấy lỗi, kiểm tra:
- File `.env` có đúng vị trí không (cùng cấp với `package.json`)
- Connection string có đúng format không
- Password có ký tự đặc biệt cần encode không

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

## Nếu password có ký tự đặc biệt

Nếu password có ký tự đặc biệt như `@`, `#`, `%`, bạn cần **URL encode** chúng:

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `=` → `%3D`

Ví dụ: Nếu password là `p@ss#word`, connection string sẽ là:
```
postgresql://user:p%40ss%23word@host/database?sslmode=require
```

