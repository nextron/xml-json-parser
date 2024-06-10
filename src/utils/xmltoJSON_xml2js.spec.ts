import { xmlToJSON_xml2js } from './xmltoJSON_xml2js';

describe('xmlToJSON_xml2js', () => {
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

  it('should convert valid XML to JSON', async () => {
    const expectedResult = {
      Results: {
        AllVehicleMakes: [
          { Make_ID: '12670', Make_Name: 'ZYBERGRAPH, LLC' },
          { Make_ID: '3880', Make_Name: 'ZZ TRAILER' },
        ],
      },
    };

    const result = await xmlToJSON_xml2js(xml);
    expect(result).toEqual(expectedResult);
  });

  it('should handle invalid XML', async () => {
    await expect(xmlToJSON_xml2js(invalidXml)).rejects.toThrow(
      'Failed to convert XML to JSON',
    );
  });
});
