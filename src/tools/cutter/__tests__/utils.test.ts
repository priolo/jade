import {
  cutDocumentForEmbedding,
  DocumentCutterOptions,
} from '../utils.js';
import { findIndex } from '../utils.js';


describe('findIndex', () => {
	// Basic functionality tests
	test('should find index of a simple word match', () => {
		const text = 'Hello world';
		const searchString = 'world';
		const result = findIndex(text, searchString)
		expect(result).toBe(6);
	});

	test('should be case insensitive', () => {
		const text = 'Hello World'
		const searchString = 'world'
		const result = findIndex(text, searchString)
		expect(result).toBe(6);
	});

	test('should ignore special characters in search string', () => {
		const text = 'Hello world';
		const searchString = 'w@o#r%l^d';
		expect(findIndex(text, searchString)).toBe(6);
	});

	test('should ignore special characters in text', () => {
		const text = 'H!e@l#l$o w%o^r&l*d';
		const searchString = 'world';
		const result = findIndex(text, searchString)
		expect(result).toBe(10);
	});

	test('should return the index of the first character of the match', () => {
		const text = 'Test example for finding';
		const searchString = 'example';
		expect(findIndex(text, searchString)).toBe(5);
	});

	// Edge cases
	test('should return -1 if match not found', () => {
		const text = 'Hello world';
		const searchString = 'notfound';
		expect(findIndex(text, searchString)).toBe(-1);
	});

	test('should return -1 for empty text', () => {
		const text = '';
		const searchString = 'test';
		expect(findIndex(text, searchString)).toBe(-1);
	});

	test('should return -1 for empty search string', () => {
		const text = 'Hello world';
		const searchString = '';
		expect(findIndex(text, searchString)).toBe(-1);
	});

	test('should return index for single character match', () => {
		const text = 'abcdef';
		const searchString = 'c';
		expect(findIndex(text, searchString)).toBe(2);
	});

	test('should handle strings with only special characters', () => {
		const text = '@#$%^&*()';
		const searchString = 'abc';
		expect(findIndex(text, searchString)).toBe(-1);
	});
});

describe('cutDocumentForEmbedding', () => {
  // Basic functionality test
  test('should cut document into chunks of specified size', () => {
    const document = 'This is a test document. It contains multiple sentences. ' +
      'We want to ensure that the document is properly cut into chunks. ' +
      'The chunks should respect the specified size as much as possible. ' +
      'This will help with embedding the text in a vector database.';
    
    const options: DocumentCutterOptions = {
      chunkSize: 50,
      chunkOverlap: 0,
      respectParagraphs: false
    };
    
    const chunks = cutDocumentForEmbedding(document, options);
    
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk, i) => {
      if (i < chunks.length - 1) { // All but possibly the last chunk
        expect(chunk.text.length).toBeLessThanOrEqual(options.chunkSize!);
      }
    });
  });

  // Test respecting paragraph boundaries
  test('should respect paragraph boundaries when specified', () => {
    const document = 'This is paragraph one.\n\nThis is paragraph two.\n\n' +
      'This is paragraph three with multiple sentences. It should be kept together if possible.';
    
    const options: DocumentCutterOptions = {
      chunkSize: 100,
      respectParagraphs: true
    };
    
    const chunks = cutDocumentForEmbedding(document, options);
    
    expect(chunks.length).toBe(3);
    expect(chunks[0].text).toContain('paragraph one');
    expect(chunks[1].text).toContain('paragraph two');
    expect(chunks[2].text).toContain('paragraph three');
  });

  // Test chunk overlap
  test('should create overlapping chunks when specified', () => {
    const document = 'This is a test sentence. This is another test sentence. ' +
      'Yet another sentence here. And one more sentence.';
    
    const options: DocumentCutterOptions = {
      chunkSize: 30,
      chunkOverlap: 10,
      respectParagraphs: false
    };
    
    const chunks = cutDocumentForEmbedding(document, options);
    
    expect(chunks.length).toBeGreaterThan(1);
    
    // Check for overlap between consecutive chunks
    for (let i = 1; i < chunks.length; i++) {
      const prevChunkEnd = chunks[i-1].text.slice(-10);
      const currentChunkStart = chunks[i].text.slice(0, 10);
      
      // Simple overlap check - at least some text should overlap
      expect(
        chunks[i].text.startsWith(prevChunkEnd) || 
        chunks[i-1].text.endsWith(currentChunkStart)
      ).toBeTruthy();
    }
  });

  // Test metadata addition
  test('should add metadata to chunks when requested', () => {
    const document = 'This is a test document with multiple sentences.';
    
    const options: DocumentCutterOptions = {
      chunkSize: 100,
      addMetadata: true
    };
    
    const chunks = cutDocumentForEmbedding(document, options);
    
    expect(chunks.length).toBe(1);
    expect(chunks[0].metadata).toBeDefined();
    expect(chunks[0].metadata!.position).toBe(0);
    expect(chunks[0].metadata!.totalChunks).toBe(1);
  });

  // Test small document handling
  test('should handle documents smaller than chunk size', () => {
    const document = 'Small document.';
    
    const options: DocumentCutterOptions = {
      chunkSize: 100,
      minChunkSize: 5
    };
    
    const chunks = cutDocumentForEmbedding(document, options);
    
    expect(chunks.length).toBe(1);
    expect(chunks[0].text).toBe(document);
  });

  // Test empty document
  test('should handle empty document', () => {
    const document = '';
    const chunks = cutDocumentForEmbedding(document);
    
    expect(chunks.length).toBe(0);
  });

  // Test minimum chunk size enforcement
  test('should respect minimum chunk size', () => {
    const document = 'One. Two. Three. Four. Five.';
    
    const options: DocumentCutterOptions = {
      chunkSize: 10,
      minChunkSize: 8,
      respectParagraphs: false
    };
    
    const chunks = cutDocumentForEmbedding(document, options);
    
    chunks.forEach(chunk => {
      expect(chunk.text.trim().length).toBeGreaterThanOrEqual(options.minChunkSize!);
    });
  });

  // Test long paragraphs are split properly
  test('should split long paragraphs when they exceed chunk size', () => {
    const longParagraph = 'This is a very long paragraph that should be split into multiple chunks. ' +
      'It contains many sentences that should ideally be kept together. ' +
      'We want to make sure that the algorithm splits this text at appropriate sentence boundaries. ' +
      'This helps preserve the semantic meaning of each chunk. ' +
      'The goal is to have chunks that make sense independently.';
    
    const options: DocumentCutterOptions = {
      chunkSize: 50,
      respectParagraphs: true
    };
    
    const chunks = cutDocumentForEmbedding(longParagraph, options);
    
    expect(chunks.length).toBeGreaterThan(1);
  });
});
