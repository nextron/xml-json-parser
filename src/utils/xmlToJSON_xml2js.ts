// Using https://www.npmjs.com/package/xml2js
import { parseStringPromise } from 'xml2js';

export async function xmlToJSON_xml2js(xml: string): Promise<any> {
  try {
    const result = await parseStringPromise(xml, {
      explicitArray: false,
      explicitRoot: false,
      mergeAttrs: true,
    });
    return result;
  } catch (error) {
    console.error('Error converting XML to JSON:', error);
    throw new Error('Failed to convert XML to JSON');
  }
}
