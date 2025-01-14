import { Pool } from "pg";
import "dotenv/config";

const connectionPool = new Pool({
  connectionString: process.env.DB_POSTGRES_DATABASE_URL,
});

export default connectionPool;
