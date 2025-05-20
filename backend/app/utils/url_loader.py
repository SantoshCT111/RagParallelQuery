
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document # For type hinting if desired

def load_and_split_multiple_urls(urls: list[str]) -> list[Document]:
    """
    Loads content from a list of URLs using WebBaseLoader,
    then splits the loaded documents into smaller chunks.

    Args:
        urls: A list of URL strings to load content from.

    Returns:
        A list of Document objects, where each document is a chunk
        from one of the loaded web pages.
    """
    print(f"Attempting to load content from {len(urls)} URL(s)...")

    # Initialize WebBaseLoader with the list of URLs
    # You can add headers or other configurations here if needed, for example:
    # headers = {
    #     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    # }
    # loader = WebBaseLoader(web_paths=urls, header_template=headers)
    loader = WebBaseLoader(web_paths=urls)

    # Load the documents from all URLs
    # This will return a list of Document objects, typically one per URL.
    try:
        initial_documents = loader.load()
        print(f"Successfully loaded {len(initial_documents)} document(s) before splitting.")
        if not initial_documents:
            print("No documents were loaded. Please check the URLs and network connection.")
            return []
    except Exception as e:
        print(f"An error occurred during loading: {e}")
        return []


    # Initialize the text splitter
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # The maximum size of each chunk (in characters)
        chunk_overlap=200) # The number of characters to overlap between chunks
        

    # Split the loaded documents into smaller chunks
    print("\nSplitting documents...")
    split_docs = splitter.split_documents(initial_documents)

    print(f"Successfully split into {len(split_docs)} chunks.")

    return split_docs