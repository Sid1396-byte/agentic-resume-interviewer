from mcp.server.fastmcp import FastMCP
from tavily import TavilyClient
import os

# Create the FastMCP server
mcp = FastMCP("Tavily Search Server")

@mcp.tool()
def tavily_search(query: str, search_depth: str = "advanced") -> str:
    """Perform a web search using Tavily API to find deep technical information about a skill, industry standards, and best practices."""
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return "Error: TAVILY_API_KEY not found in environment."
    try:
        tavily_client = TavilyClient(api_key=api_key)
        search_response = tavily_client.search(query=query, search_depth=search_depth)
        search_context = "\n".join([f"- {result['content']}" for result in search_response.get("results", [])])
        return search_context
    except Exception as e:
        return f"Error performing web search: {str(e)}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
