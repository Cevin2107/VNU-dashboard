# 🔑 Hướng dẫn tạo Vercel API Token

## Tại sao cần?

Edge Config **chỉ đọc được trực tiếp**, không ghi được qua code.  
Để **update** (toggle), cần dùng Vercel API với Personal Access Token.

## 📝 Các bước:

### 1. Tạo Token

1. Vào: https://vercel.com/account/tokens
2. Click: **"Create Token"**
3. Điền:
   ```
   Token Name: VNU Dashboard Edge Config
   Scope: Full Account (hoặc chỉ project cụ thể)
   Expiration: No Expiration (hoặc tùy chọn)
   ```
4. Click: **"Create"**
5. **Copy token ngay** (chỉ hiện 1 lần!)
   ```
   Example: vercel_abc123xyz...
   ```

### 2. Thêm vào Project

1. Vào: https://vercel.com/cevin2107/vnu-dashboard/settings/environment-variables
2. Click: **"Add New"**
3. Điền:
   ```
   Name:  VERCEL_API_TOKEN
   Value: [paste token vừa copy]
   
   Environment:
   ☑ Production
   ☑ Preview
   ☑ Development
   ```
4. Click: **"Save"**

### 3. Redeploy

```bash
git add .
git commit -m "feat: add Edge Config support"
git push
```

Vercel sẽ auto deploy với token mới.

### 4. Local Development (Optional)

Nếu muốn test local:

```bash
# .env.local
EDGE_CONFIG=https://edge-config.vercel.com/ecfg_2ofjc5ultq6hcynd3g9f4zy69xwh?token=...
VERCEL_API_TOKEN=vercel_abc123xyz...
```

## ✅ Xong!

Sau khi setup:
- ✅ Toggle trong sidebar hoạt động
- ✅ Sync toàn cầu (5-10s để propagate)
- ✅ Persistent không mất data

## 🔐 Security

- ✅ Token có quyền admin → Chỉ server mới truy cập
- ✅ Không lộ ra client (server actions)
- ✅ Có thể revoke bất cứ lúc nào
