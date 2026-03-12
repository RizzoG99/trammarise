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

// api/user-settings/api-key.ts
var api_key_exports = {};
__export(api_key_exports, {
  default: () => handler
});
module.exports = __toCommonJS(api_key_exports);

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

// api/_utils/encryption.ts
var import_crypto = require("crypto");
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 16;
var TAG_LENGTH = 16;
var KEY_LENGTH = 32;
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  if (key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 characters (32 bytes in hex)");
  }
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error("Invalid ENCRYPTION_KEY format");
  }
  return keyBuffer;
}
function encrypt(plaintext) {
  const key = getEncryptionKey();
  const iv = (0, import_crypto.randomBytes)(IV_LENGTH);
  const cipher = (0, import_crypto.createCipheriv)(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}
function decrypt(encryptedData) {
  const key = getEncryptionKey();
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }
  const [ivHex, tagHex, ciphertext] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid IV length");
  }
  if (tag.length !== TAG_LENGTH) {
    throw new Error("Invalid authentication tag length");
  }
  const decipher = (0, import_crypto.createDecipheriv)(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// api/user-settings/api-key.ts
async function handler(req, res) {
  try {
    const { userId } = await requireAuth(req);
    switch (req.method) {
      case "POST":
        return await handleSaveKey(userId, req, res);
      case "GET":
        return await handleGetKey(userId, res);
      case "DELETE":
        return await handleDeleteKey(userId, res);
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in user-settings/api-key:", error);
    if (error instanceof Error && error.name === "AuthError") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
async function handleSaveKey(userId, req, res) {
  const { apiKey, provider = "openai" } = req.body;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ error: "API key is required" });
  }
  if (apiKey.trim().length === 0) {
    return res.status(400).json({ error: "API key cannot be empty" });
  }
  if (provider === "openai" && !apiKey.startsWith("sk-")) {
    return res.status(400).json({
      error: "Invalid OpenAI API key format (must start with sk-)"
    });
  }
  try {
    const encryptedKey = encrypt(apiKey);
    const { error } = await supabaseAdmin.from("user_settings").upsert(
      {
        user_id: userId,
        openai_api_key_encrypted: encryptedKey,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        onConflict: "user_id"
      }
    );
    if (error) {
      console.error("Failed to save API key:", error);
      return res.status(500).json({ error: "Failed to save API key" });
    }
    return res.status(200).json({
      success: true,
      message: "API key saved successfully"
    });
  } catch (error) {
    console.error("Encryption error:", error);
    return res.status(500).json({ error: "Failed to encrypt API key" });
  }
}
async function handleGetKey(userId, res) {
  try {
    const { data: settings, error } = await supabaseAdmin.from("user_settings").select("openai_api_key_encrypted").eq("user_id", userId).maybeSingle();
    if (error) {
      console.error("Failed to fetch API key:", error);
      return res.status(500).json({ error: "Failed to retrieve API key" });
    }
    if (!settings || !settings.openai_api_key_encrypted) {
      return res.status(200).json({
        hasKey: false,
        apiKey: null
      });
    }
    const decryptedKey = decrypt(settings.openai_api_key_encrypted);
    return res.status(200).json({
      hasKey: true,
      apiKey: decryptedKey
    });
  } catch (error) {
    console.error("Decryption error:", error);
    return res.status(500).json({ error: "Failed to decrypt API key" });
  }
}
async function handleDeleteKey(userId, res) {
  try {
    const { error } = await supabaseAdmin.from("user_settings").update({
      openai_api_key_encrypted: null,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("user_id", userId);
    if (error) {
      console.error("Failed to delete API key:", error);
      return res.status(500).json({ error: "Failed to delete API key" });
    }
    return res.status(200).json({
      success: true,
      message: "API key deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return res.status(500).json({ error: "Failed to delete API key" });
  }
}
