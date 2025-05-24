import { chmodSync } from "fs";
chmodSync("node_modules/.bin/vite", 0o755);
