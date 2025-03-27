
export type NodeDoc = {
	uuid?: string;
	parent?: string;
	paragraphs?: NodeDoc[];

	title?: string;
	text: string;
	ref?: string;

	vector: number[];
	_distance?: number;
};
