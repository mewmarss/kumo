import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MoreVertical,
  Plus,
  Calendar,
  Clock,
  Tags,
  User,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description: string;
  user: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  labels: string[];
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanBoard = () => {
  const { data: session } = useSession();
  const [columns, setColumns] = useState<Column[]>([]);
  const [isNewColumnOpen, setIsNewColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    labels: [] as string[],
  });

  useEffect(() => {
    const storedColumns = localStorage.getItem('kanban-columns');
    if (storedColumns) {
      setColumns(JSON.parse(storedColumns));
    } else {
      // Initialize with default columns
      setColumns([
        { id: uuidv4(), title: 'To Do', tasks: [] },
        { id: uuidv4(), title: 'In Progress', tasks: [] },
        { id: uuidv4(), title: 'Done', tasks: [] },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanban-columns', JSON.stringify(columns));
  }, [columns]);

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newColumn = {
      id: uuidv4(),
      title: newColumnTitle,
      tasks: [],
    };
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setIsNewColumnOpen(false);
  };

  const addTask = (columnId: string) => {
    if (!session?.user?.name) {
      alert('You must be logged in to add tasks.');
      return;
    }

    const task: Task = {
      id: uuidv4(),
      title: newTask.title,
      description: newTask.description,
      user: session.user.name,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      labels: newTask.labels,
      createdAt: new Date().toISOString(),
    };

    setColumns(
      columns.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, task] }
          : column
      )
    );

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      labels: [],
    });
    setIsNewTaskOpen(false);
  };

  const deleteTask = (columnId: string, taskId: string) => {
    setColumns(
      columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            }
          : column
      )
    );
  };

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceColumn || !destColumn) return;

    const task = sourceColumn.tasks[source.index];
    const newSourceTasks = [...sourceColumn.tasks];
    newSourceTasks.splice(source.index, 1);

    const newDestTasks = [...destColumn.tasks];
    newDestTasks.splice(destination.index, 0, task);

    setColumns(
      columns.map((column) => {
        if (column.id === source.droppableId) {
          return { ...column, tasks: newSourceTasks };
        }
        if (column.id === destination.droppableId) {
          return { ...column, tasks: newDestTasks };
        }
        return column;
      })
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
        <Button
          onClick={() => setIsNewColumnOpen(true)}
          className="bg-orange-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-80 flex-shrink-0 bg-gray-100 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-700">
                      {column.title}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {column.tasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white"
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-gray-900">
                                  {task.title}
                                </h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        deleteTask(column.id, task.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {task.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                  <User className="w-4 h-4 mr-1" />
                                  {task.user}
                                </div>
                                {task.dueDate && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                                      task.priority
                                    )}`}
                                  >
                                    {task.priority}
                                  </span>
                                  {task.labels.map((label) => (
                                    <span
                                      key={label}
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => {
                      setActiveColumn(column.id);
                      setIsNewTaskOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* New Column Dialog */}
      <Dialog open={isNewColumnOpen} onOpenChange={setIsNewColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter column title"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewColumnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <Textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <select
              className="w-full border rounded-md p-2"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as 'low' | 'medium' | 'high',
                })
              }
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Input
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => activeColumn && addTask(activeColumn)}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
