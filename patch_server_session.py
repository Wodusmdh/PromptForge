import sys

with open('server.ts', 'r') as f:
    content = f.read()

replacement = """import crypto from "crypto";

app.use((req, res, next) => {
  let cookies = req.headers.cookie || "";
  let pfSession = null;
  
  // manually parse cookie
  const match = cookies.match(/pf_session=([^;]+)/);
  if (match) {
    pfSession = match[1];
  } else {
    pfSession = crypto.randomUUID();
    res.cookie("pf_session", pfSession, { path: "/", sameSite: "lax", httpOnly: true });
    req.headers.cookie = `${cookies ? cookies + "; " : ""}pf_session=${pfSession}`;
  }
  next();
});

app.use("/api/v1", createApiRouter());"""

content = content.replace('app.use("/api/v1", createApiRouter());', replacement)

with open('server.ts', 'w') as f:
    f.write(content)
