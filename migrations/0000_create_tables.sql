-- Migration number: 0000 	 2023-02-11T05:04:54.247Z
CREATE TABLE "users" (
	"id"	TEXT NOT NULL UNIQUE PRIMARY KEY,
	"name"	TEXT NOT NULL,
	"email"	TEXT NOT NULL,
	"avatar"	TEXT NOT NULL,
	"type"	INTEGER NOT NULL,
	"createdAt"	INTEGER NOT NULL
);

CREATE TABLE "boards" (
	"id"	TEXT NOT NULL UNIQUE PRIMARY KEY,
	"name"	TEXT NOT NULL,
	"author"	TEXT NOT NULL,
	"slug"	TEXT NOT NULL UNIQUE,
	"isPublic"	INTEGER DEFAULT 0,
	"isPermanent"	INTEGER DEFAULT 0,
	"createdAt"	INTEGER NOT NULL,
	"modifiedAt"	INTEGER NOT NULL
);
