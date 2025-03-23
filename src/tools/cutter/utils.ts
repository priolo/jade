

export function breakWords(text: string, words: string[]): string[] {

	const indexesFind = []

	for (let i = 0; i < words.length; i++) {
		const word = words[i]
		const start = indexesFind[indexesFind.length - 1] ?? 0
		let index = findIndex(text, word, start)
		if (index != -1) {
			indexesFind.push(index)
			continue
		}

		index = findIndexReverse(text, word, start)
		if (index == -1) continue

		indexesFind.pop()
		indexesFind.push(index)
		const tmp = words[i - 1]
		words[i - 1] = words[i]
		words[i] = tmp
		i--
	}

	console.log(indexesFind)

	let count = 0
	return indexesFind.map( index => {
		const chunk = text.slice(count, index)
		count = index
		return chunk
	}).concat(text.slice(count))

	// const pieces = words.reduce((acc, word) => {
	// 	let index = findIndex(text.toLowerCase(), word)
	// 	if (index == -1 || index == 0) return acc
	// 	acc.push(text.slice(0, index))

	// 	text = text.slice(index)
	// 	return acc
	// }, [])

	// pieces.push(text)
	// return pieces
}

export function findIndex(text: string, searchString: string, start: number): number {

	const search = searchString.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
	text = text.toLowerCase()

	// numero di caratteri uguali
	let searchIndex = 0
	/// la prima occorrernza in cui i caratteri sono uguali
	let firstIndex = -1

	for (let i = start; i < text.length; i++) {
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

export function findIndexReverse(text: string, searchString: string, start: number): number {

	const search = searchString.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
	text = text.toLowerCase()

	const length = search.length
	// numero di caratteri uguali
	let searchIndex = length
	/// la prima occorrernza in cui i caratteri sono uguali
	let firstIndex = -1

	for (let i = start; i > 0; i--) {
		const char = text[i]
		if (!isAlphanumeric(char)) continue
		if (char == search[searchIndex - 1]) {
			if (searchIndex == length) firstIndex = i
			searchIndex--
		} else {
			searchIndex = length
			if (char == search[searchIndex]) {
				if (searchIndex == length) firstIndex = i
				searchIndex--
			}
		}
		if (searchIndex == 0) {
			return firstIndex - (length + 1)
		}
	}
	return -1
}


function isAlphanumeric(char: string) {
	return /^[A-Za-z0-9]$/.test(char);
}



