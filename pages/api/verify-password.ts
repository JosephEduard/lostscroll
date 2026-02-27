import type { NextApiRequest, NextApiResponse } from "next";

import bcrypt from "bcryptjs";

import clientPromise from "@/lib/mongodb";
import { decryptClue } from "@/lib/clue-crypto";

type VerifyResponse = {
  ok: boolean;
  message?: string;
  clue?: string;
  clue2?: string;
  clue3?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  const { password } = req.body as { password?: string };

  if (typeof password !== "string") {
    return res.status(400).json({ ok: false, message: "Code required." });
  }

  const normalized = password.trim();

  if (normalized.length !== 6) {
    return res
      .status(400)
      .json({ ok: false, message: "Code must be exactly 6 characters." });
  }

  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB;

    if (!dbName) {
      return res
        .status(500)
        .json({ ok: false, message: "Server misconfigured." });
    }

    const collectionName = process.env.PASSWORD_COLLECTION || "thelostscroll";
    const collection = client.db(dbName).collection(collectionName);

    const record = await collection.findOne({ key: "lost-scroll" });

    if (!record || typeof record.passwordHash !== "string") {
      return res
        .status(500)
        .json({ ok: false, message: "Code not configured." });
    }

    const isMatch = await bcrypt.compare(normalized, record.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ ok: false, message: "Invalid code." });
    }

    const clue =
      typeof record.clue === "string" ? decryptClue(record.clue) : "";
    const clue2 =
      typeof record.clue2 === "string" ? decryptClue(record.clue2) : "";
    const clue3 =
      typeof record.clue3 === "string" ? decryptClue(record.clue3) : "";

    return res.status(200).json({ ok: true, clue, clue2, clue3 });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Server error." });
  }
}
