import { breakWords, findIndex, findIndexReverse } from '../utils.js';


// describe('breakWords', () => {
// 	test('', () => {
// 		const text = 'Hello World';
// 		const words = ['Hello', 'World'];
// 		const result = breakWords(text, words);
// 		expect(result).toEqual(['', ' World']);
// 	});


// });

describe('findIndex', () => {

	test('find foward', () => {
		const text = `how are you? Fine and you? aaah fine fine mee too`;
		//const searchStrings = ["hello  word", "you fine", "fine fine"];
		const searchString = "you fine"
		const result = findIndex(text, searchString, 0)
		expect(result).toBe(8)
	})

	test('find foward', () => {
		const text = `how are you? Fine and you? aaah fine fine mee too`;
		const searchString = "you fine"
		const result = findIndexReverse(text, searchString, 20)
		expect(result).toBe(8)
	})

})

describe('breakWords', () => {

	test('all ordinate', () => {
		const text = `how are you? Fine and you? aaah fine fine mee too`;
		const searchStrings = ["you fine", "fine fine", "too"];
		const result = breakWords(text, searchStrings)
		expect(result).toEqual([
			"how are ",
			"you? Fine and you? aaah ",
			"fine fine mee ",
			"too",
		])
	})

	test('not all ordinate', () => {
		const text = `how are you? Fine and you? aaah fine fine mee too`;
		const searchStrings = ["fine fine", "you fine", "too"];
		const result = breakWords(text, searchStrings)
		expect(result).toEqual([
			"how are ",
			"you? Fine and you? aaah ",
			"fine fine mee ",
			"too",
		])
	})

});