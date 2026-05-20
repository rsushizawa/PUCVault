// Non-interactive endpoint sweep using cookie-based auth (current API model).
const BASE = "http://localhost:8000";
let cookie = ""; // captured from Set-Cookie on login

const results = [];

async function call(desc, method, path, { body, useAuth = false, expect } = {}) {
  const headers = {};
  let payload;
  if (body) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  if (useAuth && cookie) headers["Cookie"] = cookie;
  let status = 0, snippet = "", setCookie = null;
  try {
    const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
    status = res.status;
    setCookie = res.headers.get("set-cookie");
    const text = await res.text();
    snippet = text.slice(0, 160).replace(/\s+/g, " ");
  } catch (e) {
    snippet = "FETCH ERROR: " + e.message;
  }
  results.push({ desc, method, path, status, snippet });
  if (setCookie && /auth_token=/.test(setCookie)) {
    cookie = setCookie.split(";")[0];
  }
  return status;
}

async function main() {
  // --- login first (capture cookie) ---
  await call("login (ADMIN)", "POST", "/auth/login", { body: { userEmail: "ADMIN", password: "ADMIN1234" } });

  // discover an id to use for /me-derived params
  let meId = null, forumId = null, postId = null, username = null;
  const meRes = await fetch(`${BASE}/user/me`, { headers: cookie ? { Cookie: cookie } : {} });
  if (meRes.ok) { const m = await meRes.json().catch(() => ({})); const u = m.data ?? m.user ?? m; meId = u.id ?? u.user_id; username = u.nome_usuario ?? u.username; }

  // grab a forum + post id from public listings
  const fr = await fetch(`${BASE}/forums/print/forums`); const fdata = await fr.json().catch(() => []);
  if (Array.isArray(fdata) && fdata[0]) forumId = fdata[0].id ?? fdata[0].forum_id;
  else if (fdata?.data?.[0]) forumId = fdata.data[0].id ?? fdata.data[0].forum_id;

  const A = { useAuth: true };
  // ---------- AUTH ----------
  await call("auth: print logins", "GET", "/auth/print/logins");
  await call("auth: logout", "POST", "/auth/logout", A);
  // re-login since we just logged out
  await call("login again", "POST", "/auth/login", { body: { userEmail: "ADMIN", password: "ADMIN1234" } });
  await call("auth: change-password (PATCH)", "PATCH", "/auth/change-password", { ...A, body: { password: "x", new_password: "y", confirm: "y" } });
  await call("auth: change-password (POST=tester)", "POST", "/auth/change-password", { ...A, body: {} });

  // ---------- USER ----------
  await call("user: me", "GET", "/user/me", A);
  if (username) await call("user: by-username", "GET", `/user/by-username/${username}`);
  if (meId != null) {
    await call("user: info by id", "GET", `/user/${meId}`, A);
    await call("user: followed forums", "GET", `/user/${meId}/forums`);
    await call("user: is-following", "GET", `/user/${meId}/is-following`, A);
    if (forumId != null) await call("user: forum-follow check", "GET", `/user/${meId}/forum-follow/${forumId}`);
  }
  await call("user: toggle-2fa", "PATCH", "/user/toggle-2fa", A);
  await call("user: toggle-2fa (restore)", "PATCH", "/user/toggle-2fa", A);

  // ---------- FORUM ----------
  await call("forum: print", "GET", "/forums/print/forums");
  if (forumId != null) {
    await call("forum: single", "GET", `/forums/${forumId}`, A);
    await call("forum: list followers", "GET", `/forums/${forumId}/list`);
    await call("forum: files year", "GET", `/forums/${forumId}/files/year`);
  }

  // ---------- POSTS ----------
  if (forumId != null) {
    await call("posts: list page1", "GET", `/posts/${forumId}/page/1`);
    const pr = await fetch(`${BASE}/posts/${forumId}/page/1`); const pdata = await pr.json().catch(() => ({}));
    const arr = Array.isArray(pdata) ? pdata : (pdata.data || pdata.posts || []);
    if (arr[0]) postId = arr[0].id ?? arr[0].post_id ?? arr[0].content_id;
  }
  if (postId != null) {
    await call("posts: single", "GET", `/posts/${postId}`);
    await call("posts: files", "GET", `/posts/${postId}/files`);
    await call("posts: comments", "GET", `/posts/${postId}/comments`);
  }
  if (meId != null) await call("posts: by user", "GET", `/posts/user/${meId}`);

  // ---------- TAGS ----------
  await call("tags: getTags", "GET", "/tags/");
  await call("tags: search", "GET", "/tags/search?q=a");
  if (meId != null) await call("tags: user print", "GET", `/tags/${meId}/print`);

  // ---------- FEED ----------
  await call("feed: page1", "GET", "/feed/page/1", A);

  // ---------- DENUNCIAS ----------
  await call("denuncias: list", "GET", "/denuncias/", A);

  // ---------- IMAGE ----------
  if (meId != null) await call("image: get user urls", "GET", `/image/get/user/${meId}`);
  if (forumId != null) await call("image: get forum urls", "GET", `/image/get/forum/${forumId}`);

  // ---- report ----
  console.log("\nDISCOVERED: meId=%s username=%s forumId=%s postId=%s\n", meId, username, forumId, postId);
  for (const r of results) {
    const icon = r.status >= 200 && r.status < 300 ? "OK " : (r.status === 0 ? "ERR" : "!! ");
    console.log(`${icon} ${String(r.status).padEnd(3)} ${r.method.padEnd(6)} ${r.path}`);
    if (r.status >= 400 || r.status === 0) console.log(`        -> ${r.snippet}`);
  }
}
main();
