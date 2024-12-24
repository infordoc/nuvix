import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: ['**/*.entity.ts'],
  migrations: ['src/database-migrations/*-migration.ts'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;