# Product Search Tool

A console-based product search tool that uses OpenAI's function calling to parse natural language queries and filter products from a JSON dataset.

## Features

- **Natural Language Processing**: Use everyday language to search for products
- **OpenAI Function Calling**: Leverages GPT-4.1-mini to parse search preferences into structured filters
- **Smart Filtering**: Filter by category, price range, rating, and stock availability
- **Interactive Console**: User-friendly command-line interface with help and examples

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

Get your API key from: https://platform.openai.com/api-keys

3. Ensure `products.json` is in the project directory (it should already be there)

## Usage

Start the application:
```bash
npm start
```

Then enter your search queries in natural language:

### Example Queries

- `"gaming laptop under $1500 with 4.5+ rating"`
- `"fitness equipment in stock under $100"`
- `"electronics with rating above 4.6"`
- `"kitchen appliances between $50 and $200"`
- `"books with high rating"`
- `"cheap clothing under $30"`

### Commands

- Type `help` to see more example queries
- Type `exit` to quit the application

## How It Works

1. **User Input**: You enter a natural language query
2. **OpenAI Processing**: The query is sent to GPT-4.1-mini with a function definition
3. **Function Calling**: OpenAI extracts structured filters (category, price range, rating, stock status)
4. **Product Filtering**: The extracted filters are applied to the products dataset
5. **Results Display**: Matching products are displayed in a clean, formatted list

## Filter Parameters

The tool can extract and apply these filters:

- **Category**: Electronics, Fitness, Kitchen, Books, Clothing
- **Price Range**: Minimum and maximum price limits
- **Rating**: Minimum rating requirement (0-5 scale)
- **Stock Status**: Whether to show only in-stock items

## Error Handling

- Handles API key validation
- Manages API quota limits
- Gracefully handles network errors
- Validates search queries and provides helpful feedback

## Requirements

- Node.js 14+ 
- OpenAI API key
- Internet connection for API calls

## Dataset

The tool searches through 50 products across 5 categories:
- Electronics (10 products)
- Fitness (10 products) 
- Kitchen (10 products)
- Books (10 products)
- Clothing (10 products)

Each product includes name, category, price, rating, and stock status. 