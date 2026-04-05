import supabase, { supabaseUrl } from "./supabase";

export async function signup({ fullName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: "",
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function login({ email, password }) {
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

// React 的状态（State）和 React Query 的缓存（Cache）都存储在浏览器的 内存 中。
// 如果没有 getCurrentUser ：当用户刷新浏览器页面时，内存会被清空，应用会认为用户没有登录，直接把用户踢回登录页。
// 有了 getCurrentUser ：应用启动时会调用它。它会去检查浏览器的 localStorage （Supabase 自动存储在那里的 Token），然后向服务器验证这个 Token 是否依然有效。如果有效，就重新填充缓存，让用户保持登录状态。

export async function getCurrentUser() {
  // 先验证用户是否已登录，若已登录则获取最新用户数据
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  // 机制 ：Supabase会自动将用户的登录令牌（JWT Token）存储在浏览器的localStorage 中。 getSession()首先会检查本地存储。
  // 逻辑 ：如果本地没有 Session 或者 Session 已过期，直接返回 null 。这意味着用户当前处于未登录状态。

  const { data, error } = await supabase.auth.getUser();
  // 安全性 ：虽然 session 对象里已经包含了一些用户信息，但 getCurrentUser 会调用 supabase.auth.getUser() 。
  // 原因 ： getUser() 会向服务器发送请求，通过 JWT 令牌重新从数据库验证用户身份。这是比直接读取本地缓存 更安全 的做法，因为它可以确保用户的权限是最新的（例如：用户是否被禁用，或者元数据是否已更新）。

  if (error) throw new Error(error.message);

  return data?.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function updateCurrentUser({ password, fullName, avatar }) {
  // 1. Update password or fullName
  let updateData;
  if (password) updateData = { password };
  if (fullName) updateData = { data: { fullName } }; // 和signup中的格式一样

  const { data, error } = await supabase.auth.updateUser(updateData);
  if (error) throw new Error(error.message);
  if (!avatar) return data;
  // 如果没有传入新的头像文件，函数到此就执行结束并返回结果。这避免了不必要的图片处理逻辑。

  // 2. Upload the avatar image
  const fileName = `avatar-${data.user.id}-${Math.random()}`;

  const { error: storageError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatar);
  // 将用户上传的头像图片保存到 Supabase 的云端存储中

  if (storageError) throw new Error(storageError.message);
  // 3. Update avatar in the user
  const { data: updatedUser, error: error2 } = await supabase.auth.updateUser({
    data: {
      avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
    },
  });

  if (error2) throw new Error(error2.message);
  return updatedUser;
}
