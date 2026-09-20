import ToDo, { ChildSummary, StatusConfig, TodoDetails, TodoSummary } from './_core'
import defaultStatusConfig, { statusOrder } from './statusConfig'
import CompactTodo from './TodoCompactUI'
import BasicTodo from './TodoUI'

export default ToDo
export {
  type StatusConfig,
  type ChildSummary,
  type TodoSummary,
  type TodoDetails,
  BasicTodo,
  CompactTodo,
  defaultStatusConfig,
  statusOrder,
}
