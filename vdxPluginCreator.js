function vdxPluginCreator(reduxStore, actionTypes) {
  if (!reduxStore.dispatch) {
    throw new Error('vdxPluginCreator expects Redux store as first parameter');
  }
  if (!actionTypes || Object.keys(actionTypes).length<1) {
    throw new Error('vdxPluginCreator expects Action Type Object Constants as second parameter');
  }

  const reduxActions = {};
  const reduxMutations = {};

  Object.keys(actionTypes).forEach((type) => {
    reduxMutations[type] = (state, action) => { }; // Register Action

    reduxActions[type] = ({ dispatch, commit }, action) => {
      reduxStore.dispatch(Object.assign({}, action, { type }));
      commit(type, action);
    };
  });

  return (store) => {
    store.registerModule('redux', {
      state: Object.assign({}, reduxStore.getState()),
      mutations: reduxMutations,
      actions: reduxActions,
    });

    const next = store.dispatch;
    store.dispatch = function (...args) {
      if (typeof args[0] === 'function') {
        args[0](next, store.state, ...args.slice(1));
      } else { 
        next(...args);
      }
    };

    function updateVuex() {
      store.state.redux = Object.assign({}, reduxStore.getState());
    }

    reduxStore.subscribe(updateVuex);
  };
}

module.exports = vdxPluginCreator;
