CREATE TABLE [dbo].[user_favorites](
	[username] [varchar](30) NOT NULL,
    [rec_id] [varchar](30) NOT NULL,
    FOREIGN KEY (username) REFERENCES [dbo].[users]([username])
)