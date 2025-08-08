document.addEventListener('DOMContentLoaded', () => {
  // Initializing tasks as an empty array
  let tasks = [];

  const categories = {
    'Personal': { name: 'Personal', color: 'blue' },
  };

  // DOM elements
  const categoriesContainer = document.getElementById('categories-container');
  const taskListContainer = document.getElementById('task-list');
  const filterPopupButton = document.getElementById('filter-popup-button');
  const filterPopupMenu = document.getElementById('filter-popup-menu');
  const sidebarToggleButton = document.getElementById('sidebar-toggle-btn');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const liveClock = document.getElementById('live-clock');

  // Floating Action Button elements
  const addFab = document.getElementById('add-fab');
  const addPopupMenu = document.getElementById('add-popup-menu');
  const addTaskBtn = document.getElementById('add-task-btn');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const addIcon = document.getElementById('add-icon');

  // Add Task Modal elements
  const addTaskModal = document.getElementById('add-task-modal');
  const newTaskInput = document.getElementById('new-task-input');
  const newTaskDateInput = document.getElementById('new-task-date-input');
  const cancelTaskBtn = document.getElementById('cancel-task-btn');
  const confirmTaskBtn = document.getElementById('confirm-task-btn');

  let currentFilter = 'all';

  // ====================================================================
  // MESSAGE POPUP UTILITY (SEPARATED FOR ERROR & SUCCESS)
  // ====================================================================

  // Core private function to create and show the message box
  function createMessageBox(message, bgClass) {
    // Prevents multiple messages from appearing at the same time
    if (document.querySelector('.message-box-container')) {
      return;
    }

    const parentContainer = document.createElement('div');
    parentContainer.classList.add(
      'message-box-container',
      'fixed',
      'inset-0',
      'flex',
      'items-start',
      'justify-center',
      'z-50',
      'pointer-events-none'
    );

    const messageBox = document.createElement('div');
    messageBox.classList.add(
      'p-4',
      'rounded-lg',
      'shadow-lg',
      'text-white',
      'duration-500',
      'transform',
      'scale-0',
      'mt-4',
      bgClass
    );

    messageBox.textContent = message;
    parentContainer.appendChild(messageBox);
    document.body.appendChild(parentContainer);

    // Show animation
    setTimeout(() => {
      messageBox.classList.remove('scale-0');
      messageBox.classList.add('scale-100');
    }, 10);

    // Hide animation and cleanup
    setTimeout(() => {
      messageBox.classList.remove('scale-100');
      messageBox.classList.add('scale-0');
      messageBox.addEventListener('transitionend', () => parentContainer.remove());
    }, 3000);
  }

  // Public API for showing different types of messages
  function displayError(message) {
    createMessageBox(message, 'bg-red-500');
  }

  function displaySuccess(message) {
    createMessageBox(message, 'bg-green-500');
  }

  // ====================================================================
  // END OF MESSAGE POPUP UTILITY
  // ====================================================================


  // Function to get filtered tasks
  function getFilteredTasks() {
    if (currentFilter === 'open') {
      return tasks.filter(task => !task.completed);
    } else if (currentFilter === 'closed') {
      return tasks.filter(task => task.completed);
    }
    return tasks;
  }

  // Function to render category cards
  function renderCategories() {
    categoriesContainer.innerHTML = '';
    const categoryCounts = tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = { total: 0, completed: 0 };
      }
      acc[task.category].total++;
      if (task.completed) {
        acc[task.category].completed++;
      }
      return acc;
    }, {});

    for (const catName in categories) {
      const catData = categories[catName];
      const counts = categoryCounts[catName] || { total: 0, completed: 0 };
      const completionPercentage = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;

      const categoryCardHtml = `
                        <div class="bg-gray-100 p-4 rounded-xl flex-1 border-t-4 border-${catData.color}-500">
                            <p class="text-gray-800 font-bold text-lg">${counts.total} tasks</p>
                            <h3 class="text-gray-800 font-bold text-xl mt-1 mb-3">${catData.name}</h3>
                            <div class="w-full bg-gray-200 rounded-full h-1.5">
                                <div class="h-1.5 rounded-full bg-${catData.color}-500 transition-all duration-500" style="width: ${completionPercentage}%"></div>
                            </div>
                        </div>
                    `;
      categoriesContainer.innerHTML += categoryCardHtml;
    }
  }

  // Function to render today's tasks
  function renderTasks() {
    const tasksToRender = getFilteredTasks();
    taskListContainer.innerHTML = '';

    if (tasksToRender.length === 0) {
      // Display message when there are no tasks for the current filter
      const noTasksMessage = document.createElement('div');
      noTasksMessage.className = 'text-center py-10 px-4';
      noTasksMessage.innerHTML = `<p class="text-gray-400">You have no tasks today!</p>`;
      taskListContainer.appendChild(noTasksMessage);
    } else {
      tasksToRender.forEach(task => {
        const categoryColor = categories[task.category].color;
        const isCompleted = task.completed;
        const taskDate = task.date ? `<p class="text-gray-500 text-[9px] mt-1">${task.date}</p>` : '';

        const taskItemHtml = `
                            <div class="task-item bg-gray-100 p-4 rounded-xl flex items-center space-x-4" data-id="${task.id}">
                                <div class="checkbox h-6 w-6 rounded-full border-2 border-${categoryColor}-500 flex items-center justify-center ${isCompleted ? `bg-${categoryColor}-500 text-white` : ''}">
                                    ${isCompleted ? `
                                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    ` : ''}
                                </div>
                                <div class="flex-grow">
                                    <span class="task-text text-gray-800 font-medium ${isCompleted ? 'line-through text-gray-400' : ''}">${task.title}</span>
                                    ${taskDate}
                                </div>
                            </div>
                        `;
        taskListContainer.innerHTML += taskItemHtml;
      });
    }
  }

  // Function to show/hide the Add Task modal
  function showAddTaskModal() {
    addTaskModal.classList.add('show');
    newTaskInput.focus();
    // Set today's date as default
    newTaskDateInput.valueAsDate = new Date();
  }

  function hideAddTaskModal() {
    addTaskModal.classList.remove('show');
    newTaskInput.value = '';
    newTaskDateInput.value = ''; // Clear date input
  }

  // Function to add a new task from the modal
  function addNewTask() {
    const taskName = newTaskInput.value.trim();
    const taskDate = newTaskDateInput.value;
    if (!taskName) {
      displayError('Nama tugas tidak boleh kosong!');
      return;
    }

    const newTask = {
      id: Date.now(), // Simple unique ID
      title: taskName,
      date: taskDate, // Add the selected date
      category: 'Personal', // Default category
      completed: false
    };
    tasks.push(newTask);
    hideAddTaskModal();
    renderAll();
    displaySuccess('Tugas berhasil ditambahkan!');
  }

  // Renders all dynamic sections
  function renderAll() {
    renderCategories();
    renderTasks();
  }

  // Function to update the active filter option in the pop-up
  function updateFilterButtons() {
    document.querySelectorAll('.filter-option').forEach(button => {
      if (button.dataset.filter === currentFilter) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // Function to update the live clock
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    liveClock.textContent = `${hours}:${minutes}`;
  }

  // Initial render
  renderAll();
  updateFilterButtons();
  updateClock();
  setInterval(updateClock, 1000);

  // Event listener for toggling task completion
  taskListContainer.addEventListener('click', (event) => {
    const taskItem = event.target.closest('.task-item');
    if (!taskItem) return;

    const taskId = parseInt(taskItem.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      renderAll();
    }
  });

  // Event listener for the filter pop-up button
  filterPopupButton.addEventListener('click', (event) => {
    event.stopPropagation();
    filterPopupMenu.classList.toggle('hidden');
    hideSidebarMenu();
    hideAddMenu();
  });

  // Event listener for filter options within the pop-up
  filterPopupMenu.addEventListener('click', (event) => {
    const filterButton = event.target.closest('button');
    if (!filterButton) return;

    const newFilter = filterButton.dataset.filter;
    filterPopupMenu.classList.add('hidden');

    if (newFilter === 'delete-all') {
      if (tasks.length > 0) {
        tasks = [];
        renderAll();
        currentFilter = 'all';
        updateFilterButtons();
      }
    } else {
      currentFilter = newFilter;
      updateFilterButtons();
      renderTasks();
    }
  });

  // Floating Action Button logic
  function toggleAddMenu() {
    const isHidden = addPopupMenu.classList.contains('hidden');
    if (isHidden) {
      addPopupMenu.classList.remove('hidden');
      addPopupMenu.offsetWidth; // Force reflow
      addPopupMenu.classList.add('popup-menu-show');
      addIcon.classList.add('add-icon-rotate');
      hideSidebarMenu();
      filterPopupMenu.classList.add('hidden');
    } else {
      hideAddMenu();
    }
  }

  function hideAddMenu() {
    addPopupMenu.classList.remove('popup-menu-show');
    addIcon.classList.remove('add-icon-rotate');
    setTimeout(() => {
      addPopupMenu.classList.add('hidden');
    }, 300);
  }

  addFab.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleAddMenu();
  });

  // Event listener for the floating "Add Task" button
  addTaskBtn.addEventListener('click', () => {
    hideAddMenu();
    showAddTaskModal();
  });

  // Event listener for the "Add Category" button (dummy)
  addCategoryBtn.addEventListener('click', () => {
    hideAddMenu();
    displayError('Fitur ini belum tersedia!');
  });

  // Sidebar Menu functionality
  function toggleSidebarMenu() {
    const isSidebarOpen = sidebarMenu.classList.toggle('sidebar-open');
    sidebarToggleButton.classList.toggle('is-active', isSidebarOpen);
    filterPopupMenu.classList.add('hidden');
    hideAddMenu();
  }

  function hideSidebarMenu() {
    sidebarMenu.classList.remove('sidebar-open');
    sidebarToggleButton.classList.remove('is-active');
  }

  sidebarToggleButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleSidebarMenu();
  });

  // Add Task Modal button events
  cancelTaskBtn.addEventListener('click', hideAddTaskModal);
  confirmTaskBtn.addEventListener('click', addNewTask);
  newTaskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addNewTask();
    }
  });
  newTaskDateInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addNewTask();
    }
  });

  // Unified click handler to close menus when clicking outside
  document.addEventListener('click', (event) => {
    const isClickInsideFilterMenu = filterPopupMenu.contains(event.target) || filterPopupButton.contains(event.target);
    const isClickInsideAddMenu = addPopupMenu.contains(event.target) || addFab.contains(event.target);
    const isClickInsideSidebarMenu = sidebarMenu.contains(event.target) || sidebarToggleButton.contains(event.target);
    const isClickInsideAddTaskModal = addTaskModal.contains(event.target);

    if (!isClickInsideFilterMenu) {
      filterPopupMenu.classList.add('hidden');
    }
    if (!isClickInsideAddMenu) {
      hideAddMenu();
    }
    if (!isClickInsideSidebarMenu) {
      hideSidebarMenu();
    }
    if (isClickInsideAddTaskModal && event.target === addTaskModal) {
      hideAddTaskModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideAddTaskModal();
      hideAddMenu();
      hideSidebarMenu();
      filterPopupMenu.classList.add('hidden');
    }
  });

  // Add functionality to the dummy logout button
  document.getElementById('logout-button').addEventListener('click', () => {
    hideSidebarMenu();
    console.log("Logged out!");
  });
});
