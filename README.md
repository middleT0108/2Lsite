# 🎮 HƯỚNG DẪN TRIỂN KHAI DỰ ÁN GAMECLIPS

Chào mừng bạn đến với **GameClips**! Hệ thống lưu trữ và quản lý clip highlight gaming cá nhân, bảo mật đa tầng với Supabase, React Vite, TypeScript và CI/CD tự động deploy lên GitHub Pages hoàn toàn miễn phí 24/7.

---

## 📁 1. CÂY THƯ MỤC TOÀN BỘ DỰ ÁN

```text
website saving highlight project/
├── .github/
│   └── workflows/
│       ├── deploy.yml            # CI/CD: Tự động build và deploy GitHub Pages
│       └── keep-alive.yml        # Cron 5 ngày ping Supabase giữ dự án không bị sleep
├── public/
│   └── favicon.svg               # Logo icon tím gaming
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AdminRoute.tsx    # Bảo vệ route chỉ Admin mới vào được
│   │   │   ├── OtpInput.tsx      # Ô nhập mã OTP 6 số (auto focus, paste)
│   │   │   └── ProtectedRoute.tsx# Bảo vệ route cần đăng nhập + check bị khóa
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Thanh điều hướng gaming, avatar dropdown
│   │   │   └── Layout.tsx        # Khung bố cục chính có responsive container
│   │   ├── ui/
│   │   │   ├── Button.tsx        # Nút bấm phong cách gaming có loading
│   │   │   ├── Input.tsx         # Input field có validation & error text
│   │   │   ├── LoadingSpinner.tsx# Vòng xoay tải trang gaming
│   │   │   ├── Modal.tsx         # Hộp thoại popup đa dụng
│   │   │   ├── PasswordStrengthBar.tsx # Thước đo độ mạnh mật khẩu (4 mức + checklist)
│   │   │   └── Toast.tsx         # Thông báo nổi (success, error, warning, info)
│   │   └── video/
│   │       ├── VideoCard.tsx     # Thẻ hiển thị video + thumbnail + badge game
│   │       ├── VideoEditModal.tsx# Sửa tiêu đề, game, mô tả, tags
│   │       ├── VideoFilters.tsx  # Lọc game, tìm kiếm tiêu đề, sắp xếp
│   │       ├── VideoPlayer.tsx   # Trình phát video an toàn + nút tải xuống
│   │       └── VideoUploader.tsx # Kéo thả video, tạo thumbnail tự động
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Lưu trạng thái phiên làm việc & role admin
│   │   └── ToastContext.tsx      # Quản lý hàng đợi thông báo toast
│   ├── hooks/
│   │   ├── useAdmin.ts           # Thao tác gọi admin stats, users, ban
│   │   ├── useAuth.ts            # Hook lấy thông tin user hiện tại
│   │   ├── useUpload.ts          # Quản lý tiến trình upload file & thumbnail
│   │   └── useVideos.ts          # Quản lý danh sách, filter, xóa/sửa clip
│   ├── lib/
│   │   ├── supabase.ts           # Khởi tạo Supabase client (chỉ dùng Anon Key)
│   │   ├── utils.ts              # Định dạng ngày, dung lượng, tạo thumbnail video
│   │   └── validators.ts         # Zod schemas kiểm tra dữ liệu đầu vào
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx# Thống kê tổng số tài khoản, video, storage
│   │   │   ├── AdminUserDetail.tsx# Xem chi tiết và video của user, xóa video
│   │   │   └── AdminUsers.tsx    # Bảng người dùng, khóa/mở khóa tài khoản
│   │   ├── auth/
│   │   │   ├── ChangePasswordPage.tsx # Đổi mật khẩu có OTP 6 số
│   │   │   ├── ForgotPasswordPage.tsx # Quên mật khẩu đa bước (Email -> OTP -> New Pass)
│   │   │   ├── LoginPage.tsx     # Đăng nhập
│   │   │   ├── RegisterPage.tsx  # Đăng ký với thanh đo mật khẩu mạnh
│   │   │   ├── ResetPasswordPage.tsx  # Đặt lại mật khẩu từ liên kết email
│   │   │   └── VerifyEmailPage.tsx    # Thông báo nhắc nhở kiểm tra hòm thư
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx # Trang chính quản lý kho video cá nhân
│   │   │   ├── UploadPage.tsx    # Giao diện tải highlight lên
│   │   │   └── VideoDetailPage.tsx  # Xem clip, phát video với Signed URL
│   │   └── NotFoundPage.tsx      # Trang 404 phong cách gaming
│   ├── services/
│   │   ├── admin.service.ts      # Gọi Edge Function thực hiện quyền Admin
│   │   ├── api.ts                # Wrapper tập trung bắt lỗi tiếng Việt
│   │   ├── auth.service.ts       # Đăng nhập, đăng xuất, lấy hồ sơ
│   │   ├── otp.service.ts        # Gửi và xác thực mã OTP
│   │   └── video.service.ts      # CRUD video, upload Storage, lấy Signed URL
│   ├── types/
│   │   └── index.ts              # Toàn bộ Types & Cấu hình hằng số
│   ├── App.tsx                   # Khởi tạo HashRouter và cấu hình routes
│   ├── index.css                 # Custom scrollbar, animations gaming
│   └── main.tsx                  # Entry point React
├── supabase/
│   ├── functions/
│   │   ├── admin/index.ts        # Edge Function bảo mật cho Admin
│   │   ├── reset-password/index.ts # Edge Function đặt lại mật khẩu bằng OTP
│   │   ├── send-otp/index.ts     # Edge Function gửi OTP qua email (Rate limit 60s)
│   │   └── verify-otp/index.ts   # Edge Function kiểm tra OTP hash SHA-256
│   └── migrations/
│       └── 001_initial.sql       # Toàn bộ Bảng, RLS, Trigger, Storage Buckets
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── index.html                    # Thẻ meta Content-Security-Policy (CSP)
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🚀 2. HƯỚNG DẪN CẤU HÌNH CHI TIẾT TỪ ĐẦU (STEP-BY-STEP)

### BƯỚC 1: TẠO DỰ ÁN SUPABASE VÀ CHẠY DATABASE MIGRATION
1. Truy cập [https://supabase.com](https://supabase.com) và tạo một Project mới (chọn Region gần bạn nhất, ví dụ `Singapore`).
2. Vào mục **SQL Editor** ở thanh menu bên trái.
3. Mở file [001_initial.sql](file:///c:/Users/ghuol/Documents/website%20saving%20highlight%20project/supabase/migrations/001_initial.sql) trong project, copy toàn bộ nội dung và dán vào SQL Editor, sau đó nhấn **Run**.
   * File này sẽ tự động tạo bảng `profiles`, `videos`, `otp_codes`, kích hoạt **Row Level Security (RLS)** bảo vệ dữ liệu, tạo trigger tự tạo profile khi user đăng ký, và cấu hình Storage bucket `videos` ở chế độ **Private**.
4. Vào mục **Project Settings > API**:
   - Lưu lại **Project URL** (VD: `https://xyzcompany.supabase.co`).
   - Lưu lại **anon public key**.

### BƯỚC 2: CẤU HÌNH AUTH VÀ EMAIL XÁC NHẬN TRONG SUPABASE
1. Vào **Authentication > Providers > Email**:
   - Bật **Enable Email provider**.
   - Bật **Confirm email** (bắt buộc người dùng xác nhận email mới được đăng nhập).
2. Vào **Authentication > URL Configuration**:
   - **Site URL**: Điền đường dẫn website của bạn trên GitHub Pages (VD: `https://<your-username>.github.io/<repo-name>/`).
   - **Redirect URLs**: Thêm `https://<your-username>.github.io/<repo-name>/#/verify-email` và `http://localhost:5173/#/verify-email`.

### BƯỚC 3: CÁCH TẠO TÀI KHOẢN ADMIN ĐẦU TIÊN
1. Đăng ký một tài khoản bình thường trên website hoặc qua Supabase Auth Dashboard.
2. Vào **Table Editor > profiles**:
   - Tìm dòng có email của bạn.
   - Sửa cột `role` từ `'user'` thành `'admin'`.
   - Nhấn Save. Tài khoản này ngay lập tức có quyền truy cập trang `/admin` và quản trị toàn bộ hệ thống!

### BƯỚC 4: CẤU HÌNH VÀ TRIỂN KHAI EDGE FUNCTIONS (GỬI OTP & ADMIN)
1. Cài đặt Supabase CLI trên máy tính (nếu muốn deploy Edge functions) hoặc dùng lệnh:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-id>
   npx supabase functions deploy send-otp
   npx supabase functions deploy verify-otp
   npx supabase functions deploy reset-password
   npx supabase functions deploy admin
   ```
2. Cấu hình biến môi trường cho Edge Function trong Supabase Dashboard (**Edge Functions > Secrets**):
   - `RESEND_API_KEY`: API key từ [Resend.com](https://resend.com) (dịch vụ gửi email miễn phí 3000 email/tháng).
   - `SENDER_EMAIL`: Email người gửi (VD: `GameClips <onboarding@resend.dev>`).

---

## 💻 3. HƯỚNG DẪN CHẠY THỬ Ở MÁY LOCAL

1. Đảm bảo máy tính đã cài **Node.js (v18 hoặc v20+)**.
2. Tạo file `.env` ở thư mục gốc dự án (sao chép từ `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_MAX_VIDEO_SIZE_MB=100
   VITE_APP_NAME=GameClips
   ```
3. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
4. Khởi động môi trường phát triển:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt tại đường dẫn `http://localhost:5173`. Bạn có thể thử nghiệm tính năng đăng ký, đăng nhập, kéo thả upload video và xem video!

---

## 🌐 4. TRIỂN KHAI GITHUB PAGES & GIỮ SUPABASE HOẠT ĐỘNG 24/7 MIỄN PHÍ

1. Khởi tạo Git và đẩy toàn bộ mã nguồn lên repository GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: complete GameClips project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. **Cấu hình GitHub Secrets**:
   - Vào GitHub Repo: **Settings > Secrets and variables > Actions > New repository secret**.
   - Thêm 2 secret:
     - `VITE_SUPABASE_URL`: URL của Supabase.
     - `VITE_SUPABASE_ANON_KEY`: Anon Key của Supabase.
3. **Bật GitHub Pages**:
   - Vào **Settings > Pages**.
   - Tại mục **Build and deployment > Source**, chọn **GitHub Actions**.
4. Khi push code lên nhánh `main`, GitHub Actions sẽ tự động chạy file [.github/workflows/deploy.yml](file:///c:/Users/ghuol/Documents/website%20saving%20highlight%20project/.github/workflows/deploy.yml) để đóng gói và xuất bản trang web.
5. File [.github/workflows/keep-alive.yml](file:///c:/Users/ghuol/Documents/website%20saving%20highlight%20project/.github/workflows/keep-alive.yml) đã được cài đặt sẵn lịch **cron 5 ngày một lần** gọi ping API Supabase, giúp tài khoản miễn phí của bạn không bao giờ bị tạm ngưng (pause) do không hoạt động quá 7 ngày!

---

## 🛡️ 5. CHECKLIST BẢO MẬT & XỬ LÝ LỖI THƯỜNG GẶP

### Checklist Bảo Mật
- [x] **Không lộ Service Role Key**: Code React frontend chỉ sử dụng `VITE_SUPABASE_ANON_KEY`. Mọi thao tác nhạy cảm (thống kê admin, ban user, reset pass) đều được bảo vệ sau Supabase Edge Functions.
- [x] **Row Level Security (RLS)**: Bật trên 100% bảng. User A tuyệt đối không thể đọc hay can thiệp vào video của User B.
- [x] **Storage Bucket Private**: Video được lưu trữ ở chế độ private. Trình phát sử dụng **Signed URL** có thời hạn (1 giờ), chống hotlinking và truy cập trái phép.
- [x] **Chống tấn công XSS**: Không dùng `dangerouslySetInnerHTML`. Cấu hình thẻ meta **Content-Security-Policy (CSP)** trong `index.html`.
- [x] **Rate Limiting & OTP Hashing**: Mã OTP gửi qua email được băm bằng thuật toán SHA-256 trước khi lưu vào DB, có thời hạn 5 phút, giới hạn 5 lần nhập sai và thời gian chờ gửi lại là 60 giây.

### Lỗi Thường Gặp & Cách Khắc Phục
1. **Lỗi 404 khi load lại trang trên GitHub Pages**:
   - *Nguyên nhân*: GitHub Pages là static host không hỗ trợ SPA routing mặc định.
   - *Giải pháp*: Dự án đã sử dụng **HashRouter** (`/#/dashboard`), hoàn toàn tương thích và không bao giờ gặp lỗi 404 khi F5.
2. **Video tải lên không hiển thị ảnh thumbnail**:
   - *Nguyên nhân*: Một số định dạng video đặc thù không hỗ trợ trích xuất frame bằng HTML5 Canvas trên trình duyệt cũ.
   - *Giải pháp*: Dự án đã có sẵn fallback giao diện placeholder phong cách gaming đẹp mắt.
3. **Lỗi CORS khi gọi Edge Function**:
   - *Giải pháp*: Các file trong `supabase/functions/` đã được cấu hình sẵn đầy đủ `corsHeaders` bao gồm cả việc xử lý request `OPTIONS`.
