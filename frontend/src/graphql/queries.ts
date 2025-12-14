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
