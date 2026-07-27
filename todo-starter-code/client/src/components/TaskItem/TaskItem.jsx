import "./TaskItem.css";
import { Link } from "react-router";
function TaskItem({ task, index }) {
  return (
    <li
      className={task.isUrgent ? "task-item urgent-task" : "task-item"}
      key={index}
    >
      <span>{task.deadline}</span>-<span>{task.title}</span>
      &nbsp;&nbsp;
      <Link to={`/todo/${task.id}`}>View Details </Link>
    </li>
  );
}

export default TaskItem;
