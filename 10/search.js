import OpenAI from 'openai';
import fs from 'fs';
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load products data
let products = [];
try {
  const data = fs.readFileSync('products.json', 'utf8');
  products = JSON.parse(data);
  console.log(`Loaded ${products.length} products from database.`);
} catch (error) {
  console.error('Error loading products.json:', error.message);
  process.exit(1);
}

// Function definition for OpenAI function calling
const filterProductsFunction = {
  name: 'filter_products',
  description: 'Filter products based on user preferences including category, price range, rating, and availability',
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Product category (e.g., Electronics, Fitness, Kitchen, Books, Clothing)',
        enum: ['Electronics', 'Fitness', 'Kitchen', 'Books', 'Clothing']
      },
      max_price: {
        type: 'number',
        description: 'Maximum price limit for products'
      },
      min_price: {
        type: 'number',
        description: 'Minimum price limit for products'
      },
      min_rating: {
        type: 'number',
        description: 'Minimum rating requirement (0-5 scale)'
      },
      in_stock: {
        type: 'boolean',
        description: 'Whether to filter for products that are in stock'
      }
    },
    required: []
  }
};

// Function to apply filters to products using OpenAI's extracted parameters
function applyFilters(products, filters) {
  return products.filter(product => {
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // Price range filters
    if (filters.max_price !== undefined && product.price > filters.max_price) {
      return false;
    }
    
    if (filters.min_price !== undefined && product.price < filters.min_price) {
      return false;
    }
    
    // Rating filter
    if (filters.min_rating !== undefined && product.rating < filters.min_rating) {
      return false;
    }
    
    // Stock filter
    if (filters.in_stock !== undefined && product.in_stock !== filters.in_stock) {
      return false;
    }
    
    return true;
  });
}

// Function to format and display products
function displayProducts(filteredProducts) {
  if (filteredProducts.length === 0) {
    console.log('\nNo products found matching your criteria.');
    return;
  }
  
  console.log('\nFiltered Products:');
  filteredProducts.forEach((product, index) => {
    const stockStatus = product.in_stock ? 'In Stock' : 'Out of Stock';
    console.log(`${index + 1}. ${product.name} - $${product.price}, Rating: ${product.rating}, ${stockStatus}`);
  });
  console.log(`\nFound ${filteredProducts.length} matching product(s).`);
}

// Main search function using OpenAI function calling
async function searchProducts(userQuery) {
  try {
    console.log(`\nProcessing query: "${userQuery}"`);
    
    // Call OpenAI with function calling to extract filters
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts product search filters from natural language queries. Use the filter_products function to parse user preferences.'
        },
        {
          role: 'user',
          content: userQuery
        }
      ],
      functions: [filterProductsFunction],
      function_call: { name: 'filter_products' }
    });

    // Extract function call arguments
    const functionCall = response.choices[0].message.function_call;
    if (!functionCall) {
      console.log('Could not parse your query. Please try rephrasing your search.');
      return;
    }

    const filters = JSON.parse(functionCall.arguments);
    console.log('Extracted filters:', filters);

    // Apply filters to products
    const filteredProducts = applyFilters(products, filters);
    
    // Display results
    displayProducts(filteredProducts);

  } catch (error) {
    console.error('Error processing search:', error.message);
    if (error.code === 'insufficient_quota') {
      console.log('OpenAI API quota exceeded. Please check your API usage.');
    } else if (error.code === 'invalid_api_key') {
      console.log('Invalid OpenAI API key. Please check your .env file.');
    }
  }
}

// Console interface setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Welcome message and instructions
function showWelcome() {
  console.log('='.repeat(60));
  console.log('🔍 PRODUCT SEARCH TOOL');
  console.log('='.repeat(60));
  console.log('Search products using natural language!');
  console.log('\nExample queries:');
  console.log('• "gaming laptop under $1500 with 4.5+ rating"');
  console.log('• "fitness equipment in stock under $100"');
  console.log('• "electronics with rating above 4.6"');
  console.log('• "kitchen appliances between $50 and $200"');
  console.log('\nAvailable categories: Electronics, Fitness, Kitchen, Books, Clothing');
  console.log('\nType "exit" to quit, "help" for examples\n');
}

// Help function
function showHelp() {
  console.log('\n📖 HELP - Example Search Queries:');
  console.log('• "Show me electronics under $100"');
  console.log('• "I want fitness equipment with 4+ rating"');
  console.log('• "Kitchen appliances that are in stock"');
  console.log('• "Books with rating above 4.5"');
  console.log('• "Clothing items between $20 and $50"');
  console.log('• "Gaming laptop under $1500 with high rating"');
  console.log('• "Cheap fitness equipment under $30"');
  console.log('• "Premium electronics with 4.7+ rating"');
}

// Main interactive loop
async function startSearch() {
  showWelcome();
  
  const askQuestion = () => {
    rl.question('🔍 Enter your search query: ', async (input) => {
      const query = input.trim();
      
      if (query.toLowerCase() === 'exit') {
        console.log('Thanks for using Product Search Tool! Goodbye! 👋');
        rl.close();
        return;
      }
      
      if (query.toLowerCase() === 'help') {
        showHelp();
        askQuestion();
        return;
      }
      
      if (query === '') {
        console.log('Please enter a search query.');
        askQuestion();
        return;
      }
      
      await searchProducts(query);
      console.log('\n' + '-'.repeat(40));
      askQuestion();
    });
  };
  
  askQuestion();
}

// Error handling for missing API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in environment variables.');
  console.log('Please create a .env file with your OpenAI API key:');
  console.log('OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Start the application
startSearch(); 