import 'dotenv/config';
import app from './app.js';
import logger from './logs/logger.js';
import config  from './config/env.js';
import { sequelize } from './database/database.js';     

async function main() {
    await sequelize.sync({ force: false });
    const port = config.PORT;
    app.listen(port);
    logger.info('Server started on port ' + port);
    logger.error('this is an error message');
    logger.warn('this is a warning message');
    logger.fatal('this is a fatal message');
}

main();