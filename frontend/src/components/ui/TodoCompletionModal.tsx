// frontend/src/components/ui/TodoCompletionModal.tsx

// TodoCompletionModal component for managing todo completion status
// Allows users to mark todos as completed and update violation status
// CHANGE: Created new modal component for todo management functionality

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Circle } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

interface Violation {
  id: number;
  student: number;
  student_name: string;
  todos: TodoItem[];
  status: string;
  penalty_status: string;
  description: string;
}

interface TodoCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  violation: Violation | null;
  onUpdate: (violationId: number, updatedTodos: TodoItem[], allCompleted: boolean, penaltyStatus: string) => Promise<void>;
}

const TodoCompletionModal: React.FC<TodoCompletionModalProps> = ({
  isOpen,
  onClose,
  violation,
  onUpdate
}) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [penaltyStatus, setPenaltyStatus] = useState<string>('unpaid');
  const [isUpdating, setIsUpdating] = useState(false);

  // Update todos when violation changes
  useEffect(() => {
    if (violation?.todos) {
      setTodos(violation.todos);
    }
    if (violation?.penalty_status) {
      setPenaltyStatus(violation.penalty_status);
    }
  }, [violation]);

  const handleTodoToggle = (todoId: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === todoId
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  const handleSubmit = async () => {
    if (!violation) return;

    setIsUpdating(true);
    try {
      const allCompleted = todos.every(todo => todo.completed);
      await onUpdate(violation.id, todos, allCompleted, penaltyStatus);
      onClose();
    } catch (error) {
      console.error('Error updating todos:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const allCompleted = completedCount === totalCount;

  if (!isOpen || !violation) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Užduočių atlikimas
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {violation.student_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Payment Status */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Mokestis:</h3>
            <div
              onClick={() => setPenaltyStatus(penaltyStatus === 'paid' ? 'unpaid' : 'paid')}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:shadow-sm ${
                penaltyStatus === 'paid'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div
                className={`mt-0.5 transition-colors ${
                  penaltyStatus === 'paid'
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {penaltyStatus === 'paid' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${
                  penaltyStatus === 'paid'
                    ? 'text-green-800 line-through'
                    : 'text-gray-900'
                }`}>
                  Mokestis apmokėtas
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Aprašymas:</h3>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
              {violation.description}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Užduočių progresas</h3>
              <span className="text-sm text-gray-600">
                {completedCount} / {totalCount} atlikta
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Todos List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Užduotys:</h3>
            {todos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nėra užduočių</p>
            ) : (
              todos.map((todo, index) => (
                <div
                  key={todo.id}
                  onClick={() => handleTodoToggle(todo.id)}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:shadow-sm ${
                    todo.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className={`mt-0.5 transition-colors ${
                      todo.completed
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {todo.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${
                      todo.completed
                        ? 'text-green-800 line-through'
                        : 'text-gray-900'
                    }`}>
                      {index + 1}. {todo.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sukurta: {new Date(todo.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {allCompleted ? (
              <span className="text-green-600 font-medium">
                ✓ Visos užduotys atliktos - skola bus pažymėta kaip išpirkta
              </span>
            ) : (
              <span>
                Atlikta {completedCount} iš {totalCount} užduočių
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Atšaukti
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Išsaugoma...' : 'Atlikta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoCompletionModal;
