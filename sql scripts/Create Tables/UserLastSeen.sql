CREATE TABLE [dbo].[user_last_seen](
	[username] [varchar](30) NOT NULL,
    [first_last_seen] [int],
    [secound_last_seen] [int],
    [third_last_seen] [int],
    PRIMARY KEY ([username]),
    FOREIGN KEY (username) REFERENCES [dbo].[users]([username])
)