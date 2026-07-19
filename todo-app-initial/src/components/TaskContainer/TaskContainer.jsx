import { useState, useEffect } from "react";
import TaskItem from "../TaskItem/TaskItem";
import { getTasks } from "../../services/TaskService";
import "./TaskContainer.css";

function TaskContainer({ containerTitle }) {
  const [tasks, setTasks] = useState([]);
  const [filterUrgent, setFilterUrgent] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      let savedTasks = await getTasks();
      setTasks(savedTasks);
    };
    loadTasks();
  }, []);

  const toggleUrgentFilter = () => {
    // This sets the state opposite to the previous value
    setFilterUrgent((prev) => !prev);
  };

  // Filtered tasks is set to all the tasks
  let filteredTasks = tasks;

  // If filterUrgenet state is true then filteredTasks contains only tasks with isUrgent true
  if (filterUrgent) {
    filteredTasks = tasks.filter((x) => x.isUrgent);
  }
  if (tasks.length === 0) {
    return <h2>No Pending Tasks</h2>;
  } else {
    return (
      <>
        <h2>{containerTitle}</h2>
        <div>
          <span>
            <input
              type="checkbox"
              checked={filterUrgent}
              id="urgent-filter"
              onChange={toggleUrgentFilter}
            />
            <label htmlFor="urgent-filter">Filter Urgent</label>
          </span>
        </div>
        <ul>
          {filteredTasks.map((task, index) => (
            <TaskItem task={task} index={index} />
          ))}
        </ul>
      </>
    );
  }
}

export default TaskContainer;
