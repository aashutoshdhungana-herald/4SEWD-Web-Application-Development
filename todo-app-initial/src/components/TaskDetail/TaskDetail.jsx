import { useState } from "react";

function TaskDetail() {
  const [task, setTask] = useState(null);
  const { text, time, isUrgent } = task;
  return (
    <div>
      <h3>Task Detail</h3>
      <div>
        <span>Title:</span>
        <span>{text}</span>
      </div>
      <div>
        <span>Deadline:</span>
        <span>{time}</span>
      </div>
      <div>
        <span>Is Urgent:</span>
        <span>{isUrgent ? "Yes" : "No"}</span>
      </div>
    </div>
  );
}

export default TaskDetail;
