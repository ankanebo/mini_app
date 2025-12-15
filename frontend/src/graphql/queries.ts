// frontend/src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_MATERIALS = gql`
  query Materials($orderByAmount: SortOrder) {
    materials(orderByAmount: $orderByAmount) {
      id
      typeOfMaterial
      amount
      unit
    }
  }
`;

export const GET_MATERIALS_FULL = gql`
  query MaterialsFull($orderByAmount: SortOrder) {
    materialsFull(orderByAmount: $orderByAmount) {
      material {
        id
        typeOfMaterial
        amount
        unit
      }
      functional {
        id
        unit
        value
        description
      }
      operational {
        id
        unit
        value
        description
        stand {
          id
          nameOfStand
          typeOfStand
        }
      }
    }
  }
`;

export const GET_SATELLITES = gql`
  query Satellites {
    satellites {
      id
      name
      type
    }
  }
`;

export const UPDATE_SATELLITE = gql`
  mutation UpdateSatellite($id: ID!, $name: String!, $type: String!) {
    updateSatellite(id: $id, name: $name, type: $type) {
      id
      name
      type
    }
  }
`;

export const GET_ELECTRONICS_BY_SATELLITE = gql`
  query Electronics($satelliteId: ID!) {
    electronics(satelliteId: $satelliteId) {
      id
      model
      type
      location
      price
    }
    electronicsTotalCost(satelliteId: $satelliteId)
    electronicsAvgCost(satelliteId: $satelliteId)
    electronicsMinMaxCost(satelliteId: $satelliteId) {
      minCost
      minModel
      maxCost
      maxModel
    }
  }
`;

export const GET_CALENDAR_STATS = gql`
  query CalendarStats($satelliteId: ID!) {
    calendarStageStats(satelliteId: $satelliteId) {
      avgDuration
      maxDuration
      minDuration
      totalDuration
    }
    calendarStages(satelliteId: $satelliteId) {
      id
      nameOfStage
      timeOfFrame
      duration
      stageOrder
    }
  }
`;

export const GET_STANDS = gql`
  query Stands($satelliteId: ID) {
    stands(satelliteId: $satelliteId) {
      id
      nameOfStand
      typeOfStand
      satelliteBodyId
    }
  }
`;

export const GET_STAND_RESOURCES = gql`
  query StandResources($standId: ID!) {
    sensors(standId: $standId) {
      id
      location
      value
      unit
      description
    }
    hardwareRequirements(standId: $standId) {
      id
      unit
      value
    }
    physicalTestData(standId: $standId) {
      id
      value
      unit
      description
    }
  }
`;

export const UPDATE_ELECTRONICS_PRICE = gql`
  mutation UpdateElectronicsPrice($id: ID!, $price: Float!) {
    updateElectronicsPrice(id: $id, price: $price) {
      id
      price
    }
  }
`;

// детали спутника для экрана управления
export const GET_TECH_SPECS_AND_OPCHAR = gql`
  query SatelliteDetails($satelliteId: ID!) {
    technicalSpecifications(satelliteId: $satelliteId) {
      id
      description
    }
    satelliteOpCharacteristics(satelliteId: $satelliteId) {
      id
      parameterName
      value
      unit
    }
  }
`;

// мутации администратора
export const ADD_SATELLITE = gql`
  mutation AddSatellite($name: String!, $type: String!) {
    addSatellite(name: $name, type: $type) {
      id
      name
      type
    }
  }
`;

export const ADD_ELECTRONICS = gql`
  mutation AddElectronics(
    $satelliteId: ID!
    $model: String!
    $type: String!
    $location: String!
    $price: Float!
  ) {
    addElectronics(
      satelliteId: $satelliteId
      model: $model
      type: $type
      location: $location
      price: $price
    ) {
      id
    }
  }
`;

export const ADD_SATELLITE_OPCHAR = gql`
  mutation AddSatelliteOpCharacteristic(
    $satelliteId: ID!
    $parameterName: String!
    $value: Float!
    $unit: String!
  ) {
    addSatelliteOpCharacteristic(
      satelliteId: $satelliteId
      parameterName: $parameterName
      value: $value
      unit: $unit
    ) {
      id
    }
  }
`;

export const UPDATE_SATELLITE_OPCHAR = gql`
  mutation UpdateSatelliteOpCharacteristic(
    $id: ID!
    $parameterName: String!
    $value: Float!
    $unit: String!
  ) {
    updateSatelliteOpCharacteristic(
      id: $id
      parameterName: $parameterName
      value: $value
      unit: $unit
    ) {
      id
      parameterName
      value
      unit
    }
  }
`;

export const DELETE_SATELLITE_OPCHAR = gql`
  mutation DeleteSatelliteOpCharacteristic($id: ID!) {
    deleteSatelliteOpCharacteristic(id: $id)
  }
`;

export const ADD_CALENDAR_STAGE = gql`
  mutation AddCalendarStage(
    $satelliteId: ID!
    $nameOfStage: String!
    $timeOfFrame: String!
    $duration: Int!
    ) {
      addCalendarStage(
        satelliteId: $satelliteId
        nameOfStage: $nameOfStage
        timeOfFrame: $timeOfFrame
        duration: $duration
      ) {
        id
      }
    }
`;

export const UPDATE_CALENDAR_STAGE = gql`
  mutation UpdateCalendarStage(
    $id: ID!
    $nameOfStage: String!
    $timeOfFrame: String!
    $duration: Int!
  ) {
    updateCalendarStage(
      id: $id
      nameOfStage: $nameOfStage
      timeOfFrame: $timeOfFrame
      duration: $duration
    ) {
      id
      nameOfStage
      timeOfFrame
      duration
      stageOrder
    }
  }
`;

export const DELETE_CALENDAR_STAGE = gql`
  mutation DeleteCalendarStage($id: ID!) {
    deleteCalendarStage(id: $id)
  }
`;

export const DELETE_ELECTRONICS = gql`
  mutation DeleteElectronics($id: ID!) {
    deleteElectronics(id: $id)
  }
`;

export const UPDATE_FUNCTIONAL_CHAR = gql`
  mutation UpdateFunctionalCharacteristicOfMaterial(
    $id: ID!
    $description: String!
    $value: Float!
    $unit: String!
  ) {
    updateFunctionalCharacteristicOfMaterial(
      id: $id
      description: $description
      value: $value
      unit: $unit
    ) {
      id
      description
      value
      unit
    }
  }
`;

export const ADD_FUNCTIONAL_CHAR = gql`
  mutation AddFunctionalCharacteristicOfMaterial(
    $materialId: ID!
    $description: String!
    $value: Float!
    $unit: String!
  ) {
    addFunctionalCharacteristicOfMaterial(
      materialId: $materialId
      description: $description
      value: $value
      unit: $unit
    ) {
      id
      description
      value
      unit
    }
  }
`;

export const DELETE_FUNCTIONAL_CHAR = gql`
  mutation DeleteFunctionalCharacteristicOfMaterial($id: ID!) {
    deleteFunctionalCharacteristicOfMaterial(id: $id)
  }
`;

export const UPDATE_OPERATIONAL_CHAR = gql`
  mutation UpdateOperationalCharacteristicOfMaterial(
    $id: ID!
    $description: String
    $value: Float!
    $unit: String!
  ) {
    updateOperationalCharacteristicOfMaterial(
      id: $id
      description: $description
      value: $value
      unit: $unit
    ) {
      id
      description
      value
      unit
      stand {
        id
        nameOfStand
      }
    }
  }
`;

export const ADD_OPERATIONAL_CHAR = gql`
  mutation AddOperationalCharacteristicOfMaterial(
    $materialId: ID!
    $standId: ID!
    $hardwareRequirementId: ID!
    $description: String
    $value: Float!
    $unit: String!
  ) {
    addOperationalCharacteristicOfMaterial(
      materialId: $materialId
      standId: $standId
      hardwareRequirementId: $hardwareRequirementId
      description: $description
      value: $value
      unit: $unit
    ) {
      id
      description
      value
      unit
      stand {
        id
        nameOfStand
      }
    }
  }
`;

export const DELETE_OPERATIONAL_CHAR = gql`
  mutation DeleteOperationalCharacteristicOfMaterial($id: ID!) {
    deleteOperationalCharacteristicOfMaterial(id: $id)
  }
`;

export const UPDATE_STAND = gql`
  mutation UpdateStand($id: ID!, $nameOfStand: String!, $typeOfStand: String!) {
    updateStand(id: $id, nameOfStand: $nameOfStand, typeOfStand: $typeOfStand) {
      id
      nameOfStand
      typeOfStand
      satelliteBodyId
    }
  }
`;

export const ADD_HARDWARE_REQUIREMENT = gql`
  mutation AddHardwareRequirement($standId: ID!, $value: Float!, $unit: String!) {
    addHardwareRequirement(standId: $standId, value: $value, unit: $unit) {
      id
      value
      unit
    }
  }
`;

export const ADD_PHYSICAL_TEST_DATA = gql`
  mutation AddPhysicalTestData(
    $standId: ID!
    $hardwareRequirementId: ID!
    $description: String!
    $value: Float!
    $unit: String!
  ) {
    addPhysicalTestData(
      standId: $standId
      hardwareRequirementId: $hardwareRequirementId
      description: $description
      value: $value
      unit: $unit
    ) {
      id
      description
      value
      unit
    }
  }
`;

export const DELETE_STAND = gql`
  mutation DeleteStand($id: ID!) {
    deleteStand(id: $id)
  }
`;

export const ADD_STAND = gql`
  mutation AddStand($satelliteId: ID!, $nameOfStand: String!, $typeOfStand: String!) {
    addStand(satelliteId: $satelliteId, nameOfStand: $nameOfStand, typeOfStand: $typeOfStand) {
      id
      nameOfStand
      typeOfStand
      satelliteBodyId
    }
  }
`;

export const UPDATE_SENSOR = gql`
  mutation UpdateSensor(
    $id: ID!
    $location: String!
    $value: Float
    $unit: String
    $description: String!
  ) {
    updateSensor(
      id: $id
      location: $location
      value: $value
      unit: $unit
      description: $description
    ) {
      id
      location
      value
      unit
      description
    }
  }
`;

export const ADD_SENSOR = gql`
  mutation AddSensor(
    $standId: ID!
    $location: String!
    $value: Float
    $unit: String
    $description: String!
  ) {
    addSensor(
      standId: $standId
      location: $location
      value: $value
      unit: $unit
      description: $description
    ) {
      id
      location
      value
      unit
      description
    }
  }
`;

export const DELETE_SENSOR = gql`
  mutation DeleteSensor($id: ID!) {
    deleteSensor(id: $id)
  }
`;

export const UPDATE_HARDWARE_REQUIREMENT = gql`
  mutation UpdateHardwareRequirement($id: ID!, $value: Float!, $unit: String!) {
    updateHardwareRequirement(id: $id, value: $value, unit: $unit) {
      id
      value
      unit
    }
  }
`;

export const DELETE_HARDWARE_REQUIREMENT = gql`
  mutation DeleteHardwareRequirement($id: ID!) {
    deleteHardwareRequirement(id: $id)
  }
`;

export const UPDATE_PHYSICAL_TEST_DATA = gql`
  mutation UpdatePhysicalTestData(
    $id: ID!
    $description: String!
    $value: Float!
    $unit: String!
  ) {
    updatePhysicalTestData(id: $id, description: $description, value: $value, unit: $unit) {
      id
      description
      value
      unit
    }
  }
`;

export const DELETE_PHYSICAL_TEST_DATA = gql`
  mutation DeletePhysicalTestData($id: ID!) {
    deletePhysicalTestData(id: $id)
  }
`;

export const UPDATE_TECH_SPEC = gql`
  mutation UpdateTechnicalSpecification($id: ID!, $description: String) {
    updateTechnicalSpecification(id: $id, description: $description) {
      id
      description
    }
  }
`;

export const DELETE_TECH_SPEC = gql`
  mutation DeleteTechnicalSpecification($id: ID!) {
    deleteTechnicalSpecification(id: $id)
  }
`;
