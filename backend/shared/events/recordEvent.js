"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordEvent = recordEvent;
const db_1 = require("../db");
const uuid_1 = require("uuid");
async function recordEvent(event) {
    try {
        await db_1.pool.query(`INSERT INTO evidence_events
          (event_id,project_id,user_id,type,source,timestamp,metadata)
          VALUES ($1,$2,$3,$4,$5,NOW(),$6)`, [
            (0, uuid_1.v4)(),
            event.project_id,
            event.user_id,
            event.type,
            event.source,
            event.metadata ? JSON.stringify(event.metadata) : "{}",
        ]);
    }
    catch (error) {
        console.error("DEBUG: Event recording failed:", error);
        throw error;
    }
}
