# Đề xuất cải thiện tự động cập nhật dữ liệu kỳ mới

## Hiện trạng
✅ Hệ thống ĐÃ tự động lấy dữ liệu kỳ mới dựa trên:
- Sắp xếp theo ID (ID cao nhất = kỳ mới nhất)
- Cache tự động refresh sau 1 giờ
- Load tất cả dữ liệu điểm từ tất cả các kỳ

## Các cải thiện có thể thêm

### 1. Giảm thời gian cache cho đầu kỳ học
```typescript
// lib/APIHandler.ts
const now = new Date();
const isStartOfSemester = (now.getMonth() === 8 || now.getMonth() === 1); // Tháng 9 hoặc 2
const revalidateTime = isStartOfSemester ? 600 : 3600; // 10 phút nếu đầu kỳ, 1 giờ nếu giữa kỳ

{
    tags: ["user-data"],
    revalidate: revalidateTime,
}
```

### 2. Thêm nút "Làm mới dữ liệu" thủ công
```typescript
// Thêm vào các trang schedule, exam, gpa
<Button onClick={() => router.refresh()}>
    🔄 Làm mới
</Button>
```

### 3. Hiển thị thông báo khi phát hiện kỳ mới
```typescript
// Lưu ID kỳ cuối cùng vào localStorage
const lastSeenSemesterId = localStorage.getItem('lastSeenSemester');
if (currentSemester.id > lastSeenSemesterId) {
    // Hiển thị notification
    toast.success(`🎉 Phát hiện kỳ mới: ${currentSemester.tenHocKy}`);
    localStorage.setItem('lastSeenSemester', currentSemester.id);
}
```

### 4. Kiểm tra theo thời gian thực tế
```typescript
// Thay vì chỉ dựa vào ID, kiểm tra theo tên và năm
const getCurrentSemester = (semesters: DanhSachHocKyResponse[]) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    // Tháng 9-12: Kỳ 1, Tháng 1-5: Kỳ 2, Tháng 6-8: Kỳ Hè
    let expectedSemester = "1";
    let expectedYear = currentYear;
    
    if (currentMonth >= 9) {
        expectedSemester = "1";
        expectedYear = currentYear; // năm hiện tại
    } else if (currentMonth >= 1 && currentMonth <= 5) {
        expectedSemester = "2";
        expectedYear = currentYear - 1; // năm học bắt đầu từ năm trước
    } else {
        expectedSemester = "Hè";
        expectedYear = currentYear - 1;
    }
    
    const matchedSemester = semesters.find(
        s => s.ten === expectedSemester && s.nam.includes(expectedYear.toString())
    );
    
    return matchedSemester || semesters[semesters.length - 1];
};
```

### 5. Server-side revalidation on-demand
```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');
    
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }
    
    revalidateTag('user-data');
    return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

### 6. Background sync với Service Worker
```typescript
// public/sw.js - thêm periodic background sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-semester-data') {
        event.waitUntil(updateSemesterData());
    }
});

async function updateSemesterData() {
    // Gọi API để kiểm tra kỳ mới
    // Hiển thị notification nếu có kỳ mới
}
```

## Kết luận
Hệ thống hiện tại ĐÃ tự động, nhưng có thể cải thiện:
- ✅ Tốt: Tự động chọn kỳ mới nhất
- ✅ Tốt: Cache và auto-refresh
- ⚠️ Có thể cải thiện: Thời gian cache linh hoạt hơn
- ⚠️ Có thể cải thiện: Thông báo cho user
- ⚠️ Có thể cải thiện: Nút refresh thủ công
