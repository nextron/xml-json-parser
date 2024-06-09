import { DOMParser } from 'xmldom';

function extractElements(node: Element, elements: string[]): any {
  const obj: any = {};
  elements.forEach((element) => {
    const child = node.getElementsByTagName(element)[0];
    if (child) {
      obj[element] = child.textContent.trim();
    }
  });
  return obj;
}

export function xmlToJSON_DOMParser(
  xml: string,
  parentTag: string,
  childTag: string,
  elements: string[],
): any {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const parentElement = xmlDoc.getElementsByTagName(parentTag)[0];
    const childElements = parentElement.getElementsByTagName(childTag);
    const extractedData = [];

    for (let i = 0; i < childElements.length; i++) {
      const child = childElements[i] as Element;
      const extractedItem = extractElements(child, elements);
      extractedData.push(extractedItem);
    }

    return extractedData;
  } catch (error) {
    console.error('Error converting XML to JSON:', error);
    throw new Error('Failed to convert XML to JSON');
  }
}
