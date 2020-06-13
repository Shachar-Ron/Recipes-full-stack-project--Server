CREATE TABLE [dbo].[users](
	[user_id] [int] IDENTITY(1,1) NOT NULL,
	[username] [varchar](30) NOT NULL UNIQUE,
	[firstname] [varchar](30) NOT NULL,
	[lastname] [varchar](30) NOT NULL,
	[country] [varchar](30) NOT NULL,
	[email] [varchar](30) NOT NULL,
	[imageUrl] [varchar](250),
	[password] [varchar](300) NOT NULL,
	PRIMARY KEY ([user_id])
)

