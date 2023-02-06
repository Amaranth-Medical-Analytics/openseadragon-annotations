import { Dispatcher } from 'flux';
import ToolHandler from '../actions/ToolHandler';

/**
 * FLUX ARCHITECTURE
 * 
 * Flux is an application architecture by Meta for client side applications. Flux is not a framework, but
 * a pattern for uni-directional data flow. 
 * 
 * Instead of the traditional Model-View-Controller, Flux applications use a Dispatcher-Store-View architecture.
 * When a React View component is interacted with, the view propagates an action through a central dispatcher, 
 * to the various stores that hold app state and logic. 
 * 
 * In this case, 
 * View - Overlay SVG defined in Overlay.js, and Control buttons defined in Controls.js
 * Store - Model as defined in createModel.js
 * Dispatcher - The createDispatcher function that is called when creating the view, with the model and generalActions
 * passed as props. 
 */

/**
 * Dispatcher
 * Creates a dispatcher based on the Flux architecture. Dispatchers broadcast payloads (actions) to registered
 * callbacks (reactions/generalActions). 
 * Dispatchers are not a pub-sub system, a specific callback is not subscribed to any particular action/event. 
 * Every payload is dispatched to every registered callback. 
 * In this case, the callback (reaction) receives all payloads, and needs to filter for action from within the 
 * callback. 
 * 
 * NOTE: Despite the ...reactions spread operator, only one callback (reactToGeneralAction, imported as 
 * generalActions) is used in this codebase.
 * @param {*} model - An object defining the state to be managed.
 * @param  {...any} reactions - A function detailing state altering callbacks to be dispatched 
 * based on a raised action (payload). 
 * @returns 
 */
const createDispatcher = (model, ...reactions) => {
  const dispatcher = new Dispatcher();
  const toolHandler = new ToolHandler(model);

  reactions.forEach((reaction) => {
    dispatcher.register(reaction(model, toolHandler));
  });
  return (action) => dispatcher.dispatch(action);
};

export default createDispatcher;
