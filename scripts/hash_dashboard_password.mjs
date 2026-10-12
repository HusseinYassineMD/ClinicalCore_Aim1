#!/usr/bin/env node
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash_dashboard_password.mjs '<password>'");
  process.exit(1);
}
console.log(bcrypt.hashSync(password, 10));
