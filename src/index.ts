import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use(routes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(
    `Server running on port ${config.port} in ${config.nodeEnv} mode`
  );
});
