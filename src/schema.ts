// src/schema.ts
import { mysqlTable, serial, varchar, text, timestamp, boolean, json } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),   // bcrypt hash
  role: varchar('role', { length: 50 }).notNull().$default(() => 'USER'),
  username: varchar('username', { length: 255 }),
  avatar: text('avatar'),
  chatHistory: json('chatHistory').$type<any[]>().$default(() => []),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
});