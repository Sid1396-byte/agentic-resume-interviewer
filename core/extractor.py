import io
import pdfplumber
from docx import Document

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """Extracts text from a PDF or DOCX file."""
    ext = filename.lower().split('.')[-1]
    
    if ext == 'pdf':
        text = ""
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            return f"Error extracting PDF: {str(e)}"
            
    elif ext in ['docx', 'doc']:
        try:
            doc = Document(io.BytesIO(file_bytes))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text.strip()
        except Exception as e:
            return f"Error extracting Word Document: {str(e)}"
            
    return f"Unsupported file type: {ext}"
