import app from "./app.js";
import { config } from "./configs/index.js";

app.listen(config.port, () => {
  console.log(`App is listening on http://localhost:${config.port}`);
});
