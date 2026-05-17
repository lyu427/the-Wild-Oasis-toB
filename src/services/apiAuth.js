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

// React 的状态（State）和 React Query 的缓存都存储在浏览器的 JavaScript 堆内存中
// 如果没有 getCurrentUser ：当用户刷新浏览器页面时，内存会被清空，应用会认为用户没有登录，直接把用户踢回登录页。
// 有了 getCurrentUser ：它会去检查浏览器的 localStorage （Supabase 自动存储在那里的 JWT），然后向服务器验证这个 JWT 是否依然有效。如果有效，就重新填充缓存，让用户保持登录状态。

export async function getCurrentUser() {
  // 先验证用户是否已登录，若已登录则获取最新用户数据
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  // 逻辑 ：如果本地没有 Session 或者 Session 已过期，直接返回 null 。这意味着用户当前处于未登录状态。
  // session 存储在 localStorage中，主要包含以下内容
  // access_token：真正用于访问 Supabase API 的 JWT。它是短期有效的，比如默认常见是 1 小时左右。
  // refresh_token：用于刷新 session。access token 过期后，Supabase 可以用 refresh token 换一组新的 access_token + refresh_token。
  // expires_at / expires_in：表示 access token 的过期时间。
  // user：当前用户信息。不过要注意，getSession() 返回的 user 是从本地 session 里读出来的，不适合作为高安全级别的授权依据。你的代码后面又调用了 getUser()，这个做法更稳。

  const { data, error } = await supabase.auth.getUser();
  // 安全性 ：虽然 session 对象里已经包含了一些用户信息，但 getCurrentUser 会调用 supabase.auth.getUser() 。
  // 原因 ： getUser() 会向服务器发送请求，通过 JWT 令牌重新从数据库验证用户身份。这是比直接读取本地缓存更安全的做法，因为它可以确保用户的权限是最新的（例如：用户是否被禁用，或者元数据是否已更新）。

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
