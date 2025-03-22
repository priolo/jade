import { jest } from '@jest/globals';
import fromPDFToText from '../../src/textualize/pdf';



// Mock pdfjs-dist
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn().mockImplementation((path) => {
    if (path === 'not-found.pdf') {
      return {
        promise: Promise.reject(new Error('File not found'))
      };
    }
    
    if (path === 'empty.pdf') {
      return {
        promise: Promise.resolve({
          numPages: 0
        })
      };
    }
    
    // Mock a standard PDF with content
    return {
      promise: Promise.resolve({
        numPages: 2,
        getPage: jest.fn().mockImplementation(pageNum => {
          return Promise.resolve({
            getTextContent: jest.fn().mockResolvedValue({
              items: [
                { str: `Text content from page ${pageNum} part 1. ` },
                { str: `Text content from page ${pageNum} part 2.` },
                { other: 'property' } // Test item without 'str' property
              ]
            })
          });
        })
      })
    };
  })
}));

describe('fromPDFToText', () => {
  it('should extract text from a PDF file', async () => {
    const result = await fromPDFToText('test.pdf');
    expect(result).toBe(
      'Text content from page 1 part 1. Text content from page 1 part 2.' + 
      'Text content from page 2 part 1. Text content from page 2 part 2.'
    );
  });

  it('should handle PDF with no pages', async () => {
    const result = await fromPDFToText('empty.pdf');
    expect(result).toBe('');
  });

  it('should throw an error if the PDF cannot be found', async () => {
    await expect(fromPDFToText('not-found.pdf')).rejects.toThrow('File not found');
  });
});
