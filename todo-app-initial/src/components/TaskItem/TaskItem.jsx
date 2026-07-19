import "./TaskItem.css";

function TaskItem({ task, index }) {
  return (
    <li
      className={task.isUrgent ? "task-item urgent-task" : "task-item"}
      key={index}
    >
      <span>{task.time}</span>-<span>{task.text}</span>
    </li>
  );
}

export default TaskItem;
