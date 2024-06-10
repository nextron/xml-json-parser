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
) {
  try {
    const parser = new DOMParser({
      errorHandler: {
        warning: function (msg) {
          throw new Error(msg);
        },
        error: function (msg) {
          throw new Error(msg);
        },
        fatalError: function (msg) {
          throw new Error(msg);
        },
      },
    });
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const parentElement = xmlDoc.getElementsByTagName(parentTag)[0];
    if (!parentElement) {
      console.log(`Parent tag <${parentTag}> not found in the XML.`);
      return [];
    }
    const childElements = parentElement.getElementsByTagName(childTag);
    if (!childElements) {
      console.log(`Child tag <${childElements}> not found in the XML.`);
      return [];
    }
    const extractedData = [];

    for (let i = 0; i < childElements.length; i++) {
      const child = childElements[i] as Element;
      const extractedItem = extractElements(child, elements);
      extractedData.push(extractedItem);
    }

    return extractedData;
  } catch (error) {
    console.log('Error converting XML to JSON:', error);
    throw new Error('Failed to convert XML to JSON');
  }
}
