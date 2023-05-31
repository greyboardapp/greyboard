-- Migration number: 0004 	 2023-05-21T07:45:33.977Z
CREATE TABLE "access" (
	"id"	TEXT NOT NULL UNIQUE PRIMARY KEY,
    "board" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "type" INTEGER NOT NULL
);
