const BASE = "http://localhost:8000";
let cookie = "";
async function login() {
  const r = await fetch(`${BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userEmail: "ADMIN", password: "ADMIN1234" }) });
  cookie = (r.headers.get("set-cookie") || "").split(";")[0];
}
function shape(v, depth = 0) {
  if (v === null) return "null";
  if (Array.isArray(v)) return v.length ? `[${shape(v[0], depth)} ...x${v.length}]` : "[]";
  if (typeof v === "object") {
    if (depth > 1) return "{...}";
    return "{ " + Object.keys(v).map(k => `${k}: ${shape(v[k], depth + 1)}`).join(", ") + " }";
  }
  return typeof v;
}
async function dump(label, path) {
  const r = await fetch(`${BASE}${path}`, { headers: { Cookie: cookie } });
  let body; try { body = await r.json(); } catch { body = await r.text(); }
  console.log(`\n### ${label}  [${r.status}]  ${path}`);
  console.log("  shape:", shape(body));
}
(async () => {
  await login();
  await dump("getMe /user/me", "/user/me");
  await dump("getUserInfo /user/:id", "/user/26");
  await dump("getUserFollowedForums", "/user/26/forums");
  await dump("isFollowingUser", "/user/26/is-following");
  await dump("checkForumFollow", "/user/26/forum-follow/1");
  await dump("getForums /forums/print/forums", "/forums/print/forums");
  await dump("getCommunity /forums/:id", "/forums/1");
  await dump("getForumFollowers /forums/:id/list", "/forums/1/list");
  await dump("getFileYears", "/forums/1/files/year");
  await dump("getCommunityPosts /posts/:fid/page/1", "/posts/1/page/1");
  await dump("getPost /posts/:id", "/posts/110");
  await dump("getComments /posts/:id/comments", "/posts/110/comments");
  await dump("getUserPosts /posts/user/:id", "/posts/user/26");
  await dump("getFeed /feed/page/1", "/feed/page/1");
  await dump("getTags /tags", "/tags");
  await dump("searchTags /tags/search", "/tags/search?q=a");
})();
