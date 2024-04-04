class ElectricityNetworkPeer {
  producesElectricity() {
    throw new Error('Not Implemented');
  }
  canTransferElectricity() {
    throw new Error('Not Implemented');
  }
}


class Household extends ElectricityNetworkPeer {
  producesElectricity() {
    return false;
  }
  canTransferElectricity() {
    return true;
  }
}


class PowerPlant extends ElectricityNetworkPeer {
  constructor() {
    super();
    this._alive = true;
  }

  setAlive(alive) {
    this._alive = alive;
  }

  producesElectricity() {
    return this._alive;
  }

  canTransferElectricity() {
    return false;
  }
}



class ElectricityNetwork {
  constructor() {
    this._links = [];
  }

  connectPeers(entityA, entityB) {
    this._links.push([entityA, entityB])
  }

  breakConnection(entityA, entityB) {
    this._links = this._links.filter(item => !(item.includes(entityA) && item.includes(entityB)));
  }

  allPeersConnectedTo(entity) {
    const collectPeersFor = (entity, traversedItems = []) => {
      const relatedLinks = [...this._links.filter(item => item.includes(entity))];

      const connectedPeers = relatedLinks.map(link => link.find(item => item != entity)).
      filter(peer => !traversedItems.includes(peer));

      traversedItems.push(...connectedPeers);

      return [...connectedPeers].concat(...connectedPeers.filter(peer => peer.canTransferElectricity()).map(item => collectPeersFor(item, traversedItems)));
    };

    return [...new Set(collectPeersFor(entity))];
  }
}


//	This class is just a facade for your implementation, the tests below are using the `World` class only.
//	Feel free to add the data and behavior, but don't change the public interface.

class World {
  constructor() {
    this._network = new ElectricityNetwork();
  }

  createPowerPlant() {
    return new PowerPlant();
  }


  createHousehold() {
    return new Household();
  }


  connectHouseholdToPowerPlant(household, powerPlant) {
    this._network.connectPeers(household, powerPlant);
  }


  connectHouseholdToHousehold(household1, household2) {
    this._network.connectPeers(household1, household2);
  }


  disconnectHouseholdFromPowerPlant(household, powerPlant) {
    this._network.breakConnection(household, powerPlant);
  }


  killPowerPlant(powerPlant) {
    powerPlant.setAlive(false);
  }


  repairPowerPlant(powerPlant) {
    powerPlant.setAlive(true);
  }


  householdHasEletricity(household, requestId) {
    return this._network.allPeersConnectedTo(household).some(peer => peer.producesElectricity());
  }
}


const assert = {
  equal(a, b, message) {
    if (a != b) {
      throw new Error('Assertion Failed' + (message || ''));
    }
  }
};



/*

	The code below tests your implementation. You can consider the task finished
	when all the test do pass. Feel free to read the tests, but please don't alter them.

*/

mocha.setup('bdd');

describe("Households + Power Plants", function() {

  it("Household has no electricity by default", () => {
    const world = new World();
    const household = world.createHousehold();
    assert.equal(world.householdHasEletricity(household), false);
  });


  it("Household has electricity if connected to a Power Plant", () => {
    const world = new World();
    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), true);
  });


  it("Household won't have Electricity after disconnecting from the only Power Plant", () => {
    const world = new World();
    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), true);

    world.disconnectHouseholdFromPowerPlant(household, powerPlant);
    assert.equal(world.householdHasEletricity(household), false);
  });


  it("Household will have Electricity as long as there's at least 1 alive Power Plant connected", () => {
    const world = new World();
    const household = world.createHousehold();

    const powerPlant1 = world.createPowerPlant();
    const powerPlant2 = world.createPowerPlant();
    const powerPlant3 = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant1);
    world.connectHouseholdToPowerPlant(household, powerPlant2);
    world.connectHouseholdToPowerPlant(household, powerPlant3);

    assert.equal(world.householdHasEletricity(household), true);

    world.disconnectHouseholdFromPowerPlant(household, powerPlant1);
    assert.equal(world.householdHasEletricity(household), true);

    world.killPowerPlant(powerPlant2);
    assert.equal(world.householdHasEletricity(household), true);

    world.disconnectHouseholdFromPowerPlant(household, powerPlant3);
    assert.equal(world.householdHasEletricity(household), false);
  });


  it("Household won't have Electricity if the only Power Plant dies", () => {
    const world = new World();
    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), true);

    world.killPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), false);
  });


  it("PowerPlant can be repaired", () => {
    const world = new World();
    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), true);

    world.killPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), false);

    world.repairPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), true);

    world.killPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), false);

    world.repairPowerPlant(powerPlant);
    assert.equal(world.householdHasEletricity(household), true);
  });


  it("Few Households + few Power Plants, case 1", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();

    const powerPlant1 = world.createPowerPlant();
    const powerPlant2 = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant1);
    world.connectHouseholdToPowerPlant(household1, powerPlant2);
    world.connectHouseholdToPowerPlant(household2, powerPlant2);

    assert.equal(world.householdHasEletricity(household1), true, ' 1');
    assert.equal(world.householdHasEletricity(household2), true, ' 2');

    world.killPowerPlant(powerPlant2);
    assert.equal(world.householdHasEletricity(household1), true, ' 3');
    assert.equal(world.householdHasEletricity(household2, 'requesto'), false, ' 4');

    world.killPowerPlant(powerPlant1);
    assert.equal(world.householdHasEletricity(household1), false, ' 5');
    assert.equal(world.householdHasEletricity(household2), false, ' 6');
  });



  it("Few Households + few Power Plants, case 2", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();

    const powerPlant1 = world.createPowerPlant();
    const powerPlant2 = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant1);
    world.connectHouseholdToPowerPlant(household1, powerPlant2);
    world.connectHouseholdToPowerPlant(household2, powerPlant2);

    world.disconnectHouseholdFromPowerPlant(household2, powerPlant2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), false);

    world.killPowerPlant(powerPlant2);
    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), false);

    world.killPowerPlant(powerPlant1);
    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
  });


  it("Household + Power Plant, case 1", () => {
    const world = new World();

    const household = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    assert.equal(world.householdHasEletricity(household), false);
    world.killPowerPlant(powerPlant);

    world.connectHouseholdToPowerPlant(household, powerPlant);

    assert.equal(world.householdHasEletricity(household), false);
  });

});


describe("Households + Households + Power Plants", function() {
  it("2 Households + 1 Power Plant", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant);
    world.connectHouseholdToHousehold(household1, household2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);

    world.killPowerPlant(powerPlant);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
  });


  it("Power Plant -> Household -> Household -> Household", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();
    const household3 = world.createHousehold();
    const powerPlant = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant);
    world.connectHouseholdToHousehold(household1, household2);
    world.connectHouseholdToHousehold(household2, household3);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);
    assert.equal(world.householdHasEletricity(household3), true);

    world.killPowerPlant(powerPlant);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
    assert.equal(world.householdHasEletricity(household3), false);

    world.repairPowerPlant(powerPlant);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);
    assert.equal(world.householdHasEletricity(household3), true);

    world.disconnectHouseholdFromPowerPlant(household1, powerPlant);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
    assert.equal(world.householdHasEletricity(household3), false);
  });



  it("2 Households + 2 Power Plants", () => {
    const world = new World();

    const household1 = world.createHousehold();
    const household2 = world.createHousehold();

    const powerPlant1 = world.createPowerPlant();
    const powerPlant2 = world.createPowerPlant();

    world.connectHouseholdToPowerPlant(household1, powerPlant1);
    world.connectHouseholdToPowerPlant(household2, powerPlant2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);

    world.killPowerPlant(powerPlant1);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), true);

    world.connectHouseholdToHousehold(household1, household2);

    assert.equal(world.householdHasEletricity(household1), true);
    assert.equal(world.householdHasEletricity(household2), true);

    world.disconnectHouseholdFromPowerPlant(household2, powerPlant2);

    assert.equal(world.householdHasEletricity(household1), false);
    assert.equal(world.householdHasEletricity(household2), false);
  });
});


mocha.run();
