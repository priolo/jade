
export function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export function groupBy ( items:any[], keySelector: (item:any) => string): { [key: string]: any[] } {
	return items.reduce((result, item) => {
		const key = keySelector(item);
		(result[key] || (result[key] = [])).push(item);
		return result;
	}, {});
}

export function countWords(sentence: string): number {
	if (!sentence.trim()) return 0;
	return sentence.trim().split(/\s+/).length;
}

export async function nodesDocsBuild(sentences: string[], parentId?: string, ref?: string): Promise<NodeDoc[]> {
	const nodes: NodeDoc[] = sentences.map((sentence, i) => ({
		uuid: uuidv4(),
		parent: parentId,
		text: sentence,
		ref: ref ?? "",
		vector: null,
	}))
	return nodes
}

export type NodeDoc = {
	uuid?: string
	parent?: string
	text: string,
	ref?: string
	vector: number[]
	_distance?: number
	paragraphs?: NodeDoc[]
}
