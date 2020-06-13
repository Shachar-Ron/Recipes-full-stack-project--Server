/****** Script for SelectTopNRows command from SSMS  ******/
SELECT TOP (100) [user_id]
      ,[username]
      ,[password]
  FROM [dbo].[users]