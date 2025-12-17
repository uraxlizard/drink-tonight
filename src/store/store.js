import { createStore } from 'redux';

export const initialState = {
  ui: {
    showRegisterModal: false,
    showLoginModal: false,
    currentPage: 'home'
  },
  auth: {
    isLoggedIn: false,
    fullName: '',
    email: '',
    createdAt: '',
    lastSignInAt: '',
    accountType: 'normal',
    userId: null
  },
  places: {
    list: []
  },
  notifications: {
    reservationNotifications: 0,
    reservationDetails: []
  }
};

export function rootReducer(state = initialState, action) {
  switch (action.type) {
    case 'ui/setCurrentPage':
      return {
        ...state,
        ui: { ...state.ui, currentPage: action.payload }
      };
    case 'ui/showRegisterModal':
      return {
        ...state,
        ui: { ...state.ui, showRegisterModal: true, showLoginModal: false }
      };
    case 'ui/showLoginModal':
      return {
        ...state,
        ui: { ...state.ui, showLoginModal: true, showRegisterModal: false }
      };
    case 'ui/hideModals':
      return {
        ...state,
        ui: { ...state.ui, showLoginModal: false, showRegisterModal: false }
      };
    case 'auth/setSession':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoggedIn: action.payload.isLoggedIn,
          fullName: action.payload.fullName,
          email: action.payload.email,
          createdAt: action.payload.createdAt,
          lastSignInAt: action.payload.lastSignInAt,
          accountType: action.payload.accountType,
          userId: action.payload.userId
        }
      };
    case 'auth/logout':
      return {
        ...state,
        auth: {
          ...initialState.auth
        }
      };
    case 'places/setPlaces':
      return {
        ...state,
        places: {
          ...state.places,
          list: action.payload
        }
      };
    case 'notifications/setReservations':
      return {
        ...state,
        notifications: {
          reservationNotifications: action.payload.count,
          reservationDetails: action.payload.details
        }
      };
    default:
      return state;
  }
}

export const store = createStore(rootReducer);


