document.addEventListener('DOMContentLoaded', () => {
  // Dummy data for tasks and user
  let tasks = [
    { id: 1, title: 'Daily meeting with team', category: 'Business', completed: false },
    { id: 2, title: 'Pay for rent', category: 'Personal', completed: true },
    { id: 3, title: 'Check emails', category: 'Personal', completed: false },
    { id: 4, title: 'Lunch with Emma', category: 'Business', completed: false },
    { id: 5, title: 'Meditation', category: 'Personal', completed: false },
    { id: 6, title: 'Prepare presentation', category: 'Business', completed: true },
    { id: 7, title: 'Grocery shopping', category: 'Personal', completed: false },
    { id: 8, title: 'Call insurance company', category: 'Business', completed: false },
    { id: 9, title: 'Read a chapter of a book', category: 'Personal', completed: true },
    { id: 10, title: 'Write report', category: 'Business', completed: false },
  ];

  const categories = {
    'Business': { name: 'Business', color: 'fuchsia' },
    'Personal': { name: 'Personal', color: 'blue' },
  };

  const user = {
    name: "Joy Doe",
    initials: "JD"
  };

  // DOM elements
  const categoriesContainer = document.getElementById('categories-container');
  const taskListContainer = document.getElementById('task-list');
  const filterPopupButton = document.getElementById('filter-popup-button');
  const filterPopupMenu = document.getElementById('filter-popup-menu');
  const sidebarOpenBtn = document.getElementById('sidebar-open-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const userNameElement = document.getElementById('user-name');
  const userProfileImage = document.getElementById('user-profile-image');

  let currentFilter = 'all';

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
    taskListContainer.innerHTML = '';
    let filteredTasks = tasks;

    if (currentFilter === 'open') {
      filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'closed') {
      filteredTasks = tasks.filter(task => task.completed);
    }

    filteredTasks.forEach(task => {
      const categoryColor = categories[task.category].color;
      const isCompleted = task.completed;

      const taskItemHtml = `
                        <div class="task-item bg-gray-100 p-4 rounded-xl flex items-center space-x-4" data-id="${task.id}">
                            <div class="checkbox h-6 w-6 rounded-full border-2 border-${categoryColor}-500 flex items-center justify-center ${isCompleted ? `bg-${categoryColor}-500 text-white` : ''}">
                                ${isCompleted ? `
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                                ` : ''}
                            </div>
                            <span class="task-text text-gray-800 font-medium ${isCompleted ? 'line-through text-gray-400' : ''}">${task.title}</span>
                        </div>
                    `;
      taskListContainer.innerHTML += taskItemHtml;
    });
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

  // Function to update user information
  function renderUser() {
    userNameElement.textContent = user.name;
    // Update the placeholder image text with user initials
    const placeholderUrl = `https://placehold.co/80x80/f3f4f6/6b7280?text=${user.initials}`;
    userProfileImage.src = placeholderUrl;
    userProfileImage.onerror = () => {
      userProfileImage.src = placeholderUrl;
    };
  }

  // Initial render
  renderCategories();
  renderTasks();
  updateFilterButtons();
  renderUser();

  // Event listener for toggling task completion
  taskListContainer.addEventListener('click', (event) => {
    const taskItem = event.target.closest('.task-item');
    if (!taskItem) return;

    const taskId = parseInt(taskItem.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      // Re-render both sections to reflect the change
      renderCategories();
      renderTasks();
    }
  });

  // Event listener for the filter pop-up button
  filterPopupButton.addEventListener('click', () => {
    filterPopupMenu.classList.toggle('hidden');
  });

  // Event listener for filter options within the pop-up
  filterPopupMenu.addEventListener('click', (event) => {
    const filterButton = event.target.closest('button');
    if (!filterButton) return;

    const newFilter = filterButton.dataset.filter;
    filterPopupMenu.classList.add('hidden'); // Close the menu after a selection

    if (newFilter === 'delete-all') {
      if (tasks.length > 0) {
        // In a real app, you would add a confirmation modal here
        tasks = [];
        renderCategories();
        renderTasks();
        // Reset filter to 'all' after deleting
        currentFilter = 'all';
        updateFilterButtons();
      }
    } else {
      currentFilter = newFilter;
      updateFilterButtons();
      renderTasks();
    }
  });

  // Close the pop-up menu if the user clicks outside of it
  document.addEventListener('click', (event) => {
    if (!filterPopupMenu.contains(event.target) && !filterPopupButton.contains(event.target)) {
      filterPopupMenu.classList.add('hidden');
    }
  });

  // Sidebar Menu functionality
  function openSidebar() {
    sidebarMenu.classList.remove('-translate-x-full');
    sidebarOverlay.classList.remove('hidden');
    setTimeout(() => sidebarOverlay.classList.add('opacity-50'), 10);
  }

  function closeSidebar() {
    sidebarMenu.classList.add('-translate-x-full');
    sidebarOverlay.classList.remove('opacity-50');
    setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
  }

  sidebarOpenBtn.addEventListener('click', openSidebar);
  sidebarCloseBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Add functionality to the dummy logout button
  document.getElementById('logout-button').addEventListener('click', () => {
    // In a real application, you would handle a proper logout process here
    // For this example, we'll just close the sidebar and give a console message
    closeSidebar();
    console.log("Logged out!");
  });
});
