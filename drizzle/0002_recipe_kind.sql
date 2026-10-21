-- Recipe Studio: structured recipes live in the same posts table.
-- kind = 'article' (default, renders on /blog) or 'recipe' (renders on /recipes).
-- recipe_json holds the structured RecipeDraft (ingredients/steps/times/...).
ALTER TABLE posts ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'article';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS recipe_json TEXT;
