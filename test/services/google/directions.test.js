const chai = require("chai");
const asserttype = require("chai-asserttype");
const chaiAsPromised = require("chai-as-promised");
const { google: { getDirections } } = require("../../../services");

chai.use(asserttype);
chai.use(chaiAsPromised)

const expect = chai.expect;

describe.skip("google.getDirections", async function() {
  const searchParamsA = {
    altRoutes: true,
    avoidFerries: false,
    avoidHighways: false,
    avoidIndoor: false,
    avoidTolls: false,
    destination: "Irvine",
    mode: "driving",
    origin: "Anaheim",
    units: "imperial",
  }
  const searchParamsB = {
    ...searchParamsA,
    altRoutes: false,
    origin: undefined,
    destination: "Irvine",
    currentLocation: { lat: 33.835293, lng: -1179999.914505 } // incorrect coord
  }
  const searchParamsC = {
    ...searchParamsA,
    avoidHighways: true,
    origin: "LAX",
    destination: "Irvine",
    currentLocation: { lat: 33.835293, lng: -117.914505 } // anaheim
  }

  it("Should throw an Error due to invalid longitude.", function() {
    expect(getDirections(searchParamsB)).to.be.rejectedWith(Error);
  });

  it("should test it with a valid searchParams.", async function() {
    const payload = await getDirections(searchParamsA);
    expect(payload.getRoutes()).to.be.array();
    expect(payload.getStartAddress()).to.be.string();
    expect(payload.getEndAddress()).to.be.string();
  });
  it("should retrieve the same result from the LRU cache.", async function() {
    const payload = await getDirections(searchParamsA);
    expect(payload.getRoutes()).to.be.array();
    expect(payload.getStartAddress()).to.be.string();
    expect(payload.getEndAddress()).to.be.string();
  });
  it("should test it with a valid searchParams using currentLocation.", async function() {
    const payload = await getDirections(searchParamsC);
    expect(payload.getRoutes()).to.be.array();
    expect(payload.getStartAddress()).to.be.string();
    expect(payload.getEndAddress()).to.be.string();
  });
});