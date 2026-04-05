import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../../services/apiAuth";
import toast from "react-hot-toast";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user.user);
      // 这一行将用户存储在React Query的缓存（浏览器的内存）中，只要刷新页面、关闭标签页或者手动输入 URL 跳转 ，整个 React 应用就会重新启动，内存会被清空，缓存也就随之消失了
      navigate("/dashboard", { replace: true });
    },
    onError: () => {
      toast.error("Provided email or password is not correct");
    },
  });

  return { login, isLoading };
}

// ### 既然会消失，为什么还要写这一行？
// 这一行代码的主要目的是为了**“丝滑过渡”**：

// - 当用户点击“登录”按钮并成功后，我们 已经 拿到了用户信息。
// - 如果不写这一行，直接跳转到 /dashboard ，Dashboard 页面调用的 useUser 发现缓存是空的，会立即显示一个“加载中”的菊花（Spinner），然后发请求去问服务器：“我是谁？”
// - 加上这一行，缓存里立刻就有数据了。跳转后，Dashboard 就能 瞬间 显示出“欢迎，XXX”，用户体验非常好，没有那种“闪烁”感。
// ### 3. 刷新后靠什么“活”过来？
// 既然刷新后缓存没了，为什么用户不需要重新登录呢？这就要靠我们之前讨论过的 getCurrentUser 了：
// 1. 持久化存储 ：虽然 React Query 缓存没了，但 Supabase 已经悄悄把“通行证”（Session/Token）存到了浏览器的 localStorage 里（这是持久化的，刷新不会掉）。
// 2. 应用启动 ：页面刷新，React 应用加载。
// 3. 重新拉取 ：应用最顶层的路由守卫（或 useUser ）会运行 getCurrentUser 。
// 4. 恢复缓存 ： getCurrentUser 发现 localStorage 里有 Token，于是去服务器验证一下，验证通过后，服务器返回用户信息，React Query 再次把这个信息存入缓存。
// ### 总结一下这个流程：
// - 登录成功瞬间 ： setQueriesData 直接写缓存  → 页面瞬间跳转  → 用户体验满分 。
// - 页面刷新瞬间 ：缓存丢失  → getCurrentUser 读 localStorage 验证  → 重新写回缓存  → 登录状态保持 。
// 所以，这一行代码是 为了当前的“快” ，而 getCurrentUser 是 为了长期的“稳” 。两者配合，才是一个完整的认证系统
