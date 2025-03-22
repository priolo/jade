import { breakWords } from '../utils.js';


describe('breakWords', () => {
	// Basic functionality tests
	test('should break a string at a single word', () => {
		const text = `“pippo pap pippo pappo lampel%apmedusa la casa di un pescatore narrante`
		const words = [
			"pippo pappo",
			"l%apmedusa",
		];
		const result = breakWords(text, words);
		expect(result).toEqual([
			"“pippo pap pippo pappo lampe",
			"l%apmedusa la casa di un pescatore narrante",
		]);
	});

	test('should break a string at multiple words', () => {
		const text = 'This is a sample text for testing purposes';
		const words = ['sample', 'testing'];
		const result = breakWords(text, words);
		expect(result).toEqual(['This is a ', 'sample text for ', 'testing purposes']);
	});

	// Edge cases
	test('should return array with original text if no words found', () => {
		const text = 'Hello world';
		const words = ['notfound', 'another'];
		const result = breakWords(text, words);
		expect(result).toEqual(['Hello world']);
	});

	test('should handle empty text correctly', () => {
		const text = '';
		const words = ['something'];
		const result = breakWords(text, words);
		expect(result).toEqual(['']);
	});

	test('should handle empty words array correctly', () => {
		const text = 'Hello world';
		const words: string[] = [];
		const result = breakWords(text, words);
		expect(result).toEqual(['Hello world']);
	});

	test('should ignore words at the beginning of text', () => {
		const text = 'Start with this sentence';
		const words = ['Start', 'sentence'];
		const result = breakWords(text, words);
		expect(result).toEqual(['Start with this ', 'sentence']);
	});

	test('should only use first occurrence of a word', () => {
		const text = 'Repeat word and repeat word again';
		const words = ['repeat'];
		const result = breakWords(text, words);
		expect(result).toEqual(['Repeat word and ', 'repeat word again']);
	});

	test('should be case sensitive', () => {
		const text = 'Case matters in Case sensitivity';
		const words = ['case'];
		const result = breakWords(text, words);
		expect(result).toEqual(['Case matters in Case sensitivity']);
	});
});
