/* reviews slice of state
{
    review: {
      [reviewId]: {
        reviewData,
        User: {
          userData,
        },
        ReviewImages: [imagesData],
      },
      optionalOrderedList: [],
    },
    user: {
      [reviewId]: {
        reviewData,
        User: {
          userData,
        },
        Spot: {
          reviewData,
        },
        ReviewImages: [imagesData],
      },
      optionalOrderedList: [],
    },

}
*/

/* TODO: copy in state above, and update all api urls, etc */

import { csrfFetch } from "./csrf";

const READ_REVIEWS = "reviews/READ_REVIEWS";
const READ_USER_REVIEWS = "reviews/READ_USER_REVIEWS";
const READ_REVIEW = "reviews/READ_REVIEW";
const DELETE_REVIEW = "reviews/DELETE_REVIEW";
const CREATE_REVIEW = "reviews/CREATE_REVIEW";
const UPDATE_REVIEW = "reviews/UPDATE_REVIEW";

function readAllReviews(reviews) {
    return {
        type: READ_REVIEWS,
        payload: reviews
    }
}

function readAllUserReviews(reviews) {
    return {
        type: READ_USER_REVIEWS,
        payload: reviews
    }
}

function readReview(id) {
    return {
        type: READ_REVIEW,
        payload: id
    }
}

function deleteReview(id) {
    return {
        type: DELETE_REVIEW,
        payload: id
    };
};

function createReview(review) {
    return {
        type: CREATE_REVIEW,
        payload: review
    };
};

function updateReview(review) {
    return {
        type: UPDATE_REVIEW,
        payload: review
    }
}

export const thunkREADAllReviews = () => async (dispatch) => {
  const response = await csrfFetch("/api/reviews");
  const data = await response.json();
  dispatch(readAllReviews(data.Reviews));
  return response;
};

export const thunkREADALLUserReviews = () => async (dispatch) => {
  const response = await csrfFetch("/api/reviews/current");
  const data = await response.json();
  dispatch(readAllUserReviews(data.Reviews));
  return response;
};

export const thunkREADReview = id => async dispatch => {
    const response = await csrfFetch(`/api/reviews/${id}`);
    const data = await response.json();
    console.log("🚀 ~ file: reviews.js:100 ~ thunkREADReview ~ data:", data)
    dispatch(readReview(id));
    return response;
};

export const thunkDELETEReview = id => async dispatch => {
    const response = await csrfFetch(`/api/reviews/${id}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    console.log("🚀 ~ file: reviews.js:110 ~ thunkDELETEReview ~ data:", data)
    dispatch(deleteReview(id));
    return response;
};

export const thunkCREATEReview = reviewArg => async dispatch => {
  const { review } = reviewArg;
  const response = await csrfFetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify({ /* fill out */
      review,
    }),
  });
  const data = await response.json();
  dispatch(createReview(data.review));
  return response;
};

export const thunkUPDATEReview = reviewObj => async dispatch => {
  const { review } = reviewObj;
  const response = await csrfFetch(`/api/reviews/${review.id}`, {
    method: "PUT",
    body: JSON.stringify({ /* fill out */
      review,
   }),
  });
  const data = await response.json();
  dispatch(updateReview(data.review));
  return response;
};

const initialState = {
    allReviews: {},
    optionalOrderedList: [],
    singleReview: {},
    userReviews: {}
};

const reviewsReducer = (state = initialState, action) => {
  console.log("🚀 ~ file: reviews.js:149 ~ reviewsReducer ~ action:", action)
  let newState;
  switch (action.type) {
    case READ_REVIEWS: {
        const reviews = action.payload;
        const normalized = {};
        reviews.forEach(s => normalized[s.id]=s)
        newState = {...state};
        newState.allReviews = reviews;
        return newState;
    }
    case READ_USER_REVIEWS: {
        const reviews = action.payload;
        const normalized = {};
        reviews.forEach(s => normalized[s.id]=s)
        newState = {...state};
        newState.userReviews = reviews;
        return newState;
    }
    case CREATE_REVIEW:
    case READ_REVIEW:
    case UPDATE_REVIEW:
      newState = {...state};
      newState.singleReview = action.payload;
      return newState;
    case DELETE_REVIEW:
      const newAllReviews = state.allReviews.filter(e => e.id !== action.payload);
      newState = {...state};
      newState.allReviews = newAllReviews;
      if (newState.singleReview?.id === action.payload) newState.singleReview = {};
      return newState;
    default:
      return state;
  }
};

export default reviewsReducer;