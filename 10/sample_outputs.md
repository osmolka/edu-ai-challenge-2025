# Sample Application Outputs

This file demonstrates three sample runs of the Product Search Tool with different user queries and their corresponding outputs.

## Sample Run 1: Category + Price + Rating Filter

**User Query:** `"gaming laptop under $1500 with 4.5+ rating"`

```
🔍 Enter your search query: gaming laptop under $1500 with 4.5+ rating

Processing query: "gaming laptop under $1500 with 4.5+ rating"
Extracted filters: { category: 'Electronics', max_price: 1500, min_rating: 4.5 }

Filtered Products:
1. Wireless Headphones - $99.99, Rating: 4.5, In Stock
2. Gaming Laptop - $1299.99, Rating: 4.8, Out of Stock
3. Smart Watch - $199.99, Rating: 4.6, In Stock
4. 4K Monitor - $349.99, Rating: 4.7, In Stock
5. Smartphone - $799.99, Rating: 4.5, Out of Stock
6. Noise-Cancelling Headphones - $299.99, Rating: 4.8, In Stock

Found 6 matching product(s).
```

---

## Sample Run 2: Category + Stock Status + Price Filter

**User Query:** `"fitness equipment in stock under $100"`

```
🔍 Enter your search query: fitness equipment in stock under $100

Processing query: "fitness equipment in stock under $100"
Extracted filters: { category: 'Fitness', max_price: 100, in_stock: true }

Filtered Products:
1. Yoga Mat - $19.99, Rating: 4.3, In Stock
2. Resistance Bands - $14.99, Rating: 4.1, In Stock
3. Kettlebell - $39.99, Rating: 4.3, In Stock
4. Foam Roller - $24.99, Rating: 4.5, In Stock
5. Pull-up Bar - $59.99, Rating: 4.4, In Stock
6. Jump Rope - $9.99, Rating: 4.0, In Stock
7. Ab Roller - $19.99, Rating: 4.2, In Stock

Found 7 matching product(s).
```

---

## Sample Run 3: Price Range Filter

**User Query:** `"kitchen appliances between $50 and $200"`

```
🔍 Enter your search query: kitchen appliances between $50 and $200

Processing query: "kitchen appliances between $50 and $200"
Extracted filters: { category: 'Kitchen', min_price: 50, max_price: 200 }

Filtered Products:
1. Air Fryer - $89.99, Rating: 4.6, In Stock
2. Microwave Oven - $129.99, Rating: 4.5, Out of Stock
3. Coffee Maker - $79.99, Rating: 4.3, In Stock
4. Rice Cooker - $59.99, Rating: 4.3, In Stock
5. Pressure Cooker - $99.99, Rating: 4.7, In Stock

Found 5 matching product(s).
```

---

## Sample Run 4: No Results Found

**User Query:** `"premium smartphones under $100"`

```
🔍 Enter your search query: premium smartphones under $100

Processing query: "premium smartphones under $100"
Extracted filters: { category: 'Electronics', max_price: 100 }

No products found matching your criteria.
```

---

## Sample Run 5: High Rating Filter

**User Query:** `"books with rating above 4.5"`

```
🔍 Enter your search query: books with rating above 4.5

Processing query: "books with rating above 4.5"
Extracted filters: { category: 'Books', min_rating: 4.5 }

Filtered Products:
1. Programming Guide - $49.99, Rating: 4.7, In Stock
2. Cookbook: Easy Recipes - $24.99, Rating: 4.5, In Stock
3. History of Science - $39.99, Rating: 4.6, In Stock
4. Children's Picture Book - $12.99, Rating: 4.5, In Stock

Found 4 matching product(s).
```

---

## Notes

- The application uses OpenAI's GPT-4.1-mini with function calling to extract structured filters from natural language queries
- Filters can include: category, price range (min/max), rating threshold, and stock availability
- The output format shows: product name, price, rating, and stock status
- When no products match the criteria, a clear "No products found" message is displayed
- The extracted filters are shown for transparency, demonstrating how the AI interprets the natural language query 