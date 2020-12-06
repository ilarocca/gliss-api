CREATE TABLE items (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  item_name VARCHAR(50) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);