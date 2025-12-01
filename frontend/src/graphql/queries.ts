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
    }
  }
`;
