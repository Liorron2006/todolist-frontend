const apiUrl = "http://127.0.0.1:8000/tasks";

document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch(apiUrl);
  const tasks = await res.json();
  tasks.forEach(renderTask);
});

async function addTask() {
  const input = document.getElementById("task-input");
  const taskText = input.value.trim();
  if (taskText === "") {
    alert("אנא הכנס משימה לפני ההוספה.");
    return;
  }

  const task = { title: taskText };
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  const newTask = await res.json();
  renderTask(newTask);
  input.value = "";
}

async function clearAllTasks() {
  const ul = document.getElementById("task-list");
  if (ul.children.length === 0) {
    alert("אין משימות למחיקה.");
    return;
  }

  if (confirm("האם אתה בטוח שברצונך למחוק את כל המשימות?")) {
    ul.innerHTML = "";
    await fetch(apiUrl, { method: "DELETE" });
  }
}

function renderTask(task) {
  const ul = document.getElementById("task-list");
  const li = document.createElement("li");

  const topRow = document.createElement("div");
  topRow.className = "top-row";

  const span = document.createElement("span");
  span.textContent = task.title;

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️ ערוך";
  editBtn.classList.add("edit-btn");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.onclick = async () => {
    ul.removeChild(li);
    await fetch(`${apiUrl}/${task._id}`, { method: "DELETE" });
  };

  const imageBtn = document.createElement("button");
  imageBtn.textContent = "🖼️ הוסף תמונה";
  imageBtn.classList.add("image-btn");
  imageBtn.onclick = async () => {
    const url = prompt("הדבק קישור לתמונה:");
    if (url) {
      await fetch(`${apiUrl}/${task._id}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: url }),
      });

      if (!li.querySelector("img")) {
        const img = document.createElement("img");
        img.src = url;
        img.classList.add("task-image");
        li.appendChild(img);
      } else {
        li.querySelector("img").src = url;
      }
    }
  };

  let isEditing = false;
  let inputBox = null;

  editBtn.onclick = async () => {
    if (!isEditing) {
      inputBox = document.createElement("input");
      inputBox.type = "text";
      inputBox.value = span.textContent;
      inputBox.classList.add("edit-input");

      topRow.insertBefore(inputBox, span);
      topRow.removeChild(span);

      editBtn.textContent = "📂 שמור";
      isEditing = true;
    } else {
      const newTitle = inputBox.value.trim();
      if (newTitle) {
        await fetch(`${apiUrl}/${task._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        span.textContent = newTitle;
        topRow.insertBefore(span, inputBox);
        topRow.removeChild(inputBox);

        editBtn.textContent = "✏️ ערוך";
        isEditing = false;
      }
    }
  };

  topRow.appendChild(span);
  topRow.appendChild(editBtn);
  topRow.appendChild(deleteBtn);
  topRow.appendChild(imageBtn);

  li.appendChild(topRow);

  if (task.image_url) {
    const img = document.createElement("img");
    img.src = task.image_url;
    img.classList.add("task-image");
    li.appendChild(img);
  }

  ul.appendChild(li);
}
