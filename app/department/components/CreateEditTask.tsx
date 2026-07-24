'use client';

import { useState, useEffect } from 'react';

type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

interface TaskFormData {
  taskTitle: string;
  description: string;
  priorityLevel: PriorityLevel;
  assignedStaff: string;
  scheduledDate: string;
  scheduledTime: string;
}

// save task structure
interface SavedTask extends TaskFormData {
  id: string;
  status: 'available' | 'going' | 'done';
}

export default function CreateEditTask() {

  //store task information enter by user
  const [formData, setFormData] = useState<TaskFormData>({
    taskTitle: '',
    description: '',
    priorityLevel: 'Medium',
    assignedStaff: '',
    scheduledDate: '',
    scheduledTime: '',
  });

  // loading state
  const [isLoading, setIsLoading] = useState(false);

  // success message after save
  const [successMessage, setSuccessMessage] = useState('');

  // handle all input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccessMessage('');
  };

  // save data to localstorage
  const handleSaveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');

    // validate require field
    if (!formData.taskTitle.trim()) {
      alert('Please enter a task title');
      return;
    }

    //disable form input while saving
    setIsLoading(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // create new task object with unique task ID
      const newTask: SavedTask = {
        ...formData,
        id: `task-${Date.now()}`,
        status: 'available',
      };

      // Get existing tasks
      const existingTasks = localStorage.getItem('tasks');
      const tasks: SavedTask[] = existingTasks ? JSON.parse(existingTasks) : [];

      // Add new task
      tasks.push(newTask);

      // Save back to localStorage
      localStorage.setItem('tasks', JSON.stringify(tasks));

      console.log('Task saved:', newTask);
      setSuccessMessage('Task saved successfully!');
      
      // Reset form
      setFormData({
        taskTitle: '',
        description: '',
        priorityLevel: 'Medium',
        assignedStaff: '',
        scheduledDate: '',
        scheduledTime: '',
      });

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Failed to save task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // reset form input
  const handleCancel = () => {
    if (
      formData.taskTitle ||
      formData.description ||
      formData.assignedStaff ||
      formData.scheduledDate ||
      formData.scheduledTime
    ) {
      if (confirm('Are you sure you want to discard all changes?')) {
        setFormData({
          taskTitle: '',
          description: '',
          priorityLevel: 'Medium',
          assignedStaff: '',
          scheduledDate: '',
          scheduledTime: '',
        });
        setSuccessMessage('');
      }
    }
  };

  //page design
  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="w-full min-h-screen bg-pink-100 p-8 md:p-10">

        {/* Title */}
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Create / Edit Task Request
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 text-lg bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Task Create Form */}
        <form onSubmit={handleSaveTask} className="space-y-6 max-w-5xl">

          {/* Task Title */}
          <div className="space-y-2">
            <label
              htmlFor="taskTitle"
              className="block text-xl font-bold text-gray-900"
            >
              Task Title
            </label>

            <input
              id="taskTitle"
              type="text"
              name="taskTitle"
              placeholder="Enter your task title"
              value={formData.taskTitle}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-3 text-lg bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-xl font-bold text-gray-900"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={5}
              className="w-full px-4 py-3 text-lg bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <label
              htmlFor="priorityLevel"
              className="block text-xl font-bold text-gray-900"
            >
              Priority Level
            </label>

            <select
              id="priorityLevel"
              name="priorityLevel"
              value={formData.priorityLevel}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-3 text-lg bg-gray-200 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Assigned Staff */}
          <div className="space-y-2">
            <label
              htmlFor="assignedStaff"
              className="block text-xl font-bold text-gray-900"
            >
              Assigned Staff
            </label>

            <input
              id="assignedStaff"
              type="text"
              name="assignedStaff"
              placeholder="Employee ID or Name"
              value={formData.assignedStaff}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-3 text-lg bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Scheduled Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Date */}
            <div className="space-y-2">
              <label
                htmlFor="scheduledDate"
                className="block text-xl font-bold text-gray-900"
              >
                Scheduled Date
              </label>

              <input
                id="scheduledDate"
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-4 py-3 text-lg bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label
                htmlFor="scheduledTime"
                className="block text-xl font-bold text-gray-900"
              >
                Scheduled Time
              </label>

              <div className="flex items-center gap-3">
                <input
                  id="scheduledTime"
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 text-lg bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />

                <span className="text-lg font-semibold text-gray-900">
                  AM/PM
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg font-bold py-3 rounded transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Task'}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-900 text-lg font-bold py-3 rounded border-2 border-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}