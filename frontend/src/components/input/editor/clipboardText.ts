import type {Fragment, Node as PMNode} from '@tiptap/pm/model'

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList']

function inlineText(node: PMNode): string {
	if (node.isText) {
		return node.text ?? ''
	}
	return node.textBetween(0, node.content.size, '\n', leaf => (leaf.type.name === 'hardBreak' ? '\n' : ''))
}

function serializeList(list: PMNode, indent: string): string {
	const lines: string[] = []
	let index = (list.attrs.start as number | undefined) ?? 1
	list.forEach(item => {
		let marker = '- '
		if (list.type.name === 'orderedList') {
			marker = `${index++}. `
		} else if (list.type.name === 'taskList') {
			marker = item.attrs.checked ? '- [x] ' : '- [ ] '
		}
		const parts: string[] = []
		item.forEach((child, _offset, i) => {
			if (LIST_TYPES.includes(child.type.name)) {
				parts.push('\n' + serializeList(child, indent + '  '))
			} else {
				parts.push((i > 0 ? '\n' + indent + '  ' : '') + inlineText(child))
			}
		})
		lines.push(indent + marker + parts.join(''))
	})
	return lines.join('\n')
}

export function serializeClipboardText(content: Fragment): string {
	const blocks: string[] = []
	content.forEach(node => {
		blocks.push(LIST_TYPES.includes(node.type.name) ? serializeList(node, '') : inlineText(node))
	})
	return blocks.join('\n\n')
}
