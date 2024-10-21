import os
import re
import markdown
from bs4 import BeautifulSoup


# Function to sanitize HTML
def sanitize_html(content):
    """Sanitize the HTML content to remove any potentially dangerous tags."""
    allowed_tags = ['p', 'b', 'i', 'a', 'br', 'strong', 'em', 'ul', 'ol', 'li']
    soup = BeautifulSoup(content, 'html.parser')

    for tag in soup.find_all(True):
        if tag.name not in allowed_tags:
            tag.unwrap()  # Remove the tag if it's not allowed
    return str(soup)


# Function to check for sensitive information
def check_sensitive_info(content):
    """Check the content for sensitive information using regex patterns."""
    patterns = [
        r'\b[A-Za-z0-9]{24}\b',  # Example pattern for MongoDB ObjectIDs
        r'\b[0-9a-fA-F]{40}\b',  # Example pattern for SHA-1 hashes
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'  # Example email pattern
    ]

    for pattern in patterns:
        if re.search(pattern, content):
            print("Warning: Potential sensitive information found.")
            return True
    return False


# Main function to validate Markdown files
def validate_markdown_files(directory):
    """Validate all Markdown files in the given directory."""
    for root, _, files in os.walk(directory):
        for filename in files:
            if filename.endswith('.md'):
                filepath = os.path.join(root, filename)

                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()

                    # Sanitize HTML content
                    sanitized_content = sanitize_html(content)

                    # Check for sensitive information
                    if check_sensitive_info(sanitized_content):
                        print(f"Sensitive information detected in {filename}.")

                    # You can save the sanitized content back to the file if needed
                    # with open(filepath, 'w', encoding='utf-8') as file:
                    #     file.write(sanitized_content)

                    print(f"{filename} validated successfully.")


if __name__ == '__main__':
    # Specify the directory containing your Jekyll Markdown files
    jekyll_markdown_directory = '/_posts'  # Update this path
    validate_markdown_files(jekyll_markdown_directory)
