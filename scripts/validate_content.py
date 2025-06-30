import os
import re
from time import sleep

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
        (r'\b[A-Fa-f0-9]{24}\b', 'MongoDB ObjectID'),
        (r'\b[0-9a-fA-F]{40}\b', 'SHA-1 Hash'),
        (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', 'Email Address'),
        (r'(\b4[0-9]{12}(?:[0-9]{3})?\b|\b5[1-5][0-9]{14}\b|\b3[47][0-9]{13}\b|\b6(?:011|5[0-9]{2})[0-9]{12}\b)', 'Credit Card'),
        (r'(?i)\b(?:AKIA|ASIA|AIza)[A-Z0-9]{16}\b', 'AWS API Key'),
        (r'(?i)\bghp_[A-Za-z0-9]{36}\b', 'GitHub Token'),
        (r'(?i)\bAIza[0-9A-Za-z]{35}\b', 'Google API Key'),
        (r'\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b', 'UID'),
        (r'(?i)(-----BEGIN [A-Z ]+ PRIVATE KEY-----.*?-----END [A-Z ]+ PRIVATE KEY-----)', 'Private Key'),
        (r'(?i)\beyJ[a-zA-Z0-9_-]+\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\b', 'JWT Token'),
        (r'\b1[1-9A-HJ-NP-Za-km-z]{25,34}\b', 'Bitcoin Address'),
        (r'\b0x[a-fA-F0-9]{40}\b', 'Ethereum Address'),
        (r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', 'IPv4 Address'),
        (r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b', 'IPv6 Address'),
        (r'(?i)\b[a-f0-9]{32}\b', 'API Token'),
        (r'\b\d{3}-\d{2}-\d{4}\b', 'SSN'),
        (r'\b[0-9]{9}\b', 'Passport Number'),
        (r'\b\d{3,4}\b', 'CVV Code'),
    ]

    matches = []  # List to store sensitive matches

    # Iterate over the patterns and find matches
    for pattern, label in patterns:
        found = re.findall(pattern, content)
        if found:
            for match in found:
                matches.append((match, label))

    return matches


# Main function to validate Markdown files
def validate_markdown_files(directory):
    """Validate all Markdown files in the given directory."""
    processed_files = set()  # Set to track processed files

    for root, _, files in os.walk(directory):
        for filename in files:
            if filename.endswith('.markdown'):  # Process only markdown files
                filepath = os.path.join(root, filename)

                # Skip if file has already been processed
                if filepath in processed_files:
                    continue

                try:
                    with open(filepath, 'r', encoding='utf-8') as file:
                        content = file.read()

                        # Sanitize HTML content
                        sanitized_content = sanitize_html(content)

                        # Check for sensitive information and print the exact sensitive data found
                        sensitive_data = check_sensitive_info(sanitized_content)
                        if sensitive_data:
                            print(f"Sensitive information detected in {filename}:")
                            for data, label in sensitive_data:
                                # Handle specific formatting for IPv4 addresses
                                if label == 'IPv4 Address':
                                    print(f"  - IPV4 Found: {data}")
                                else:
                                    print(f"  - {label}: {data}")  # Print the exact sensitive string with its label

                        print(f"{filename} validated successfully.")

                    # Mark the file as processed
                    processed_files.add(filepath)

                except Exception as e:
                    print(f"Error validating {filename}: {e}")

                # Sleep between file validations to avoid overwhelming the system
                sleep(1)

# Validate files in multiple directories
def validate_multiple_directories(directories):
    """Validate Markdown files across multiple directories."""
    for directory in directories:
        print(f"Validating directory: {directory}")
        validate_markdown_files(directory)
        print(f"Finished validating directory: {directory}")


if __name__ == '__main__':
    # List of directories to validate
    directories_to_validate = [
        './_layouts/',  # Example directory
        './_projects/',  # Another directory to validate (add your own)
        './_site/',  # You can add more directories here
        './_snippets/',
        './_tutorials/'
    ]

    validate_multiple_directories(directories_to_validate)
