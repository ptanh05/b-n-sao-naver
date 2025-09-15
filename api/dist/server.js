"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Routes will be added soon
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const habits_1 = __importDefault(require("./routes/habits"));
const schedules_1 = __importDefault(require("./routes/schedules"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const pomodoro_sessions_1 = __importDefault(require("./routes/pomodoro_sessions"));
const sync_logs_1 = __importDefault(require("./routes/sync_logs"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3001;
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use((0, cors_1.default)({ origin: ORIGIN, credentials: true }));
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET || 'dev_secret'));
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, name: 'time-management-api' });
});
app.use('/api/auth', auth_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/habits', habits_1.default);
app.use('/api/schedules', schedules_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/pomodoro_sessions', pomodoro_sessions_1.default);
app.use('/api/sync_logs', sync_logs_1.default);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    // Basic error handler
    console.error(err);
    const status = Number(err?.status) || 500;
    res.status(status).json({ message: err?.message || 'Internal server error' });
});
(0, db_1.ensureSchema)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('Failed to ensure schema', err);
    process.exit(1);
});
