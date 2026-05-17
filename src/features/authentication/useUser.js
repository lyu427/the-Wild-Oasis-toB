import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/apiAuth";

export function useUser() {
  const { isLoading, data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  return { isLoading, user, isAuthenticated: user?.role === "authenticated" };
}

// Raw JSON → user 对象的转换过程
// 第1步：发送请求
// 当你调用 supabase.auth.getUser() 时，SDK 在后台发送 HTTP 请求到 Supabase 服务器：

// GET /auth/v1/user
// Authorization: Bearer <JWT_TOKEN>

// 第2步：服务器返回原始数据
// Supabase 服务器返回 Raw JSON（你在数据库中看到的那个）：

// {
//   "id": "166696d9-e2e6-4eca-af90-3dc850dadc3d",
//   "email": "jizi@example.com",
//   "raw_user_meta_data": {
//     "fullName": "jizi",
//     "avatar": "..."
//   },
//   ...
// }

// 第3步：SDK 转换数据
// Supabase SDK 收到这个 Raw JSON 后，进行以下转换：

// // SDK 内部的伪代码逻辑
// const rawData = /* 服务器返回的 Raw JSON */;

// const transformedUser = {
//   id: rawData.id,
//   email: rawData.email,
//   role: "authenticated",  // ← SDK 添加的！
//   user_metadata: rawData.raw_user_meta_data,
//   app_metadata: rawData.raw_app_meta_data,
//   // ... 其他字段
// };

// return transformedUser;

// 为什么 role 字段存在
// Supabase 有一个约定：
// 只要用户通过身份认证（有效的 JWT Token）
// role 字段就会被设置为 "authenticated"
// 如果用户未认证，role 就是 "anon"（匿名）

// Raw JSON = 数据库原始格式
// SDK = 中间层，负责通信和数据转换
// user 对象 = 开发者友好的格式，包含 SDK 添加的有用信息
// SDK 的核心价值就是：隐藏复杂性，提供简洁接口
