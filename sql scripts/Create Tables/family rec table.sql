CREATE TABLE [dbo].[family_recipes](
	[recipe_id] [int] IDENTITY(1,1) NOT NULL,
	[author] [int] NOT NULL,
	[rec_name] [varchar](300) NOT NULL,
	[rec_image_url] [text] NOT NULL,
	[rec_time] [int] NOT NULL,
	[rec_popularity] [int] NOT NULL,
	[rec_vegan] [bit] NOT NULL,
	[rec_vegetarian] [bit] NOT NULL,
	[rec_gluten] [bit] NOT NULL,
	[rec_ingredients] [text] NOT NULL,
	[instructions] [text] NOT NULL,
	[rec_number_of_dishes] [int] NOT NULL,
	[whos_rec] [varchar](300) NOT NULL,
	[what_holiday] [varchar](300) NOT NULL,
	PRIMARY KEY ([author], [recipe_id]),
	FOREIGN KEY ([author]) REFERENCES [dbo].[users]([user_id])
)
