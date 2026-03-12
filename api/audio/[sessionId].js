"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/audio/[sessionId].ts
var sessionId_exports = {};
__export(sessionId_exports, {
  default: () => handler
});
module.exports = __toCommonJS(sessionId_exports);

// api/_lib/supabase-admin.ts
var import_supabase_js = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Supabase admin credentials not found. Server-side operations will fail.");
}
var supabaseAdmin = (0, import_supabase_js.createClient)(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// api/_middleware/auth.ts
var AuthError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
};
async function requireAuth(req) {
  const authHeader = req.headers["authorization"];
  const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const token = raw?.startsWith("Bearer ") ? raw.slice(7) : null;
  if (!token) {
    throw new AuthError("Missing authorization token", 401);
  }
  const {
    data: { user },
    error
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new AuthError("Invalid or expired token", 401);
  }
  return { userId: user.id };
}

// api/audio/[sessionId].ts
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { userId } = await requireAuth(req);
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Invalid session ID" });
    }
    const { data: session, error: sessionError } = await supabaseAdmin.from("sessions").select("user_id, audio_url").eq("id", sessionId).single();
    if (sessionError || !session) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (session.user_id !== userId) {
      return res.status(403).json({ error: "Access denied: You do not own this session" });
    }
    if (!session.audio_url || !session.audio_url.includes("audio-files")) {
      return res.status(404).json({ error: "Audio file not found in cloud storage" });
    }
    const urlParts = session.audio_url.split("/audio-files/");
    if (urlParts.length < 2) {
      return res.status(500).json({ error: "Invalid audio URL format" });
    }
    const filePath = urlParts[1];
    const { data: audioBlob, error: downloadError } = await supabaseAdmin.storage.from("audio-files").download(filePath);
    if (downloadError || !audioBlob) {
      console.error("Failed to download audio:", downloadError);
      return res.status(500).json({ error: "Failed to retrieve audio file" });
    }
    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    res.setHeader("Content-Type", audioBlob.type || "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("Accept-Ranges", "bytes");
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Error serving audio:", error);
    if (error instanceof Error && error.name === "AuthError") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
