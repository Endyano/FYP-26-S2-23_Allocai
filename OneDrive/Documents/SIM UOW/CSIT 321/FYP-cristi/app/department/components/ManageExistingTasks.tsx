'use client';

import { useState, useEffect } from 'react';

type TaskStatus = 'available' | 'going' | 'done' | 'cancel';

interface Task {
  id: string;
  taskTitle: string;
  title?: string;
  description: string;
  priorityLevel: string;
  assignedStaff: string;
  scheduledDate: string;
  scheduledTime: string;
  status: TaskStatus;
}

export default function ManageExistingTasks() {
  
  // store tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  const availableCount = tasks.filter((t) => t.status === 'available').length;
  const goingCount = tasks.filter((t) => t.status === 'going').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const cancelCount = tasks.filter((t) => t.status === 'cancel').length;

  // track delete task count
  const [deletedCount, setDeletedCount] = useState(0);

  // confirm state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'delete' | 'cancel' | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // load task from localstorage on page load
  useEffect(() => {
    const loadTasks = () => {
      try {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          setTasks(parsedTasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, []);

  //cancel task
  const executeCancel = (id: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, status: 'cancel' as TaskStatus } : t
    );

    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  //delete task
  const executeDelete = (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);

    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));

    setDeletedCount((prev) => prev + 1);
  };

  //confirm action YES
  const handleYes = () => {
    if (!selectedTaskId) return;

    if (confirmType === 'cancel') executeCancel(selectedTaskId);
    if (confirmType === 'delete') executeDelete(selectedTaskId);

    setShowConfirm(false);
    setSelectedTaskId(null);
    setConfirmType(null);
  };

  //confirm modal
  const handleNo = () => {
    setShowConfirm(false);
    setSelectedTaskId(null);
    setConfirmType(null);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'available':
        return 'bg-purple-500 text-white';
      case 'going':
        return 'bg-green-500 text-white';
      case 'done':
        return 'bg-blue-500 text-white';
      case 'cancel':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'going':
        return 'Going';
      case 'done':
        return 'Done';
      case 'cancel':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="w-full min-h-screen bg-pink-100 p-8 md:p-10">

        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Manage Existing Tasks
        </h1>

        <p className="text-1g text-gray-700 mb-6 font-semibold">
          Total Tasks: {tasks.length} |
          Available: {availableCount} |
          Going: {goingCount} |
          Done: {doneCount} |
          Cancelled: {cancelCount} |
          Deleted: {deletedCount}
        </p>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg p-10 shadow-sm text-center">
            <p className="text-2xl font-semibold text-gray-700">
              No Tasks Available
            </p>
          </div>
        ) : (

        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="w-full border-collapse">

            <thead>
              <tr className="bg-gray-300">
                <th className="px-6 py-4 text-left text-xl font-bold text-gray-900 border border-gray-400">Task ID</th>
                <th className="px-6 py-4 text-left text-xl font-bold text-gray-900 border border-gray-400">Title</th>
                <th className="px-6 py-4 text-left text-xl font-bold text-gray-900 border border-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-xl font-bold text-gray-900 border border-gray-400">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.id} className="border-b border-gray-300 hover:bg-gray-50">

                  <td className="px-6 py-5 text-lg font-semibold text-gray-900 border border-gray-300">
                    #{String(index + 1).padStart(3, '0')}
                  </td>

                  <td className="px-6 py-5 text-lg font-semibold text-gray-900 border border-gray-300">
                    {task.taskTitle || task.title || 'Untitled'}
                  </td>

                  <td className="px-6 py-5 border border-gray-300">
                    <span className={`inline-block px-5 py-2 rounded-full text-base font-bold ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </td>

                  <td className="px-6 py-5 border border-gray-300">
                    <div className="flex gap-3 flex-wrap">

                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setConfirmType('cancel');
                          setShowConfirm(true);
                        }}
                        className="bg-orange-400 hover:bg-orange-500 text-white text-base font-bold px-6 py-2 rounded-full"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setConfirmType('delete');
                          setShowConfirm(true);
                        }}
                        className="bg-cyan-400 hover:bg-cyan-500 text-white text-base font-bold px-6 py-2 rounded-full"
                      >
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

        ) 
        }

        {/* cancel and delete button page */}
        {showConfirm && (
          <div className="fixed inset-0 bg-white/10 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-[350px] text-center">

              <h2 className="text-xl font-bold mb-6 text-gray-800">
                {confirmType === 'delete'
                  ? 'Delete this task?'
                  : 'Cancel this task?'}
              </h2>

              <div className="flex justify-center gap-4">

                <button
                  onClick={handleYes}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded"
                >
                  YES
                </button>

                <button
                  onClick={handleNo}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded"
                >
                  NO
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}