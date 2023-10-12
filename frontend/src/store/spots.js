/* spots slice of state
{
  "allSpots": {
    [spotId]:
      {
        "id": 1,
        "ownerId": 1,
        "address": "123 Disney Lane",
        "city": "San Francisco",
        "state": "California",
        "country": "United States",
        "lat": 37.7645358,
        "lng": -122.4730327,
        "name": "App Academy",
        "description": "Place where web developers are created",
        "price": 123,
        "createdAt": "2021-11-19 20:39:36",
        "updatedAt": "2021-11-19 20:39:36",
        "avgRating": 4.5,
        "previewUrl": "image url"
      }
    optionalOrderedList: [],
    }
  singleSpot: { // spot details
      "id": 1,
      "ownerId": 1,
      "address": "123 Disney Lane",
      "city": "San Francisco",
      "state": "California",
      "country": "United States",
      "lat": 37.7645358,
      "lng": -122.4730327,
      "name": "App Academy",
      "description": "Place where web developers are created",
      "price": 123,
      "createdAt": "2021-11-19 20:39:36",
      "updatedAt": "2021-11-19 20:39:36" ,
      "numReviews": 5,
      "avgRating": 4.5,
      "SpotImages": [ // put into
        {
          "id": 1,
          "url": "image url",
        },
        {
          "id": 2,
          "url": "image url",
        }
      ],
      "Owner": { // put into session as partialUser
        "id": 1,
        "firstName": "John",
        "lastName": "Smith"
      }
    }
  userSpots: { // all owner ids are the same
    [spotId]:
      {
        "id": 1,
        "ownerId": 1,
        "address": "123 Disney Lane",
        "city": "San Francisco",
        "state": "California",
        "country": "United States",
        "lat": 37.7645358,
        "lng": -122.4730327,
        "name": "App Academy",
        "description": "Place where web developers are created",
        "price": 123,
        "createdAt": "2021-11-19 20:39:36",
        "updatedAt": "2021-11-19 20:39:36",
        "avgRating": 4.5,
        "previewImage": "image url"
      }
    }
}
*/

/* New store shape for spots
old userSpots now are keys in state.users.spots, and the spot info is
in state.spots.id
{
  id:
    {
      [spotId]:
        {
          id: 1,
          ownerId: 1,
          address: "123 Disney Lane",
          city: "San Francisco",
          state: "California",
          country: "United States",
          lat: 37.7645358,
          lng: -122.4730327,
          name: "App Academy",
          description: "Place where web developers are created",
          price: 123,
          createdAt: "2021-11-19 20:39:36",
          updatedAt: "2021-11-19 20:39:36",
          numReviews: 4,
          avgRating: 4.5,
          previewUrl: "image url",

          // additional info; Details page gets images & reviews
          // reserve button gets bookings
          images: [spotImageIds,],
          reviews: [reviewIds,],
          // bookings: [bookingIds,], // perhaps only ids with future endDates
        },
    }
  userQuery: { [userId]: [orderedSpotIdsBySomeInterestingCriteriaFromQuery], }
}
*/

import { READ_SPOT, READ_SPOT_REVIEWS, READ_USER_SPOTS } from "./commonActionCreators";

import { csrfFetch, fetchData, jsonHeaderContent } from "./csrf";

const READ_SPOTS = "spots/READ_SPOTS";
const DELETE_SPOT = "spots/DELETE_SPOT";
const CREATE_SPOT = "spots/CREATE_SPOT";
const UPDATE_SPOT = "spots/UPDATE_SPOT";

function readAllSpots(spots) {
    return {
        type: READ_SPOTS,
        payload: spots
    }
}

export function readAllUserSpots(spots) {
    return {
        type: READ_USER_SPOTS,
        payload: spots
    }
}

function readSpot(spot) {
    return {
        type: READ_SPOT,
        payload: spot
    }
}

function deleteSpot(id) {
    return {
        type: DELETE_SPOT,
        payload: id
    };
};

function createSpot(spot) {
    return {
        type: CREATE_SPOT,
        payload: spot
    };
};

function updateSpot(spot) {
    return {
        type: UPDATE_SPOT,
        payload: spot
    }
}

export const thunkReadAllSpots = () => async dispatch => {
  const url = `/api/spots`
  const answer = await fetchData(url)
  if (!answer.errors) dispatch(readAllSpots(answer.Spots))
  return answer.Spots
}


export const thunkReadAllUserSpots = (args) => async dispatch => {
  const url = '/api/spots/current'
  const answer = await fetchData(url)
  if (!answer.errors) dispatch(readAllUserSpots(answer.Spots))
  return answer
}

export const thunkReadSpot = id => async dispatch => {
  if (typeof id === 'object')
  console.log("🚀 ~ thunkReadSpot ~values of id:", Object.values(id) )

  const url = `/api/spots/${id}`
  const answer = await fetchData(url)
  if (!answer.errors) dispatch(readSpot(answer))
  return answer
}

export const thunkDeleteSpot = id => async dispatch => {
  const url = `/api/spots/${id}`
  const options = {
    method: "DELETE",
  }
  const answer = await fetchData(url, options)
  if (!answer.errors) dispatch(deleteSpot(id))
  return answer
}

/*
     "id": 1,
      "ownerId": 1,
      "address": "123 Disney Lane",
      "city": "San Francisco",
      "state": "California",
      "country": "United States",
      "lat": 37.7645358,
      "lng": -122.4730327,
      "name": "App Academy",
      "description": "Place where web developers are created",
      "price": 123,
      "createdAt": "2021-11-19 20:39:36",
      "updatedAt": "2021-11-19 20:39:36" ,
      "previewUrl": "image url",
      "SpotImages": [
        {
          "id": 1,
          "url": "image url",
        },
*/

/* TODO eventually it should be wrapped in a transaction and
rolled back if errors in either spot or image creations */
export const thunkCreateSpot = (spot, urls) => async dispatch => {
  const { ownerId, address, city, state, country, lat, lng, name, description, price, previewUrl } = spot;
  const url = `/api/spots`
  const options = {
    method: "POST",
    headers: jsonHeaderContent,
    body: JSON.stringify({
      ownerId, address, city, state, country, lat, lng,
      name, description, price, previewUrl
  })
  }
  const answer = await fetchData(url, options)
  if (!answer.errors) {
    answer.numReviews = 0; /* ponder in db */
    answer.avgRating = null; /* ponder in db */
    options.body = JSON.stringify(urls)
    const answer2 = await csrfFetch(`/api/spots/${answer.id}/images`, options)
    if (!answer2.errors) {
      dispatch(createSpot(answer))
      /* TODO dispatch(createdImages()) */
    }
  }
  return answer
}

export const thunkUpdateSpot = (spot /*, urls */) => async dispatch => {
  const { id, ownerId, address, city, state, country, lat, lng, name, description, price } = spot;
  const url = `/api/spots/${spot.id}`
  const options = {
    method: "PUT",
    headers: jsonHeaderContent,
    body: JSON.stringify({
      id, ownerId, address, city, state, country, lat, lng,
      name, description, price
    })
  }
  /* TODO haven't come up with a good approach for URL updating yet
  * it could be a mixture of updates and creation
  */
  const answer = await fetchData(url, options)
  if (!answer.errors) {
    dispatch(updateSpot(answer))
  }
  return answer
}

const initialState = { /* for {} at state.spots */
    id: {}, /* when filled, normalized by spotId: {spotData} */
    userQuery: {}, /* when filled, {[userId}: [spotIdsLandingOrderdBySomeUserQuery]} */
};

const spotsReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case READ_SPOTS: {
        const normalized = {};
        action.payload.forEach(s => normalized[s.id]=s)
        newState = {...state}
        newState.id = {...state.id, ...normalized};
        return newState;
    }
    case READ_USER_SPOTS: {
        const normalized = {};
        action.payload.forEach(s => normalized[s.id]=s)
        newState = {...state, "id": {...state.id, ...normalized}};
        return newState;
    }
    case CREATE_SPOT:
    case UPDATE_SPOT: {
      const spot = action.payload
      const id = spot.id;
      newState = {...state};
      newState.id = {...state.id, [id]: spot};
      return newState;
    }
    case READ_SPOT: { /* old singleSpot */
      const id = action.payload.id
      const spot = action.payload
      const images = action.payload.SpotImages.map(s=>s.id)
      spot.images = images
      newState = {...state}
      newState.id = {...state.id,  [id]: spot}
      return newState
    }

    case DELETE_SPOT: /* payload is spotId */
      newState = {...state};
      newState.id = {...state.id};
      delete newState.id[action.payload]
      newState.userQuery = {...state.userQuery};
      return newState;
    case READ_SPOT_REVIEWS: {
      let {reviews,spotId} = action.payload
      newState = {...state}
      newState.id = {...state.id}
      newState.id[spotId] = {...state.id[spotId], reviews }
      return newState
    }
    default:
      return state;
  }
};

export default spotsReducer;
