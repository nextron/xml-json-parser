import { xmlToJSON_DOMParser } from './xmltoJSON_DOMParser';

describe('xmlToJSON_DOMParser', () => {
  const xml = `
    <Response>
      <Results>
        <AllVehicleMakes>
          <Make_ID>12670</Make_ID>
          <Make_Name>ZYBERGRAPH, LLC</Make_Name>
        </AllVehicleMakes>
        <AllVehicleMakes>
          <Make_ID>3880</Make_ID>
          <Make_Name>ZZ TRAILER</Make_Name>
        </AllVehicleMakes>
      </Results>
    </Response>
  `;

  const invalidXml = `
    <Response>
      <Results>
        <AllVehicleMakes>
          <Make_ID>12670<Make_ID>
          <Make_Name>ZYBERGRAPH, LLC</Make_Name>
        </AllVehicleMakes>
      </Results>
    </Response>
  `;

  it('should convert valid XML to JSON and extract specified elements', () => {
    const result = xmlToJSON_DOMParser(xml, 'Results', 'AllVehicleMakes', [
      'Make_ID',
      'Make_Name',
    ]);
    expect(result).toEqual([
      { Make_ID: '12670', Make_Name: 'ZYBERGRAPH, LLC' },
      { Make_ID: '3880', Make_Name: 'ZZ TRAILER' },
    ]);
  });

  it('should return an empty array if parent tag is not found', () => {
    const result = xmlToJSON_DOMParser(
      xml,
      'NonExistentTag',
      'AllVehicleMakes',
      ['Make_ID', 'Make_Name'],
    );
    expect(result).toEqual([]);
  });

  it('should return an empty array if child tag is not found', () => {
    const result = xmlToJSON_DOMParser(xml, 'Results', 'NonExistentTag', [
      'Make_ID',
      'Make_Name',
    ]);
    expect(result).toEqual([]);
  });

  it('should handle invalid XML', () => {
    expect(() => {
      xmlToJSON_DOMParser(invalidXml, 'Results', 'AllVehicleMakes', [
        'Make_ID',
        'Make_Name',
      ]);
    }).toThrow('Failed to convert XML to JSON');
  });
});
