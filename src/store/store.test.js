import { rootReducer, initialState } from './store';

describe('Redux Store Reducer', () => {
  it('should return the initial state when no action is provided', () => {
    const state = rootReducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should handle ui/setCurrentPage action', () => {
    const action = { type: 'ui/setCurrentPage', payload: 'about' };
    const state = rootReducer(initialState, action);
    
    expect(state.ui.currentPage).toBe('about');
    expect(state.ui.showRegisterModal).toBe(false);
    expect(state.ui.showLoginModal).toBe(false);
  });

  it('should handle ui/showLoginModal action', () => {
    const action = { type: 'ui/showLoginModal' };
    const state = rootReducer(initialState, action);
    
    expect(state.ui.showLoginModal).toBe(true);
    expect(state.ui.showRegisterModal).toBe(false);
  });

  it('should handle ui/showRegisterModal action', () => {
    const action = { type: 'ui/showRegisterModal' };
    const state = rootReducer(initialState, action);
    
    expect(state.ui.showRegisterModal).toBe(true);
    expect(state.ui.showLoginModal).toBe(false);
  });

  it('should handle ui/hideModals action', () => {
    const stateWithModals = {
      ...initialState,
      ui: {
        ...initialState.ui,
        showLoginModal: true,
        showRegisterModal: true
      }
    };
    const action = { type: 'ui/hideModals' };
    const state = rootReducer(stateWithModals, action);
    
    expect(state.ui.showLoginModal).toBe(false);
    expect(state.ui.showRegisterModal).toBe(false);
  });

  it('should handle auth/setSession action', () => {
    const action = {
      type: 'auth/setSession',
      payload: {
        isLoggedIn: true,
        fullName: 'John Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01',
        lastSignInAt: '2024-01-02',
        accountType: 'business',
        userId: '123'
      }
    };
    const state = rootReducer(initialState, action);
    
    expect(state.auth.isLoggedIn).toBe(true);
    expect(state.auth.fullName).toBe('John Doe');
    expect(state.auth.email).toBe('john@example.com');
    expect(state.auth.accountType).toBe('business');
    expect(state.auth.userId).toBe('123');
  });

  it('should handle auth/logout action', () => {
    const loggedInState = {
      ...initialState,
      auth: {
        isLoggedIn: true,
        fullName: 'John Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01',
        lastSignInAt: '2024-01-02',
        accountType: 'business',
        userId: '123'
      }
    };
    const action = { type: 'auth/logout' };
    const state = rootReducer(loggedInState, action);
    
    expect(state.auth.isLoggedIn).toBe(false);
    expect(state.auth.fullName).toBe('');
    expect(state.auth.email).toBe('');
    expect(state.auth.userId).toBe(null);
    expect(state.auth.accountType).toBe('normal');
  });

  it('should handle places/setPlaces action', () => {
    const places = [
      { id: 1, name: 'Place 1', category: 'Bar' },
      { id: 2, name: 'Place 2', category: 'Club' }
    ];
    const action = { type: 'places/setPlaces', payload: places };
    const state = rootReducer(initialState, action);
    
    expect(state.places.list).toEqual(places);
    expect(state.places.list.length).toBe(2);
  });

  it('should handle notifications/setReservations action', () => {
    const reservations = [
      { id: 1, name: 'John', placeName: 'Place 1', status: 'pending' },
      { id: 2, name: 'Jane', placeName: 'Place 2', status: 'confirmed' }
    ];
    const action = {
      type: 'notifications/setReservations',
      payload: { count: 2, details: reservations }
    };
    const state = rootReducer(initialState, action);
    
    expect(state.notifications.reservationNotifications).toBe(2);
    expect(state.notifications.reservationDetails).toEqual(reservations);
    expect(state.notifications.reservationDetails.length).toBe(2);
  });

  it('should not mutate the original state', () => {
    const originalState = { ...initialState };
    const action = { type: 'ui/setCurrentPage', payload: 'profile' };
    const newState = rootReducer(originalState, action);
    
    expect(originalState).toEqual(initialState);
    expect(newState).not.toBe(originalState);
    expect(newState.ui).not.toBe(originalState.ui);
  });

  it('should return unchanged state for unknown action', () => {
    const action = { type: 'unknown/action' };
    const state = rootReducer(initialState, action);
    
    expect(state).toEqual(initialState);
  });
});

