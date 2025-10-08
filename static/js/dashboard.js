// dashboard.js - Dashboard essentials: step completion, routine completion, progress bar

document.addEventListener("DOMContentLoaded", function() {
  // Step completion toggling
  document.querySelectorAll(".step-checkbox").forEach(function(checkbox) {
    checkbox.addEventListener("change", function() {
      const stepId = this.getAttribute("data-step-id");
      if (!stepId) return;

      const isCompleted = this.checked;

      // Send AJAX request to update step completion
      fetch("/routines/toggle-step-completion/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
        },
        body: `step_id=${stepId}&completed=${isCompleted ? "1" : "0"}`
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update progress bar if it exists
          const progressBar = document.querySelector(".progress-bar");
          if (progressBar && data.routine_progress !== undefined) {
            progressBar.style.width = data.routine_progress + "%";
            progressBar.setAttribute("aria-valuenow", data.routine_progress);
            progressBar.textContent = Math.round(data.routine_progress) + "%";
          }
        } else {
          console.error("Failed to update step completion");
          // Revert checkbox state
          this.checked = !isCompleted;
        }
      })
      .catch(error => {
        console.error("Error updating step completion:", error);
        // Revert checkbox state
        this.checked = !isCompleted;
      });
    });
  });

  // Routine completion functionality
  const completeButtons = document.querySelectorAll(".complete-routine-btn");
  completeButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const routineId = this.getAttribute("data-routine-id");
      if (!routineId) return;

      // Send AJAX request to mark routine as completed
      fetch("/routines/complete/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
        },
        body: `routine_id=${routineId}`
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Show success message or update UI
          this.textContent = "Completed!";
          this.disabled = true;
          this.classList.add("btn-success");
          this.classList.remove("btn-primary");
        } else {
          console.error("Failed to complete routine");
        }
      })
      .catch(error => {
        console.error("Error completing routine:", error);
      });
    });
  });
});
