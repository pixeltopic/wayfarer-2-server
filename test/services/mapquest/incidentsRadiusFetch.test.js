const chai = require("chai");
const asserttype = require("chai-asserttype");
const chaiAsPromised = require("chai-as-promised");
const { mapquest: { getIncidentsInRadius } } = require("../../../services");

chai.use(asserttype);
chai.use(chaiAsPromised)

const expect = chai.expect;

describe.skip("getIncidentsInRadius()", async function() {

  const latLngA = { lat: 33.835293, lng: -117.914505 }; // anaheim.

  const latLngB = { lat: 33.835293, lng: -1179999.914505 }; // invalid coord, should be caught by GeoPoint.
  

  it("Should throw an Error due to invalid longitude.", function() {
    expect(getIncidentsInRadius(3, "imperial", latLngB)).to.be.rejectedWith(Error);
  });

  it("should test it with a valid lat lng pair.", async function() {
    const payload = await getIncidentsInRadius(5, "metric", latLngA);
    expect(payload).to.be.array();
  });
  
});