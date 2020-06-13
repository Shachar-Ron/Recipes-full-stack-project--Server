CREATE TABLE [dbo].[user_recipe](
	[username] [varchar](30) PRIMARY KEY NOT NULL,
    [last_search] [varchar](30) NOT NULL,
    FOREIGN KEY (username) REFERENCES [dbo].[users]([username])
)