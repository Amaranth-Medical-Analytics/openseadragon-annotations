import { Dispatcher } from 'flux';
import ToolHandler from '../actions/ToolHandler';

const createDispatcher = (model, ...reactions) => {
  const dispatcher = new Dispatcher();
  const toolHandler = new ToolHandler(model);

  reactions.forEach((reaction) => {
    dispatcher.register(reaction(model, toolHandler));
  });
  return (action) => dispatcher.dispatch(action);
};

export default createDispatcher;
