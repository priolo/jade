export function breakWords(text: string, words: string[]): string[] {
	const pieces = words.reduce((acc, word) => {
		let index = findIndex(text.toLowerCase(), word)
		if (index == -1 || index == 0) return acc
		acc.push(text.slice(0, index))

		text = text.slice(index)
		return acc
	}, [])

	pieces.push(text)
	return pieces
}

export function findIndex(text: string, searchString: string): number {

	const search = searchString.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
	let searchIndex = 0
	let firstIndex = -1

	for (let i = 0; i < text.length; i++) {
		const char = text[i]
		if (!isAlphanumeric(char)) continue
		if (char == search[searchIndex]) {
			if (searchIndex == 0) firstIndex = i
			searchIndex++
		} else {
			searchIndex = 0
			if (char == search[searchIndex]) {
				if (searchIndex == 0) firstIndex = i
				searchIndex++
			}
		}
		if (searchIndex == search.length) {
			return firstIndex
		}
	}
	return -1
}

function isAlphanumeric(char: string) {
	return /^[A-Za-z0-9]$/.test(char);
}



