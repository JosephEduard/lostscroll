import crypto from "crypto";

type EncryptionResult = {
  iv: string;
  tag: string;
  ciphertext: string;
};

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const toCipherKey = (value: Buffer) => value as unknown as crypto.CipherKey;
const toBinaryLike = (value: Buffer) => value as unknown as crypto.BinaryLike;
const toArrayBufferView = (value: Buffer) =>
  value as unknown as NodeJS.ArrayBufferView;
const toUint8 = (value: Buffer) => value as unknown as Uint8Array;

function getKey(): Buffer {
  const keyBase64 = process.env.CLUE_ENCRYPTION_KEY;

  if (!keyBase64) {
    throw new Error("Missing CLUE_ENCRYPTION_KEY in environment.");
  }

  const key = Buffer.from(keyBase64, "base64");

  if (key.length !== 32) {
    throw new Error("CLUE_ENCRYPTION_KEY must be 32 bytes (base64).");
  }

  return key;
}

export function encryptClue(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    toCipherKey(key),
    toBinaryLike(iv),
  );
  const ciphertext = Buffer.concat([
    toUint8(cipher.update(plaintext, "utf8")),
    toUint8(cipher.final()),
  ]);
  const tag = cipher.getAuthTag();

  const payload: EncryptionResult = {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };

  return `${payload.iv}:${payload.ciphertext}:${payload.tag}`;
}

export function decryptClue(payload: string): string {
  const key = getKey();
  const [ivBase64, ciphertextBase64, tagBase64] = payload.split(":");

  if (!ivBase64 || !ciphertextBase64 || !tagBase64) {
    throw new Error("Invalid encrypted clue format.");
  }

  const iv = Buffer.from(ivBase64, "base64");
  const ciphertext = Buffer.from(ciphertextBase64, "base64");
  const tag = Buffer.from(tagBase64, "base64");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    toCipherKey(key),
    toBinaryLike(iv),
  );
  decipher.setAuthTag(toArrayBufferView(tag));

  const plaintext = Buffer.concat([
    toUint8(decipher.update(toArrayBufferView(ciphertext) as Uint8Array)),
    toUint8(decipher.final()),
  ]);

  return plaintext.toString("utf8");
}
